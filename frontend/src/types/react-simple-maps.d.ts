declare module 'react-simple-maps' {
  import { ReactNode, SVGProps } from 'react'

  interface GeographiesChildrenProps {
    geographies: Geography[]
  }

  interface Geography {
    rsmKey: string
    [key: string]: unknown
  }

  export function ComposableMap(props: {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: React.CSSProperties
    children?: ReactNode
  }): JSX.Element

  export function Geographies(props: {
    geography: string
    children: (props: GeographiesChildrenProps) => ReactNode
  }): JSX.Element

  export function Geography(props: SVGProps<SVGPathElement> & {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
  }): JSX.Element

  export function Marker(props: {
    coordinates: [number, number]
    children?: ReactNode
  }): JSX.Element
}
