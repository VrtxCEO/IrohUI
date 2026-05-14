import { useEffect, useRef } from 'react'
import { SpatialScene, type OsState } from '../../lib/spatialScene'

interface Props {
  osState: OsState
  connected: boolean
}

export function SceneCanvas({ osState, connected }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef  = useRef<SpatialScene | null>(null)

  // init once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new SpatialScene(canvas)
    sceneRef.current = scene
    return () => { scene.destroy(); sceneRef.current = null }
  }, [])

  // sync OS state → eye animation
  useEffect(() => {
    sceneRef.current?.setOsState(osState)
  }, [osState])

  // sync WS connection → eye appearance
  useEffect(() => {
    sceneRef.current?.setConnected(connected)
  }, [connected])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
        zIndex: 0,
      }}
      aria-label="EyroOS spatial scene"
    />
  )
}
