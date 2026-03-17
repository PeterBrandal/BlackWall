import { ProbeCard } from "@/components/ProbeCard"
import { ProbeState, LangEntry } from "@/hooks/useSSE"
import { TechStackBar } from "@/components/TechStackBar"

interface Props {
  state: ProbeState
  langs: LangEntry[]
}

function get(lines: string[], key: string) {
  return lines.find((l) => l.includes(key))?.split(":").slice(1).join(":").trim() ?? "—"
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-xs">
      <span className="text-white/25 tracking-widest shrink-0">{label}</span>
      <span className="text-purple-400/80 text-right truncate">{value}</span>
    </div>
  )
}

export function GitHubCard({ state, langs }: Props) {
  const login   = get(state.lines, "Login    :")
  const name    = get(state.lines, "Name     :")
  const repos   = get(state.lines, "Repos    :")
  const followers = get(state.lines, "Followers:")
  const website = get(state.lines, "Website  :")

  return (
    <ProbeCard title="GITHUB // DIGITAL FOOTPRINT" status={state.status} color="text-purple-400/50">
      <div className="space-y-1.5 mb-4">
        <Field label="HANDLE"    value={login} />
        <Field label="NAME"      value={name} />
        <Field label="REPOS"     value={repos} />
        <Field label="FOLLOWERS" value={followers} />
        {website !== "—" && <Field label="WEBSITE" value={website} />}
      </div>

      {langs.length > 0 && (
        <div className="border-t border-white/5 pt-3">
          <TechStackBar langs={langs} />
        </div>
      )}
    </ProbeCard>
  )
}
