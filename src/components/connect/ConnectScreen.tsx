import { IrohEye } from '../eye/IrohEye'
import '../components.css'

export function ConnectScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <IrohEye state="idle" size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">iroh<span>OS</span></div>
          </div>
          <div className="ob-eyebrow">No OS linked</div>
          <div className="ob-title">Connect your IrohOS</div>
          <div className="ob-sub">
            On your PC or server, open IrohOS and generate a QR code from the connections panel. Scan it with your phone to link this device.
          </div>
        </div>
      </div>
    </div>
  )
}
