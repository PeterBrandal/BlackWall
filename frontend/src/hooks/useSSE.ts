import { useState, useCallback } from 'react'

export type ProbeStatus = 'idle' | 'scanning' | 'done' | 'failed'

export interface ProbeState {
  status: ProbeStatus
  lines: string[]
}

export interface LangEntry {
  name: string
  pct: number
}

const PROBE_NAMES = [
  'ip-api',
  'whois',
  'dns',
  'crt.sh',
  'ssl',
  'redirect',
  'github',
  'headers',
  'gdpr',
]

function initialProbes(): Record<string, ProbeState> {
  return Object.fromEntries(PROBE_NAMES.map((name) => [name, { status: 'idle', lines: [] }]))
}

export function useSSE() {
  const [probes, setProbes] = useState<Record<string, ProbeState>>(initialProbes())
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)
  const [coords, setCoords] = useState<[number, number][]>([])
  const [langs, setLangs] = useState<LangEntry[]>([])

  const startScan = useCallback((target: string) => {
    setProbes(initialProbes())
    setDone(false)
    setScanning(true)
    setCoords([])
    setLangs([])

    const es = new EventSource(`/api/scan?target=${encodeURIComponent(target)}`)

    es.onmessage = (event: MessageEvent) => {
      const text = event.data as string

      if (text === 'SCAN COMPLETE') {
        es.close()
        setScanning(false)
        setDone(true)
        return
      }

      // Geo coordinates
      if (text.startsWith('[geo]')) {
        const [lat, lon] = text.replace('[geo]', '').trim().split(',').map(Number)
        setCoords((prev) => [...prev, [lon, lat]])
        return
      }

      // GitHub language distribution
      if (text.startsWith('[github:langs]')) {
        const raw = text.replace('[github:langs]', '').trim()
        const parsed = raw.split('|').map((item) => {
          const [name, pct] = item.split(':')
          return { name, pct: parseInt(pct) }
        })
        setLangs(parsed)
        return
      }

      // Probe lifecycle events
      if (text.startsWith('[probe:start]')) {
        const probe = text.replace('[probe:start]', '').trim()
        setProbes((prev) => ({
          ...prev,
          [probe]: { ...prev[probe], status: 'scanning' },
        }))
        return
      }

      if (text.startsWith('[probe:done]')) {
        const probe = text.replace('[probe:done]', '').trim()
        setProbes((prev) => ({
          ...prev,
          [probe]: { ...prev[probe], status: 'done' },
        }))
        return
      }

      if (text.startsWith('[probe:fail]')) {
        const probe = text.replace('[probe:fail]', '').trim()
        setProbes((prev) => ({
          ...prev,
          [probe]: { ...prev[probe], status: 'failed' },
        }))
        return
      }

      // Route data lines to the correct probe by prefix e.g. [dns], [whois]
      const match = text.match(/^\[([^\]]+)\]/)
      if (match) {
        const probe = match[1]
        if (PROBE_NAMES.includes(probe)) {
          setProbes((prev) => ({
            ...prev,
            [probe]: {
              ...prev[probe],
              lines: [...(prev[probe]?.lines ?? []), text],
            },
          }))
        }
      }
    }

    es.onerror = () => {
      es.close()
      setScanning(false)
    }
  }, [])

  return { probes, scanning, done, startScan, coords, langs }
}
