import { motion } from "framer-motion"
import { LangEntry } from "@/hooks/useSSE"

const LANG_COLORS: Record<string, string> = {
  TypeScript:  "#3178c6",
  JavaScript:  "#f7df1e",
  Python:      "#3572A5",
  Go:          "#00ADD8",
  Rust:        "#dea584",
  Java:        "#b07219",
  "C++":       "#f34b7d",
  C:           "#555555",
  Ruby:        "#701516",
  Swift:       "#F05138",
  Kotlin:      "#A97BFF",
  PHP:         "#4F5D95",
  CSS:         "#563d7c",
  HTML:        "#e34c26",
  Shell:       "#89e051",
  Dockerfile:  "#384d54",
}

const DEFAULT_COLOR = "#6e7681"

interface Props {
  langs: LangEntry[]
}

export function TechStackBar({ langs }: Props) {
  if (!langs.length) return null

  return (
    <div className="mt-3 font-mono">
      <p className="mb-2 text-xs tracking-[0.3em] text-purple-400/50">
        TECH STACK DISTRIBUTION
      </p>

      {/* Segmented bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-sm">
        {langs.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={{ width: 0 }}
            animate={{ width: `${lang.pct}%` }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
            style={{ backgroundColor: LANG_COLORS[lang.name] ?? DEFAULT_COLOR }}
            className="h-full"
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {langs.map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: LANG_COLORS[lang.name] ?? DEFAULT_COLOR }}
            />
            <span className="text-xs text-white/50">
              {lang.name} <span className="text-white/30">{lang.pct}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
