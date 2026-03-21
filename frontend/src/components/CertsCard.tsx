import { ProbeCard } from '@/components/ProbeCard'
import { ProbeState } from '@/hooks/useSSE'

interface Props {
  state: ProbeState
}

export function CertsCard({ state }: Props) {
  const subdomains = state.lines
    .filter((l) => l.startsWith('[crt.sh]') && !l.includes('Found') && !l.includes('unique'))
    .map((l) => l.replace('[crt.sh]', '').trim())

  const count = subdomains.length

  function attackSurface(n: number): { text: string; color: string } | null {
    if (n === 0) return null
    if (n > 50)
      return {
        text: `${n} subdomains found — large attack surface. Each subdomain is a potential entry point.`,
        color: 'text-crimson/60',
      }
    if (n > 10)
      return {
        text: `${n} subdomains found — moderate attack surface.`,
        color: 'text-yellow-400/60',
      }
    return { text: `${n} subdomains found — small footprint.`, color: 'text-green-400/50' }
  }

  const ctx = attackSurface(count)

  return (
    <ProbeCard title="SUBDOMAINS // CRT.SH" status={state.status} color="text-blue-400/50">
      {ctx && <p className={`mb-3 font-mono text-xs ${ctx.color}`}>{ctx.text}</p>}
      <div className="max-h-36 overflow-y-auto space-y-0.5">
        {subdomains.map((sub) => (
          <p key={sub} className="font-mono text-xs text-blue-400/70 truncate">
            <span className="text-white/20 mr-1">›</span>
            {sub}
          </p>
        ))}
      </div>
    </ProbeCard>
  )
}
