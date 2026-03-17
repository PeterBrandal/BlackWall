import { ProbeCard } from "@/components/ProbeCard"
import { ProbeState } from "@/hooks/useSSE"

interface Props {
  state: ProbeState
}

function parseWhois(lines: string[]) {
  const get = (key: string) =>
    lines.find((l) => l.includes(key))?.split(":").slice(1).join(":").trim() ?? "—"

  return {
    registrar:   get("Registrar  :"),
    created:     get("Created    :"),
    expires:     get("Expires    :"),
    updated:     get("Updated    :"),
    nameservers: lines
      .filter((l) => l.includes("Nameserver :"))
      .map((l) => l.split(":").slice(1).join(":").trim()),
  }
}

function domainAgeContext(created: string): { text: string; color: string } | null {
  if (created === "—") return null
  const age = Date.now() - new Date(created).getTime()
  const days = age / (1000 * 60 * 60 * 24)
  if (days < 90)  return { text: "Registered less than 3 months ago — treat with caution.", color: "text-crimson/70" }
  if (days < 365) return { text: "Registered less than a year ago — relatively new domain.", color: "text-yellow-400/60" }
  if (days > 365 * 10) return { text: "Established domain — registered over 10 years ago.", color: "text-green-400/60" }
  return null
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-xs">
      <span className="text-white/25 tracking-widest shrink-0">{label}</span>
      <span className="text-yellow-400/80 text-right">{value}</span>
    </div>
  )
}

export function WhoisCard({ state }: Props) {
  const w = parseWhois(state.lines)
  const ageCtx = domainAgeContext(w.created)

  return (
    <ProbeCard title="WHOIS // DOMAIN REGISTRY" status={state.status} color="text-yellow-400/50">
      <div className="space-y-1.5 mb-3">
        <Field label="REGISTRAR" value={w.registrar} />
        <Field label="CREATED"   value={w.created} />
        <Field label="EXPIRES"   value={w.expires} />
        <Field label="UPDATED"   value={w.updated} />
      </div>

      {ageCtx && (
        <p className={`mb-3 font-mono text-xs ${ageCtx.color}`}>{ageCtx.text}</p>
      )}

      {w.nameservers.length > 0 && (
        <div className="border-t border-white/5 pt-2">
          <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">NAMESERVERS</p>
          {w.nameservers.map((ns) => (
            <p key={ns} className="font-mono text-xs text-yellow-400/60">{ns}</p>
          ))}
        </div>
      )}
    </ProbeCard>
  )
}
