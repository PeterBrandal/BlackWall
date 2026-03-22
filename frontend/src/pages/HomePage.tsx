import { motion, AnimatePresence } from 'framer-motion'
import { GlitchTitle } from '@/components/GlitchTitle'
import { TargetInput } from '@/components/TargetInput'
import { ProbeStatusGrid } from '@/components/ProbeStatusGrid'
import { GeoCard } from '@/components/GeoCard'
import { WhoisCard } from '@/components/WhoisCard'
import { DnsCard } from '@/components/DnsCard'
import { CertsCard } from '@/components/CertsCard'
import { SslCard } from '@/components/SslCard'
import { RedirectCard } from '@/components/RedirectCard'
import { GitHubCard } from '@/components/GitHubCard'
import { HeadersCard } from '@/components/HeadersCard'
import { GdprCard } from '@/components/GdprCard'
import { useSSE } from '@/hooks/useSSE'
import { useRef, useState } from 'react'

export function HomePage() {
  const { probes, scanning, done, startScan, coords, langs } = useSSE()
  const [hasScanned, setHasScanned] = useState(false)
  const scanKey = useRef(0)

  const handleBreach = (target: string) => {
    scanKey.current += 1
    setHasScanned(true)
    startScan(target)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-16 pt-20"
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 font-mono text-xs tracking-[0.45em] text-crimson opacity-50"
        >
          SYS://BREACH.INIT.V2.0.77
        </motion.p>

        <GlitchTitle text="BLACKWALL" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 font-mono text-sm tracking-[0.25em] text-crimson-dark opacity-60"
        >
          NETRUNNER OSINT PROTOCOL
        </motion.p>

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

      {/* ── Scan status ─────────────────────────────────── */}
      {hasScanned && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 font-mono text-xs tracking-widest"
        >
          {scanning && <span className="animate-pulse text-yellow-400">SCANNING...</span>}
          {done && <span className="text-green-400">SCAN COMPLETE</span>}
        </motion.div>
      )}

      {/* ── Probe cards grid ────────────────────────────── */}
      <AnimatePresence>
        {hasScanned && (
          <motion.div
            key={scanKey.current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <GeoCard state={probes['ip-api']} coords={coords} />
            <WhoisCard state={probes['whois']} />
            <DnsCard state={probes['dns']} />
            <CertsCard state={probes['crt.sh']} />
            <SslCard state={probes['ssl']} />
            <RedirectCard state={probes['redirect']} />
            <GitHubCard state={probes['github']} langs={langs} />
            <div className="sm:col-span-2">
              <HeadersCard state={probes['headers']} />
            </div>
            <div className="sm:col-span-2">
              <GdprCard state={probes['gdpr']} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Probe matrix ─────────────────────────────────── */}
      {!hasScanned && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mt-10"
        >
          <ProbeStatusGrid />
        </motion.div>
      )}

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
          BLACKWALL // BUILT FOR THE NET.
        </p>
      </motion.footer>
    </motion.main>
  )
}
