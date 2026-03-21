import { ProbeCard } from '@/components/ProbeCard'
import { ProbeState } from '@/hooks/useSSE'

interface Props {
  state: ProbeState
}

const EXPLANATIONS: Record<string, string> = {
  'strict-transport-security': 'Forces HTTPS. Missing = SSL stripping attacks possible.',
  'content-security-policy': 'Controls which resources load. Missing = XSS risk.',
  'x-frame-options': 'Blocks iframe embedding. Missing = clickjacking risk.',
  'x-content-type-options': 'Prevents MIME sniffing. Missing = content confusion attacks.',
  'referrer-policy': 'Controls referrer header. Missing = URL data leaked to third parties.',
  'permissions-policy': 'Limits browser APIs. Missing = unrestricted camera/mic/location.',
}

export function HeadersCard({ state }: Props) {
  const server = state.lines
    .find((l) => l.includes('Server  :'))
    ?.split(':')
    .slice(1)
    .join(':')
    .trim()
  const powered = state.lines
    .find((l) => l.includes('Powered :'))
    ?.split(':')
    .slice(1)
    .join(':')
    .trim()

  const present = state.lines
    .filter((l) => l.includes('✓'))
    .map((l) => l.replace('[headers]', '').trim().replace('✓ ', ''))

  const missing = state.lines
    .filter((l) => l.includes('✗ MISSING:'))
    .map((l) => l.replace('[headers]', '').trim().replace('✗ MISSING: ', ''))

  return (
    <ProbeCard title="HTTP SECURITY HEADERS" status={state.status} color="text-pink-400/50">
      {/* Server info */}
      {(server || powered) && (
        <div className="mb-3 space-y-1 font-mono text-xs">
          {server && (
            <div className="flex justify-between gap-4">
              <span className="text-white/25">SERVER</span>
              <span className="text-pink-400/70">{server}</span>
            </div>
          )}
          {powered && powered !== '—' && (
            <div className="flex justify-between gap-4">
              <span className="text-white/25">POWERED BY</span>
              <span className="text-pink-400/70">{powered}</span>
            </div>
          )}
        </div>
      )}

      {/* Present headers */}
      {present.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 font-mono text-xs text-white/20 tracking-widest">PRESENT</p>
          <div className="space-y-1">
            {present.map((header) => {
              const name = header.split(':')[0].trim()
              return (
                <div key={header} className="font-mono text-xs">
                  <span className="text-green-400/70">✓ </span>
                  <span className="text-white/50">{name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missing headers with explanations */}
      {missing.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-xs text-white/20 tracking-widest">MISSING</p>
          <div className="space-y-2">
            {missing.map((header) => (
              <div key={header} className="font-mono text-xs">
                <span className="text-crimson/70">✗ </span>
                <span className="text-white/50">{header}</span>
                {EXPLANATIONS[header] && (
                  <p className="mt-0.5 pl-3 text-white/25">{EXPLANATIONS[header]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ProbeCard>
  )
}
