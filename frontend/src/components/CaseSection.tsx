import { motion, AnimatePresence } from "framer-motion"
import { ProbeStatus } from "@/hooks/useProfile"

interface Props {
  title: string
  status: ProbeStatus
  children: React.ReactNode
  redactedFields?: string[]
}

export function CaseSection({ title, status, children, redactedFields = [] }: Props) {
  const isLocked  = status === "idle" || status === "scanning"
  const isFailed  = status === "failed"
  const isUnlocked = status === "done"

  return (
    <motion.div
      className={[
        "relative border p-4 clip-corner",
        isUnlocked ? "border-crimson/30 bg-void-light"  : "",
        isFailed   ? "border-white/5  bg-void"          : "",
        isLocked   ? "border-white/10 bg-void"          : "",
      ].join(" ")}
      animate={{
        borderColor: isUnlocked
          ? ["#FF003C", "#FF003C80", "#FF003C30"]
          : undefined,
      }}
      transition={{ duration: 1.2, times: [0, 0.3, 1] }}
    >
      {/* Section title */}
      <p className={[
        "mb-3 font-mono text-xs font-bold tracking-[0.3em]",
        isUnlocked ? "text-crimson/60" : "text-white/15",
      ].join(" ")}>
        {title}
      </p>

      {/* Unlocked content */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failed — redacted fields */}
      {isFailed && (
        <div>
          {redactedFields.map((field) => (
            <div key={field} className="mb-2 font-mono text-xs">
              <span className="text-white/20 uppercase tracking-widest">{field}: </span>
              <span className="inline-block bg-white/10 text-white/10 px-12 py-0.5 select-none">
                ████████████████
              </span>
            </div>
          ))}
          <p className="mt-3 font-mono text-xs text-crimson/40 tracking-widest">
            ⚠ ACCESS DENIED
          </p>
        </div>
      )}

      {/* Locked/scanning — pulsing placeholder */}
      {isLocked && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-mono text-xs text-white/15 tracking-widest"
        >
          {status === "scanning" ? "DECRYPTING..." : "AWAITING DATA..."}
        </motion.div>
      )}
    </motion.div>
  )
}
