import { useState, useEffect } from "react"
import { animate } from "framer-motion"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { motion } from "framer-motion"

interface Props {
  coords: [number, number] | null
}

export default function MapView({ coords }: Props) {
  const [scale, setScale] = useState(147)
  const [centerLon, setCenterLon] = useState(0)
  const [centerLat, setCenterLat] = useState(20)

  useEffect(() => {
    if (!coords) return

    const s = animate(scale, 500, {
      duration: 1.5, ease: "easeInOut", onUpdate: setScale
    })
    const lon = animate(centerLon, coords[0], {
      duration: 1.5, ease: "easeInOut", onUpdate: setCenterLon
    })
    const lat = animate(centerLat, coords[1], {
      duration: 1.5, ease: "easeInOut", onUpdate: setCenterLat
    })

    return () => { s.stop(); lon.stop(); lat.stop() }
  }, [coords])

  return (
    <div className="w-full h-full p-2 font-mono">
      <p className="text-xs text-crimson/50 mb-1">SIGNAL ORIGIN</p>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{duration: 0.8, ease: "easeInOut"}}
        >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [centerLon, centerLat], scale }}
        style={{ width: "100%", height: "220px" }}
      >
        <Geographies geography="/countries-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0a0a0a"
                stroke="#3d0000"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>

        {coords && (
          <Marker coordinates={coords}>
            <motion.circle
              r={8} fill="none" stroke="#dc2626" strokeWidth={1}
              animate={{ r: [8, 20], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <circle r={3} fill="#dc2626" />
          </Marker>
        )}
      </ComposableMap>
    </motion.div>
    </div>
  )
}
