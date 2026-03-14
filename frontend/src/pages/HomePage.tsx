// Main landing page — the breach terminal.
// Layout: system ID line → glitch title → divider → target input → probe grid → footer.
// Everything fades/slides in with staggered delays after the boot sequence completes.
import { motion, AnimatePresence } from 'framer-motion'
import { GlitchTitle } from '@/components/GlitchTitle'
import { TargetInput } from '@/components/TargetInput'
import { ProbeStatusGrid } from '@/components/ProbeStatusGrid'
import { useSSE } from '@/hooks/useSSE'
import MapView from '@/components/MapView'
import { useState, useRef } from 'react'

interface HomePageProps {
  onInitiateBreach?: (target: string) => void
}

export function HomePage({ onInitiateBreach }: HomePageProps) {
  const { lines, scanning, done, startScan, coords } = useSSE()
  const [hasScanned, setHasSanned] = useState(false)
  const scanKey = useRef(0)


  const handleBreach = (target: string) => {
    scanKey.current += 1
    setHasSanned(true)
    startScan(target)
    onInitiateBreach?.(target)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-20"
    >
      {/* ── Hero block ─────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center text-center">

        {/* System identifier above the title */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 font-mono text-xs tracking-[0.45em] text-crimson opacity-50"
        >
          SYS://BREACH.INIT.V2.0.77
        </motion.p>

        {/* The glitching title — the visual centrepiece */}
        <GlitchTitle text="BLACKWALL" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 font-mono text-sm tracking-[0.25em] text-crimson-dark opacity-60"
        >
          NETRUNNER OSINT PROTOCOL
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 h-px w-40 origin-center bg-crimson opacity-30"
        />
      </div>

      {/* ── Target input ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mb-10 w-full max-w-2xl"
      >
        <TargetInput onSubmit={handleBreach} />
      </motion.div>
      {/* Terminal output — only renders once a scan has started */}
      {hasScanned && (
        <motion.div
          className="w-full max-w-5xl border border-crimson/20 bg-void-light clip-corner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header bar */}
          <div className="border-b border-crimson/20 px-4 py-2 font-mono text-xs text-crimson/40 flex justify-between">
            <span>BREACH TERMINAL</span>
            {done && <span className="text-green-400">SCAN COMPLETE</span>}
            {scanning && <span className="animate-blink">SCANNING...</span>}
          </div>

          {/* Body — terminal left, map right */}
          <div className="flex min-h-64">

            {/* Terminal */}
            <div className="flex-1 p-4 font-mono text-sm border-r border-crimson/20 overflow-y-auto max-h-80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scanKey.current}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {lines.map((line) => (
                    <p key={line.id} className="text-crimson/80">&gt; {line.text}</p>
                  ))}
                  {scanning && <span className="animate-blink text-crimson">█</span>}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Map — slides in once */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "45%", opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="shrink-0 overflow-hidden"
            >
              <MapView coords={coords} />
            </motion.div>

          </div>
        </motion.div>
      )}
      {/* ── Probe matrix ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05 }}
      >
        <ProbeStatusGrid />
      </motion.div>

      {/* ── Footer ───────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-14 border-t border-crimson border-opacity-10 pt-6 text-center"
      >
        <p className="font-mono text-xs text-crimson-dark opacity-35">
          ⚠ &nbsp; ALL DATA IS PUBLICLY AVAILABLE. EDUCATIONAL USE ONLY. &nbsp; ⚠
        </p>
        <p className="mt-1 font-mono text-xs text-crimson-dark opacity-18">
          BLACKWALL // BUILT FOR THE NET. STAY GHOST.
        </p>
      </motion.footer>
    </motion.main>
  )
}
