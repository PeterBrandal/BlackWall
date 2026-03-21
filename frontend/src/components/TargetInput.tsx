// Terminal-style target input — the primary interaction point.
// Accepts any of: name, email, IP address, domain, or username.
// The submit button uses a cyberpunk diagonal clip and glows on hover.
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '@/lib/utils'

interface TargetInputProps {
  onSubmit?: (target: string) => void
  disabled?: boolean
}

export function TargetInput({ onSubmit, disabled = false }: TargetInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSubmit?.(value.trim())
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        {/*
         * Outer wrapper: the clip-corner class cuts two opposite corners at 45°.
         * The border colour transitions to full opacity when focused,
         * and the glow utility is toggled via cn().
         */}
        <div
          className={cn(
            'clip-corner relative border bg-void-light transition-all duration-300',
            isFocused ? 'border-crimson border-glow-intense' : 'border-crimson border-opacity-25'
          )}
        >
          {/* Decorative corner tick marks */}
          <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-crimson opacity-60" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-crimson opacity-60" />

          <div className="flex items-center gap-3 px-5 py-3.5">
            {/* Terminal prompt symbol */}
            <span className="text-glow shrink-0 font-mono text-sm font-bold text-crimson">
              &gt;
            </span>

            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="ENTER TARGET: name / email / IP / domain / username"
              disabled={disabled}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                'flex-1 bg-transparent font-mono text-sm text-white outline-none',
                'placeholder:text-crimson-dark placeholder:opacity-40',
                disabled && 'cursor-not-allowed opacity-40'
              )}
            />

            {/* BREACH submit button */}
            <motion.button
              type="submit"
              disabled={!value.trim() || disabled}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'clip-corner-sm shrink-0 border border-crimson px-4 py-1.5',
                'font-mono text-xs font-bold tracking-widest text-crimson',
                'transition-all duration-200',
                'hover:bg-crimson hover:text-void hover:shadow-[0_0_20px_rgba(255,0,60,0.6)]',
                'disabled:cursor-not-allowed disabled:opacity-25',
                'focus:outline-none'
              )}
            >
              BREACH
            </motion.button>
          </div>
        </div>
      </form>

      <p className="mt-2 px-1 font-mono text-xs text-crimson-dark opacity-35">
        ACCEPTS: NAME · EMAIL · IP ADDRESS · DOMAIN · USERNAME
      </p>
    </div>
  )
}
