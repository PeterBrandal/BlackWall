import { motion } from "framer-motion"

interface Props {
  name: string
  emails: string[]
  caseNumber: string
}

export function CaseFileHeader({ name, emails, caseNumber }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-6 flex gap-6 border border-crimson/20 bg-void-light p-5 clip-corner"
    >
      {/* Confidential stamp — top right */}
      <div className="absolute right-5 top-5 rotate-[-12deg] border-2 border-crimson/40 px-3 py-1">
        <p className="font-mono text-xs font-bold tracking-[0.3em] text-crimson/40">
          CONFIDENTIAL
        </p>
      </div>

      {/* Mugshot placeholder */}
      <div className="flex h-28 w-24 shrink-0 flex-col items-center justify-center border border-white/10 bg-void">
        <div className="mb-1 h-10 w-10 rounded-full border border-white/10 bg-white/5" />
        <div className="h-6 w-14 border-t border-white/10 bg-white/5" />
        <p className="mt-2 font-mono text-xs text-white/15 tracking-widest">
          NO PHOTO
        </p>
      </div>

      {/* Subject info */}
      <div className="flex flex-col justify-center gap-2">
        <p className="font-mono text-xs tracking-[0.4em] text-crimson/40">
          CASE NO: {caseNumber}
        </p>

        <p className="font-mono text-2xl font-bold tracking-widest text-white/90">
          {name.toUpperCase()}
        </p>

        <div className="mt-1 font-mono text-xs text-white/30">
          <p className="mb-1 tracking-widest text-white/20">EMAIL CANDIDATES:</p>
          {emails.slice(0, 4).map((email) => (
            <p key={email} className="text-crimson/50">{email}</p>
          ))}
          {emails.length > 4 && (
            <p className="text-white/15">+{emails.length - 4} more</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
