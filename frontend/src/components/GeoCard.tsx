import { ProbeCard } from '@/components/ProbeCard'
import { ProbeState } from '@/hooks/useSSE'
import MapView from '@/components/MapView'

interface Props {
  state: ProbeState
  coords: [number, number][]
}

const CLOUD_PROVIDERS = [
  'Amazon',
  'Google',
  'Microsoft',
  'Cloudflare',
  'Akamai',
  'Fastly',
  'DigitalOcean',
  'Hetzner',
  'OVH',
  'Linode',
]

function parseGeo(lines: string[]) {
  const get = (key: string) =>
    lines
      .find((l) => l.includes(key))
      ?.split(':')
      .slice(1)
      .join(':')
      .trim() ?? '—'

  return {
    ip: get('IP       :'),
    location: get('Location :'),
    isp: get('ISP      :'),
    org: get('Org      :'),
    timezone: get('Timezone :'),
  }
}

function hostingContext(isp: string, org: string): string | null {
  const haystack = `${isp} ${org}`.toLowerCase()
  for (const provider of CLOUD_PROVIDERS) {
    if (haystack.includes(provider.toLowerCase())) {
      return `Hosted on ${provider} infrastructure — the website runs on a major cloud provider, not a private server.`
    }
  }
  return null
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-xs">
      <span className="text-white/25 tracking-widest shrink-0">{label}</span>
      <span className="text-green-400/80 text-right">{value}</span>
    </div>
  )
}

export function GeoCard({ state, coords }: Props) {
  const geo = parseGeo(state.lines)
  const ctx = hostingContext(geo.isp, geo.org)

  return (
    <ProbeCard title="GEOLOCATION // IP-API" status={state.status} color="text-green-400/50">
      <div className="space-y-1.5 mb-3">
        <Field label="IP" value={geo.ip} />
        <Field label="LOCATION" value={geo.location} />
        <Field label="ISP" value={geo.isp} />
        <Field label="ORG" value={geo.org} />
        <Field label="TIMEZONE" value={geo.timezone} />
      </div>

      {ctx && <p className="mb-3 font-mono text-xs text-green-400/50">{ctx}</p>}

      {coords.length > 0 && (
        <div className="h-40 w-full overflow-hidden border border-white/8">
          <MapView coords={coords} />
        </div>
      )}
    </ProbeCard>
  )
}
