import { ProbeCard } from "@/components/ProbeCard"
import { ProbeState } from "@/hooks/useSSE"

interface Props {
  state: ProbeState
}

const MX_PROVIDERS: Record<string, string> = {
  "google":     "Google Workspace",
  "googlemail": "Google Workspace",
  "outlook":    "Microsoft 365",
  "microsoft":  "Microsoft 365",
  "mailgun":    "Mailgun",
  "sendgrid":   "SendGrid",
  "amazonses":  "Amazon SES",
  "protonmail": "ProtonMail",
}

function parseDns(lines: string[]) {
  const records: Record<string, string[]> = { A: [], MX: [], NS: [] }
  for (const line of lines) {
    for (const type of ["A", "MX", "NS"]) {
      if (line.includes(`[dns] ${type.padEnd(3)} :`)) {
        const value = line.split(":").slice(1).join(":").trim()
        if (value && value !== "—") records[type].push(value)
      }
    }
  }
  return records
}

function mxContext(mxRecords: string[]): string | null {
  const combined = mxRecords.join(" ").toLowerCase()
  for (const [key, name] of Object.entries(MX_PROVIDERS)) {
    if (combined.includes(key)) return `Email is handled by ${name}.`
  }
  return mxRecords.length > 0 ? "Custom mail server configured." : null
}

function RecordGroup({ type, values, color }: { type: string; values: string[]; color: string }) {
  if (!values.length) return null
  return (
    <div className="mb-2">
      <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">{type}</p>
      {values.map((v) => (
        <p key={v} className={`font-mono text-xs ${color} truncate`}>{v}</p>
      ))}
    </div>
  )
}

export function DnsCard({ state }: Props) {
  const records = parseDns(state.lines)
  const mx = mxContext(records.MX)
  const multipleA = records.A.length > 1

  return (
    <ProbeCard title="DNS RECORDS" status={state.status} color="text-cyan-400/50">
      <RecordGroup type="A"  values={records.A}  color="text-cyan-400/80" />
      {multipleA && (
        <p className="mb-2 font-mono text-xs text-cyan-400/40">
          Multiple A records — site uses load balancing or redundancy.
        </p>
      )}
      <RecordGroup type="MX" values={records.MX} color="text-cyan-400/60" />
      {mx && <p className="mb-2 font-mono text-xs text-cyan-400/40">{mx}</p>}
      <RecordGroup type="NS" values={records.NS} color="text-cyan-400/50" />
    </ProbeCard>
  )
}
