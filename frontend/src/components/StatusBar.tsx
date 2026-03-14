// Fixed top status bar — shows the app identifier, live system status pills,
// and a real-time clock. Fades in after the boot sequence completes.
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Wifi, ShieldCheck, Cpu } from 'lucide-react'

interface StatusPill {
  icon: ReactNode
  label: string
  state: 'active' | 'warning' | 'offline'
}

const PILLS: StatusPill[] = [
  { icon: <Wifi size={10} />,        label: 'NEURAL LINK', state: 'active' },
  { icon: <ShieldCheck size={10} />, label: 'PROXY',       state: 'active' },
  { icon: <Cpu size={10} />,         label: 'ICE BREAKER', state: 'active' },
]

const STATE_COLOR: Record<StatusPill['state'], string> = {
  active:  'text-green-400',
  warning: 'text-yellow-400',
  offline: 'text-crimson',
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function StatusBar() {
  const now = useClock()

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 right-0 top-0 z-40 border-b border-crimson border-opacity-20 bg-void bg-opacity-90 px-5 py-2 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">

        {/* App identity */}
        <div className="flex items-center gap-2">
          <span className="text-glow text-xs font-bold tracking-[0.3em] text-crimson">BLACKWALL</span>
          <span className="text-xs text-crimson-dark opacity-30">//</span>
          <span className="text-xs text-crimson-dark opacity-30 hidden sm:inline">SYS.OSINT.BREACH</span>
        </div>

        {/* Status pills — each dot pulses independently */}
        <div className="flex items-center gap-5">
          {PILLS.map((pill) => (
            <div key={pill.label} className="flex items-center gap-1.5">
              <motion.span
                className={STATE_COLOR[pill.state]}
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ◆
              </motion.span>
              <span className="text-xs text-crimson-dark opacity-50 hidden sm:inline">{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Live clock */}
        <div className="font-mono text-xs text-crimson opacity-60 tabular-nums">
          {now.toTimeString().slice(0, 8)}
        </div>

      </div>
    </motion.header>
  )
}
