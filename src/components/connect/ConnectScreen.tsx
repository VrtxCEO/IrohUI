import { EyroEye } from '../eye/EyroEye'
import '../components.css'

export function ConnectScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <EyroEye state="idle" size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>
          <div className="ob-eyebrow">No OS linked</div>
          <div className="ob-title">Connect your EyroOS</div>
          <div className="ob-sub">
            On your PC or server, open EyroOS and generate a QR code from the connections panel. Scan it with your phone to link this device.
          </div>
        </div>
      </div>
    </div>
  )
}
