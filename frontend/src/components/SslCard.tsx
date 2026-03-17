import { ProbeCard } from "@/components/ProbeCard"
import { ProbeState } from "@/hooks/useSSE"

interface Props {
  state: ProbeState
}

function get(lines: string[], key: string) {
  return lines.find((l) => l.includes(key))?.split(":").slice(1).join(":").trim() ?? "—"
}

function expiryContext(daysLeft: number): { text: string; color: string } {
  if (daysLeft < 0)  return { text: "Certificate has expired — site may show security warnings.", color: "text-crimson" }
  if (daysLeft < 14) return { text: `Expires in ${daysLeft} days — critical, renewal needed immediately.`, color: "text-crimson/80" }
  if (daysLeft < 30) return { text: `Expires in ${daysLeft} days — renew soon.`, color: "text-yellow-400/70" }
  if (daysLeft < 90) return { text: `Expires in ${daysLeft} days.`, color: "text-yellow-400/50" }
  return { text: `Valid for ${daysLeft} more days.`, color: "text-green-400/60" }
}

function issuerContext(issuer: string): string | null {
  if (issuer.toLowerCase().includes("let's encrypt") || issuer.toLowerCase().includes("lets encrypt"))
    return "Issued by Let's Encrypt — free, auto-renewed certificate. Common for smaller sites."
  if (issuer.toLowerCase().includes("digicert"))
    return "Issued by DigiCert — commercial CA, common for enterprise sites."
  if (issuer.toLowerCase().includes("comodo") || issuer.toLowerCase().includes("sectigo"))
    return "Issued by Sectigo — commercial certificate authority."
  return null
}

function Field({ label, value, valueColor = "text-orange-400/80" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-xs">
      <span className="text-white/25 tracking-widest shrink-0">{label}</span>
      <span className={`text-right ${valueColor}`}>{value}</span>
    </div>
  )
}

export function SslCard({ state }: Props) {
  const cn      = get(state.lines, "Common Name  :")
  const issuer  = get(state.lines, "Issuer       :")
  const expires = get(state.lines, "Expires      :")
  const daysRaw = get(state.lines, "Days Left    :")
  const daysLeft = parseInt(daysRaw)

  const sans = state.lines
    .filter((l) => l.includes("SAN          :"))
    .map((l) => l.split(":").slice(1).join(":").trim())

  const expCtx    = !isNaN(daysLeft) ? expiryContext(daysLeft) : null
  const issuerCtx = issuerContext(issuer)

  const daysColor = !expCtx ? "text-orange-400/80"
    : daysLeft < 14 ? "text-crimson"
    : daysLeft < 30 ? "text-yellow-400"
    : "text-green-400/80"

  return (
    <ProbeCard title="SSL / TLS CERTIFICATE" status={state.status} color="text-orange-400/50">
      <div className="space-y-1.5 mb-3">
        <Field label="COMMON NAME" value={cn} />
        <Field label="ISSUER"      value={issuer} />
        <Field label="EXPIRES"     value={expires} />
        <Field label="DAYS LEFT"   value={daysRaw} valueColor={daysColor} />
      </div>

      {expCtx && (
        <p className={`mb-2 font-mono text-xs ${expCtx.color}`}>{expCtx.text}</p>
      )}
      {issuerCtx && (
        <p className="mb-3 font-mono text-xs text-white/25">{issuerCtx}</p>
      )}

      {sans.length > 0 && (
        <div className="border-t border-white/5 pt-2">
          <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">ALT NAMES</p>
          {sans.map((san) => (
            <p key={san} className="font-mono text-xs text-orange-400/50 truncate">{san}</p>
          ))}
        </div>
      )}
    </ProbeCard>
  )
}
