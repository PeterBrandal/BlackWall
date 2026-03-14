// Terminal boot sequence shown on first load.
// Each line appears after a fixed delay (simulating a real init process).
// After the last line settles, the parent is notified via onComplete() and
// the whole panel fades out using Framer Motion's AnimatePresence.
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface BootLine {
  text: string
  type: 'system' | 'normal' | 'success' | 'warning'
  delay: number // ms from mount
}

const BOOT_LINES: BootLine[] = [
  { text: 'BLACKWALL INTERFACE // v2.0.77',               type: 'system',  delay: 0    },
  { text: '─────────────────────────────────────────────', type: 'normal',  delay: 200  },
  { text: 'INITIALIZING NEURAL BRIDGE...',                 type: 'normal',  delay: 450  },
  { text: 'PROXY CHAIN: ESTABLISHED [7 HOPS OBFUSCATED]', type: 'success', delay: 800  },
  { text: 'ICE BREAKER MODULE: LOADED',                   type: 'success', delay: 1100 },
  { text: 'OSINT MATRIX: ONLINE',                         type: 'success', delay: 1400 },
  { text: 'DATA SOURCES: 8 / 8 ACTIVE',                   type: 'success', delay: 1650 },
  { text: '─────────────────────────────────────────────', type: 'normal',  delay: 1900 },
  { text: '⚠  NET AUTHORITY MONITORING DETECTED',         type: 'warning', delay: 2150 },
  { text: '⚠  ALL QUERIES LOGGED. PROCEED CAUTIOUSLY.',   type: 'warning', delay: 2400 },
  { text: '─────────────────────────────────────────────', type: 'normal',  delay: 2650 },
  { text: '> SYSTEM READY. AWAITING TARGET INPUT.',        type: 'system',  delay: 2950 },
]

// Map each line type to a Tailwind colour class
const TYPE_CLASS: Record<BootLine['type'], string> = {
  system:  'text-crimson font-bold',
  normal:  'text-crimson-dark opacity-50',
  success: 'text-green-400 opacity-80',
  warning: 'text-yellow-400',
}

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visible, setVisible] = useState<number[]>([])
  const [done, setDone]       = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Reveal each line at its scheduled delay
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisible((v) => [...v, i]), line.delay))
    })

    // After the last line, wait 900 ms then fade out
    const lastDelay = BOOT_LINES[BOOT_LINES.length - 1].delay
    timers.push(
      setTimeout(() => {
        setDone(true)
        setTimeout(onComplete, 500)
      }, lastDelay + 900)
    )

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="flex min-h-screen flex-col items-center justify-center p-6"
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.45 }}
        >
          <div className="clip-corner w-full max-w-xl border border-crimson border-opacity-25 bg-void-light p-8 border-glow">
            <div className="space-y-1">
              {BOOT_LINES.map((line, i) =>
                visible.includes(i) ? (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`font-mono text-xs leading-relaxed ${TYPE_CLASS[line.type]}`}
                  >
                    {line.text}
                  </motion.p>
                ) : null
              )}
            </div>

            {/* Blinking block cursor after the last visible line */}
            <span className="mt-2 inline-block animate-blink text-crimson text-sm">█</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
