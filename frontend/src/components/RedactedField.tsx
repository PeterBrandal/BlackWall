import { motion } from "framer-motion"

interface Props {
  label: string
}

export function RedactedField({ label }: Props) {
  return (
    <div className="mb-2 font-mono text-xs">
      <span className="text-white/20 uppercase tracking-widest">{label}: </span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-block bg-white/10 text-white/10 px-12 py-0.5 select-none"
      >
        ████████████████
      </motion.span>
    </div>
  )
}
