import { useState } from 'react'
import { EyroEye } from '../eye/EyroEye'
import eyroEyeSrc from '../../assets/eyro_eye.svg'
import { loginUser, registerUser, storeToken, storeSession } from '../../lib/auth'
import type { AuthUser } from '../../lib/auth'
import '../components.css'

interface Props {
  onLogin: (user: AuthUser) => void
}

export function LoginScreen({ onLogin }: Props) {
  const [tab, setTab]           = useState<'signin' | 'register'>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [earlyBetaClick, setEarlyBetaClick] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      if (tab === 'signin') {
        const { token, user: loggedIn } = await loginUser(email.trim(), password)
        storeToken(token, loggedIn)
        onLogin(loggedIn)
      } else {
        await registerUser(email.trim(), password, name.trim() || undefined)
        const { token, user: loggedIn } = await loginUser(email.trim(), password)
        storeToken(token, loggedIn)
        onLogin(loggedIn)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleEarlyBetaClick() {
    setEarlyBetaClick(true)
    setTimeout(() => setEarlyBetaClick(false), 2500)
  }

  function handleDevBypass() {
    const mockUser: AuthUser = { id: 'dev', email: 'dev@local', name: 'Dev', isAdmin: true, role: 'admin' }
    storeToken('dev-token', mockUser)
    storeSession({
      os_instance_id: 'dev-instance-local',
      connection_token: 'dev-connection-token',
      public_key: '',
      relay_url: '',
      direct_url: 'http://localhost:8765',
      bound_at: new Date().toISOString(),
    })
    onLogin(mockUser)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <EyroEye state="idle" size={420} />
      </div>

      <div className="ob-wrap" style={{ flexDirection: 'column', gap: 16 }}>

        <div className="login-beta-heading">
          Create an Account to join the beta
        </div>

        <div className="ob-card">
          <div className="ob-logo">
            <img src={eyroEyeSrc} className="ob-logo-eye" alt="" />
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>

          <div className="login-tabs">
            <button
              className={`login-tab ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => { setTab('signin'); setError('') }}
            >Sign in</button>
            <button
              className={`login-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError('') }}
            >Create account</button>
          </div>

          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div className="field">
                <div className="field-label">Name <span className="field-optional">optional</span></div>
                <input
                  className="field-input" type="text" placeholder="Your name"
                  value={name} onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="field">
              <div className="field-label">Email</div>
              <input
                className="field-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" required
              />
            </div>

            <div className="field">
              <div className="field-label">Password</div>
              <input
                className="field-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <div className="login-footer">
            Use the same email &amp; password you set during EyroOS setup.
          </div>

          <div className="login-beta-divider">
            <span>Beta access</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="btn-join-beta btn-join-beta-locked"
              type="button"
              onClick={handleEarlyBetaClick}
            >
              Join Beta
            </button>
            {earlyBetaClick && (
              <div className="beta-early-msg">Create Account 1st</div>
            )}
          </div>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={handleDevBypass}
              style={{
                marginTop: 10, width: '100%', padding: '8px 0',
                background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.25)',
                borderRadius: 8, color: 'rgba(255,200,0,0.7)', fontSize: 12,
                cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >
              Dev bypass (skip auth)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
