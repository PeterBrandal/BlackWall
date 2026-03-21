import { motion, AnimatePresence } from 'framer-motion'
import { ProbeStatus } from '@/hooks/useSSE'

interface Props {
  title: string
  status: ProbeStatus
  children: React.ReactNode
  color?: string
}

const STATUS_COLORS: Record<ProbeStatus, string> = {
  idle: 'border-white/8  bg-void',
  scanning: 'border-white/15 bg-void',
  done: 'border-crimson/25 bg-void-light',
  failed: 'border-white/8  bg-void',
}

const DOT_COLORS: Record<ProbeStatus, string> = {
  idle: 'bg-white/15',
  scanning: 'bg-yellow-400 animate-pulse',
  done: 'bg-green-400',
  failed: 'bg-crimson/60',
}

const STATUS_LABEL: Record<ProbeStatus, string> = {
  idle: 'STANDBY',
  scanning: 'SCANNING...',
  done: 'COMPLETE',
  failed: 'NO DATA',
}

export function ProbeCard({ title, status, children, color = 'text-white/40' }: Props) {
  return (
    <motion.div
      className={`relative border p-4 clip-corner transition-colors duration-700 ${STATUS_COLORS[status]}`}
      animate={
        status === 'done'
          ? {
              boxShadow: ['0 0 0px #FF003C00', '0 0 12px #FF003C40', '0 0 0px #FF003C00'],
            }
          : {}
      }
      transition={{ duration: 1.2 }}
    >
      {/* Card header */}
      <div className="mb-3 flex items-center justify-between">
        <p className={`font-mono text-xs font-bold tracking-[0.25em] ${color}`}>{title}</p>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[status]}`} />
          <span className="font-mono text-xs text-white/20 tracking-widest">
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3 h-px bg-white/5" />

      {/* Content */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-xs text-white/15 tracking-widest"
          >
            AWAITING SIGNAL...
          </motion.p>
        )}

        {status === 'scanning' && (
          <motion.p
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="animate-pulse font-mono text-xs text-yellow-400/60 tracking-widest"
          >
            DECRYPTING...
          </motion.p>
        )}

        {(status === 'done' || status === 'failed') && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
