import { ProbeCard } from '@/components/ProbeCard'
import { ProbeState } from '@/hooks/useSSE'

interface Props {
  state: ProbeState
}

interface Tracker {
  name: string
  category: 'essential' | 'analytics' | 'advertising'
  schrems2: boolean
}

function parseGdpr(lines: string[]) {
  const get = (key: string) =>
    lines
      .find((l) => l.includes(key))
      ?.split(':')
      .slice(1)
      .join(':')
      .trim() ?? ''

  const cmps = lines
    .filter((l) => l.includes('CMP          :') && !l.includes('NONE'))
    .map((l) => l.split(':').slice(1).join(':').trim())

  const cmpNone = lines.some((l) => l.includes('CMP          : NONE'))

  const trackers: Tracker[] = lines
    .filter((l) => l.includes('TRACKER      :'))
    .map((l) => {
      const raw = l.split(':').slice(1).join(':').trim()
      const [name, category, schrems2] = raw.split('|')
      return { name, category: category as Tracker['category'], schrems2: schrems2 === 'true' }
    })

  const schrems2 = lines
    .filter((l) => l.includes('SCHREMS2     :'))
    .map((l) => l.split(':').slice(1).join(':').trim())

  const violation = get('VIOLATION    :') === 'true'
  const reason = get('REASON       :')
  const dpa = get('DPA          :')
  const summary = get('SUMMARY      :')

  return { cmps, cmpNone, trackers, schrems2, violation, reason, dpa, summary }
}

const CATEGORY_BADGE: Record<string, string> = {
  essential: 'border border-white/20 text-white/40',
  analytics: 'border border-yellow-400/40 text-yellow-400/70',
  advertising: 'border border-crimson/50 text-crimson/80',
}

const CATEGORY_LABEL: Record<string, string> = {
  essential: 'ESSENTIAL',
  analytics: 'ANALYTICS',
  advertising: 'ADVERTISING',
}

export function GdprCard({ state }: Props) {
  const g = parseGdpr(state.lines)

  const cardColor = g.violation
    ? 'text-crimson/60'
    : g.trackers.length > 0
      ? 'text-yellow-400/60'
      : 'text-green-400/50'

  return (
    <ProbeCard title="GDPR COMPLIANCE ANALYSIS" status={state.status} color={cardColor}>
      {/* Verdict badge */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`font-mono text-xs px-2 py-1 border tracking-widest ${
            g.violation
              ? 'border-crimson/50 bg-crimson/10 text-crimson'
              : g.trackers.length > 0
                ? 'border-yellow-400/40 bg-yellow-400/5 text-yellow-400'
                : 'border-green-400/40 bg-green-400/5 text-green-400'
          }`}
        >
          {g.violation
            ? '⚠ LIKELY VIOLATION'
            : g.trackers.length > 0
              ? '⚠ REVIEW REQUIRED'
              : '✓ NO ISSUES FOUND'}
        </span>
        {g.dpa && <span className="font-mono text-xs text-white/25">{g.dpa}</span>}
      </div>

      {/* Plain-language summary */}
      {g.summary && (
        <p className="mb-4 font-mono text-xs text-white/50 leading-relaxed border-l-2 border-crimson/20 pl-3">
          {g.summary}
        </p>
      )}

      {/* CMP */}
      <div className="mb-3">
        <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">CONSENT PLATFORM</p>
        {g.cmps.length > 0 ? (
          g.cmps.map((cmp) => (
            <span
              key={cmp}
              className="inline-block mr-2 font-mono text-xs border border-green-400/30 text-green-400/70 px-2 py-0.5"
            >
              ✓ {cmp}
            </span>
          ))
        ) : (
          <span className="font-mono text-xs text-crimson/60">✗ None detected</span>
        )}
      </div>

      {/* Trackers */}
      {g.trackers.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">DETECTED TRACKERS</p>
          <div className="space-y-1">
            {g.trackers.map((t) => (
              <div key={t.name} className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-white/50">{t.name}</span>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`font-mono text-xs px-1.5 py-0.5 ${CATEGORY_BADGE[t.category]}`}>
                    {CATEGORY_LABEL[t.category]}
                  </span>
                  {t.schrems2 && (
                    <span className="font-mono text-xs px-1.5 py-0.5 border border-orange-400/40 text-orange-400/70">
                      SCHREMS II
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schrems II summary */}
      {g.schrems2.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <p className="mb-1 font-mono text-xs text-white/20 tracking-widest">SCHREMS II RISK</p>
          <p className="font-mono text-xs text-orange-400/60 leading-relaxed">
            {g.schrems2.join(', ')} route data to US-based processors. Without verifiable Standard
            Contractual Clauses, this may violate GDPR Ch. V.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 font-mono text-xs text-white/15 leading-relaxed">
        ⚠ Static HTML analysis only. JavaScript-loaded trackers and runtime consent flow require
        browser-level verification.
      </p>
    </ProbeCard>
  )
}
