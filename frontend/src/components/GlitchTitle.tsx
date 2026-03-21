// The BLACKWALL hero title with a periodic RGB-separation glitch effect.
//
// How the glitch works:
//   Three copies of the text are stacked absolutely on top of each other.
//   The "red channel" copy shifts right; the "cyan channel" copy shifts left.
//   Normally both ghost copies have opacity:0.  When a glitch fires, they
//   flash into view offset from the main text, creating a CRT mis-register look.
//   useAnimation() gives us imperative control to trigger the sequence on a timer.
import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface GlitchTitleProps {
  text: string
}

const FONT_STYLE: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 800,
  letterSpacing: '0.12em',
  fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
  lineHeight: 1,
}

export function GlitchTitle({ text }: GlitchTitleProps) {
  const mainControls = useAnimation()
  const redControls = useAnimation()
  const cyanControls = useAnimation()

  // Track mounted state to avoid setState on unmounted component
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true

    let timeoutId: ReturnType<typeof setTimeout>

    const glitch = () => {
      if (!alive.current) return

      // Ghost layers flash in, offset in opposite directions
      void redControls.start({
        x: [0, 5, -3, 4, 0],
        opacity: [0, 0.75, 0.5, 0.8, 0],
        transition: { duration: 0.22, ease: 'easeInOut' },
      })
      void cyanControls.start({
        x: [0, -5, 3, -4, 0],
        opacity: [0, 0.55, 0.65, 0.4, 0],
        transition: { duration: 0.22, ease: 'easeInOut' },
      })

      // Main title shakes slightly
      void mainControls.start({
        x: [0, -2, 3, -1, 0],
        skewX: [0, -1.5, 1.5, -0.5, 0],
        transition: { duration: 0.22, ease: 'easeInOut' },
      })

      // Schedule the next glitch at a random interval (2.5 – 5.5 s)
      timeoutId = setTimeout(glitch, 2500 + Math.random() * 3000)
    }

    // First glitch fires 1.5 s after mount (after boot sequence clears)
    timeoutId = setTimeout(glitch, 1500)

    return () => {
      alive.current = false
      clearTimeout(timeoutId)
    }
  }, [mainControls, redControls, cyanControls])

  return (
    // relative container sizes to the largest child (the main h1)
    <div className="relative select-none" style={{ display: 'inline-block' }}>
      {/* Cyan ghost — shifts left */}
      <motion.span
        animate={cyanControls}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ ...FONT_STYLE, color: '#00e5ff', opacity: 0 }}
      >
        {text}
      </motion.span>

      {/* Red ghost — shifts right */}
      <motion.span
        animate={redControls}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ ...FONT_STYLE, color: '#FF003C', opacity: 0 }}
      >
        {text}
      </motion.span>

      {/* Main visible title */}
      <motion.h1
        animate={mainControls}
        className="text-glow-white relative text-white"
        style={FONT_STYLE}
      >
        {text}
      </motion.h1>
    </div>
  )
}
