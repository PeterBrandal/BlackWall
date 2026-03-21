import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { NeuralBackground } from '@/components/NeuralBackground'
import { ScanlineOverlay } from '@/components/ScanlineOverlay'
import { BootSequence } from '@/components/BootSequence'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  const [booted, setBooted] = useState(false)

  return (
    <div className="relative min-h-screen bg-void font-mono text-white">
      <NeuralBackground />
      <ScanlineOverlay />

      <AnimatePresence mode="wait">
        {!booted ? (
          <BootSequence key="boot" onComplete={() => setBooted(true)} />
        ) : (
          <HomePage key="home" />
        )}
      </AnimatePresence>
    </div>
  )
}
