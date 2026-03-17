import { useEffect, useState } from "react"
import { animate, motion } from "framer-motion"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

interface Props {
  coords: [number, number][]
}

export default function MapView({ coords }: Props) {
  const [scale, setScale]       = useState(147)
  const [centerLon, setCenterLon] = useState(0)
  const [centerLat, setCenterLat] = useState(20)

  useEffect(() => {
    if (!coords.length) return

    // Center on the first marker
    const [lon, lat] = coords[0]

    const s   = animate(scale,     500,  { duration: 1.5, ease: "easeInOut", onUpdate: setScale })
    const lo  = animate(centerLon, lon,  { duration: 1.5, ease: "easeInOut", onUpdate: setCenterLon })
    const la  = animate(centerLat, lat,  { duration: 1.5, ease: "easeInOut", onUpdate: setCenterLat })

    return () => { s.stop(); lo.stop(); la.stop() }
  }, [coords])

  return (
    <div className="w-full h-full p-2 font-mono">
      <p className="text-xs text-cyan-400/50 mb-1 tracking-widest">SIGNAL ORIGIN</p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
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
                  fill="#0d1117"
                  stroke="#1f4068"
                  strokeWidth={0.5}
                />
              ))
            }
          </Geographies>

          {coords.map(([lon, lat], i) => (
            <Marker key={i} coordinates={[lon, lat]}>
              {/* Pulsing ring */}
              <motion.circle
                r={8}
                fill="none"
                stroke="#00ff9f"
                strokeWidth={1.5}
                animate={{ r: [8, 22], opacity: [0.8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
              />
              {/* Core dot */}
              <circle r={3} fill="#00ff9f" />
            </Marker>
          ))}
        </ComposableMap>
      </motion.div>

      {/* Coordinate readout */}
      {coords.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {coords.map(([lon, lat], i) => (
            <p key={i} className="font-mono text-xs text-cyan-400/40">
              {i + 1}. {lat.toFixed(4)}, {lon.toFixed(4)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
