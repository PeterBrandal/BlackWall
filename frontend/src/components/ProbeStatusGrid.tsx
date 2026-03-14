// Displays all OSINT data sources (probes) in a grid with their status
// and which input types they accept. Cards animate in with a stagger.
import { motion } from 'framer-motion'

type ProbeStatus = 'active' | 'requires-key' | 'degraded'

interface Probe {
  id: string
  name: string
  description: string
  accepts: string[]
  status: ProbeStatus
}

const PROBES: Probe[] = [
  { id: 'hibp',        name: 'HIBP',        description: 'Email breach history',          accepts: ['EMAIL'],            status: 'requires-key' },
  { id: 'ipapi',       name: 'IP-API',       description: 'Geolocation & ASN lookup',      accepts: ['IP'],               status: 'active'       },
  { id: 'virustotal',  name: 'VIRUSTOTAL',   description: 'IP / domain threat intel',      accepts: ['IP', 'DOMAIN'],     status: 'requires-key' },
  { id: 'crtsh',       name: 'CRT.SH',       description: 'Certificate transparency logs', accepts: ['DOMAIN'],           status: 'active'       },
  { id: 'github',      name: 'GITHUB',       description: 'Public repos & commit emails',  accepts: ['USERNAME', 'EMAIL'], status: 'active'      },
  { id: 'gravatar',    name: 'GRAVATAR',     description: 'Profile image via email hash',  accepts: ['EMAIL'],            status: 'active'       },
  { id: 'serpapi',     name: 'SERPAPI',      description: 'Web mentions for a name',       accepts: ['NAME'],             status: 'requires-key' },
  { id: 'reddit',      name: 'REDDIT',       description: 'Public post history',           accepts: ['USERNAME'],         status: 'active'       },
]

const STATUS_CFG: Record<ProbeStatus, { label: string; dot: string; text: string }> = {
  'active':       { label: 'ONLINE',   dot: 'bg-green-400',   text: 'text-green-400'  },
  'requires-key': { label: 'KEY REQ',  dot: 'bg-yellow-400',  text: 'text-yellow-400' },
  'degraded':     { label: 'DEGRADED', dot: 'bg-orange-500',  text: 'text-orange-500' },
}

// Framer Motion stagger: parent triggers children one after another
const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ProbeStatusGrid() {
  return (
    <div className="w-full max-w-3xl">
      <p className="mb-3 font-mono text-xs font-bold tracking-[0.3em] text-crimson-dark opacity-40">
        PROBE MATRIX // DATA SOURCES
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {PROBES.map((probe) => {
          const cfg = STATUS_CFG[probe.status]
          return (
            <motion.div
              key={probe.id}
              variants={itemVariants}
              className={[
                'clip-corner-sm border border-crimson border-opacity-12 bg-void-light p-3',
                'transition-all duration-200',
                'hover:border-opacity-50 hover:border-glow cursor-default',
              ].join(' ')}
            >
              {/* Status dot + probe name */}
              <div className="mb-1.5 flex items-center gap-2">
                <motion.span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="font-mono text-xs font-bold text-white opacity-80">
                  {probe.name}
                </span>
              </div>

              {/* Description */}
              <p className="mb-2 font-mono text-xs leading-tight text-crimson-dark opacity-45">
                {probe.description}
              </p>

              {/* Accepted input types */}
              <div className="flex flex-wrap gap-1">
                {probe.accepts.map((tag) => (
                  <span
                    key={tag}
                    className="border border-crimson border-opacity-20 px-1 py-px font-mono text-xs text-crimson opacity-55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
