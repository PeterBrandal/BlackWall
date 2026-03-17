import { motion } from "framer-motion"
import { ProfileData } from "@/hooks/useProfile"
import { CaseFileHeader } from "@/components/CaseFileHeader"
import { CaseSection } from "@/components/CaseSection"

interface Props {
  profile: ProfileData
}

function generateCaseNumber(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `BW-${hash.toString(16).toUpperCase().padStart(4, "0")}`
}

function ProbeLines({ lines }: { lines: string[] }) {
  return (
    <div className="font-mono text-xs space-y-1">
      {lines.map((line, i) => {
        const content = line.replace(/^\[\w+\]\s*/, "")
        return (
          <p key={i} className="text-white/60">
            <span className="text-crimson/40 mr-2">›</span>
            {content}
          </p>
        )
      })}
    </div>
  )
}

export function ProfilePage({ profile }: Props) {
  const caseNumber = generateCaseNumber(profile.name)
  const { probes } = profile

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-24"
    >
      {/* Case file header */}
      <CaseFileHeader
        name={profile.name}
        emails={profile.emails}
        caseNumber={caseNumber}
      />

      {/* Sections grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* GitHub */}
        <CaseSection
          title="DIGITAL IDENTITY // GITHUB"
          status={probes.github.status}
          redactedFields={["LOGIN", "REPOS", "LOCATION", "COMPANY"]}
        >
          <ProbeLines lines={probes.github.lines} />
        </CaseSection>

        {/* Brreg */}
        <CaseSection
          title="CORPORATE AFFILIATIONS // BRREG"
          status={probes.brreg.status}
          redactedFields={["COMPANY", "ORG NR", "TYPE", "STATUS"]}
        >
          <ProbeLines lines={probes.brreg.lines} />
        </CaseSection>
        {/* Wayback Machine */}
        <CaseSection
          title="DIGITAL FOOTPRINT // WAYBACK MACHINE"
          status={probes.wayback.status}
          redactedFields={["LAST ARCHIVED", "SNAPSHOT URL"]}
        >
          <ProbeLines lines={probes.wayback.lines} />
        </CaseSection>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-center font-mono text-xs text-white/10 tracking-widest"
      >
        ⚠ ALL DATA IS PUBLICLY AVAILABLE. EDUCATIONAL USE ONLY. ⚠
      </motion.p>
    </motion.main>
  )
}
