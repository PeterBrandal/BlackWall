import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { motion } from "framer-motion"

interface Props {
  coords: [number, number] | null
}

export default function MapView({ coords }: Props) {
  return (
    <div className="w-full h-64 border border-crimson/20 bg-void-light clip-corner p-2">
      <p className="text-xs text-crimson/50 mb-1 font-mono">SIGNAL ORIGIN</p>
      <ComposableMap
        projection="geoMercator"
        style={{ width: "100%", height: "220px" }}
      >
        <Geographies geography="/world-110m.json">
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
            {/* Outer pulse ring */}
            <motion.circle
              r={8}
              fill="none"
              stroke="#dc2626"
              strokeWidth={1}
              animate={{ r: [8, 20], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Inner dot */}
            <circle r={3} fill="#dc2626" />
          </Marker>
        )}
      </ComposableMap>
    </div>
  )
}
