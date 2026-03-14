// Animated background: a CSS neural grid overlaid with randomly-placed
// pulsing "data nodes" (dots). useMemo ensures the node positions are
// computed once and don't re-randomise on every render.
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface DataNode {
  id: number
  x: number   // % from left
  y: number   // % from top
  size: number
  delay: number
  duration: number
}

function generateNodes(count: number): DataNode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }))
}

export function NeuralBackground() {
  // Stable random nodes — only computed on mount
  const nodes = useMemo(() => generateNodes(22), [])

  return (
    <div className="neural-grid pointer-events-none fixed inset-0 z-0">
      {/* Soft crimson radial bloom at page center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,0,60,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Pulsing data nodes */}
      {nodes.map((node) => (
        <motion.span
          key={node.id}
          className="absolute rounded-full bg-crimson"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
          }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.6, 0.8] }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
