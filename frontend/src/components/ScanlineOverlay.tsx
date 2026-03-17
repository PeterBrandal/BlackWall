// Renders two CRT effects fixed over the entire viewport:
// 1. A static scanline texture (horizontal stripes)
// 2. A single moving bright beam that sweeps top → bottom on a loop
// Both layers are pointer-events:none so they never block clicks.
import { motion } from 'framer-motion'

export function ScanlineOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Static CRT scanline texture */}
      <div className="scanlines absolute inset-0 opacity-40" />

      {/*
       * Moving scanline beam.
       * The gradient fades to transparent at both edges so it blends
       * into the page rather than appearing as a hard bar.
       */}
      <motion.div
        className="absolute left-0 right-0 h-[3px]"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(255,0,60,0.15) 20%, rgba(255,0,60,0.25) 50%, rgba(255,0,60,0.15) 80%, transparent)',
        }}
        animate={{ y: ['0vh', '100vh'] }}
        transition={{
          duration: 9,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      {/* Vignette — darkens corners to focus the eye center-screen */}
      <div className="vignette absolute inset-0" />
    </div>
  )
}
