// Root component — manages the two top-level states:
//   1. Boot sequence (shown once, then fades out)
//   2. Main application (fades in after boot)
//
// The always-on visual layers (NeuralBackground, ScanlineOverlay) live here
// because they should persist across both states.
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NeuralBackground } from '@/components/NeuralBackground'
import { ScanlineOverlay }  from '@/components/ScanlineOverlay'
import { StatusBar }        from '@/components/StatusBar'
import { BootSequence }     from '@/components/BootSequence'
import { HomePage }         from '@/pages/HomePage'

export default function App() {
  // Once the boot sequence calls onComplete, we flip this to true
  const [booted, setBooted] = useState(false)

  return (
    <div className="relative min-h-screen bg-void font-mono text-white">

      {/* Always rendered, z-index 0 */}
      <NeuralBackground />

      {/* Always rendered, z-index 50 — sits above all content */}
      <ScanlineOverlay />

      {/*
       * AnimatePresence lets Framer Motion animate the *exiting* component
       * before unmounting it. Without it, the boot screen would disappear
       * instantly. mode="wait" ensures the exit animation completes before
       * the enter animation starts.
       */}
      <AnimatePresence mode="wait">
        {!booted ? (
          <BootSequence key="boot" onComplete={() => setBooted(true)} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <StatusBar />
            <HomePage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
