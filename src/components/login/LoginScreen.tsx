import { useState } from 'react'
import { IrohEye } from '../eye/IrohEye'
import { loginUser, registerUser, storeToken } from '../../lib/auth'
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
            Use the same email &amp; password you set during IrohOS setup.
          </div>
        </div>
      </div>
    </div>
  )
}
