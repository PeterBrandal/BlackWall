import { ProbeCard } from "@/components/ProbeCard"
import { ProbeState } from "@/hooks/useSSE"

interface Props {
  state: ProbeState
}

export function RedirectCard({ state }: Props) {
  const hopsLine = state.lines.find((l) => l.includes("Hops         :"))
  const hops = parseInt(hopsLine?.split(":").slice(1).join(":").trim() ?? "0")

  const cdn = state.lines.find((l) => l.includes("CDN          :"))
    ?.split(":").slice(1).join(":").trim()

  const chain = state.lines
    .filter((l) => l.includes("[redirect]") && (l.includes("HOP") || l.includes("FINAL")))
    .map((l) => l.replace("[redirect]", "").trim())

  function hopsContext(n: number): string | null {
    if (n === 0) return null
    if (n === 1) return "Direct connection — no redirects."
    if (n === 2) return "One redirect — typically HTTP → HTTPS."
    return `${n} hops before reaching the final destination.`
  }

  const ctx = hopsContext(hops)

  return (
    <ProbeCard title="REDIRECT CHAIN" status={state.status} color="text-violet-400/50">
      {ctx && (
        <p className="mb-3 font-mono text-xs text-white/30">{ctx}</p>
      )}

      <div className="space-y-1 mb-3">
        {chain.map((hop, i) => (
          <p key={i} className="font-mono text-xs text-violet-400/70 truncate">
            <span className="text-white/20 mr-1">›</span>{hop}
          </p>
        ))}
      </div>

      {cdn && (
        <div className="border-t border-white/5 pt-2">
          <p className="font-mono text-xs text-violet-400/50">
            CDN detected: <span className="text-violet-400/80">{cdn}</span>
          </p>
          <p className="mt-1 font-mono text-xs text-white/25">
            Traffic passes through {cdn} before reaching the origin server — improves speed and provides DDoS protection.
          </p>
        </div>
      )}
    </ProbeCard>
  )
}
