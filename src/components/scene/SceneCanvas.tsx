import { useEffect, useRef } from 'react'
import { SpatialScene, type OsState } from '../../lib/spatialScene'

interface Props {
  osState: OsState
  connected: boolean
  panelActive: boolean
  onPanelClick: () => void
}

export function SceneCanvas({ osState, connected, panelActive, onPanelClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef  = useRef<SpatialScene | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new SpatialScene(canvas)
    sceneRef.current = scene
    return () => { scene.destroy(); sceneRef.current = null }
  }, [])

  useEffect(() => { sceneRef.current?.setOsState(osState) },    [osState])
  useEffect(() => { sceneRef.current?.setConnected(connected) }, [connected])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (panelActive) scene.activatePanel()
    else             scene.deactivatePanel()
  }, [panelActive])

  useEffect(() => {
    if (sceneRef.current) sceneRef.current.onPanelClick = onPanelClick
  }, [onPanelClick])

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
