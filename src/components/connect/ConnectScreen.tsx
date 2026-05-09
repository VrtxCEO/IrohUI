import { EyroEye } from '../eye/EyroEye'
import { clearAuth, clearSession } from '../../lib/auth'
import '../components.css'

export function ConnectScreen() {
  function handleLogout() {
    clearAuth()
    clearSession()
    window.location.reload()
  }

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
          <div className="ob-title">Scan to connect</div>
          <div className="ob-sub" style={{ marginBottom: 20 }}>
            Open EyroOS on your PC → go to step 5 → tap <strong style={{ color: 'var(--text-1)' }}>Generate QR</strong> → scan it with your phone.
          </div>
          <div className="ob-sub" style={{ opacity: 0.5, fontSize: 12, marginBottom: 20 }}>
            The QR code will open this app automatically with your OS linked.
          </div>
          <button className="btn-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </div>
  )
}
