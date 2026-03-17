import { motion, AnimatePresence } from "framer-motion"
import { ProbeState } from "@/hooks/useProfile"

interface Props {
  name: string
  probes: Record<string, ProbeState>
}

const PROBE_LABELS: Record<string, string> = {
  github: "GITHUB",
  brreg:  "BRREG.NO",
  wayback: "WAYBACK MACHINE",
}

function ProbeRow({ label, state }: { label: string; state: ProbeState }) {
  const barCount = 10

  const filledBars =
    state.status === "idle"     ? 0  :
    state.status === "scanning" ? 5  :
    state.status === "done"     ? 10 :
    state.status === "failed"   ? 3  : 0

  const statusText =
    state.status === "idle"     ? "STANDBY"      :
    state.status === "scanning" ? "DECRYPTING..." :
    state.status === "done"     ? "COMPLETE"      :
    state.status === "failed"   ? "FAILED"        : ""

  const statusColor =
    state.status === "done"   ? "text-green-400" :
    state.status === "failed" ? "text-crimson"   :
    state.status === "scanning" ? "text-yellow-400 animate-pulse" :
    "text-white/20"

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 font-mono text-sm"
    >
      {/* Probe name */}
      <span className="w-24 text-right text-white/40">{label}</span>

      {/* Progress bar */}
      <div className="flex gap-0.5">
        {Array.from({ length: barCount }).map((_, i) => (
          <motion.span
            key={i}
            className="inline-block h-3 w-2.5"
            animate={{
              backgroundColor:
                i < filledBars ? "#FF003C" : "#1a1a1a",
            }}
            transition={{ duration: 0.1, delay: i * 0.05 }}
          />
        ))}
      </div>

      {/* Status text */}
      <span className={`w-32 ${statusColor}`}>{statusText}</span>
    </motion.div>
  )
}

export function ScanningOverlay({ name, probes }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-void"
    >
      {/* Header */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2 font-mono text-xs tracking-[0.4em] text-crimson/50"
      >
        BLACKWALL // PROFILE COMPILATION
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10 font-mono text-lg tracking-widest text-white/80"
      >
        TARGET: <span className="text-crimson">{name.toUpperCase()}</span>
      </motion.p>

      {/* Probe rows */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {Object.entries(PROBE_LABELS).map(([key, label]) => (
            <ProbeRow
              key={key}
              label={label}
              state={probes[key] ?? { status: "idle", lines: [] }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-14 font-mono text-xs text-white/15"
      >
        COMPILING DOSSIER...
      </motion.p>
    </motion.div>
  )
}
