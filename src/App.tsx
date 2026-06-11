import { useState, useEffect } from 'react'
import { ShellScreen } from './components/shell/ShellScreen'
import { LaunchScreen } from './components/eye/LaunchScreen'
import { LoginScreen } from './components/login/LoginScreen'
import { BindScreen } from './components/connect/BindScreen'
import { ConnectScreen } from './components/connect/ConnectScreen'
import { ManifestoPage } from './components/manifesto/ManifestoPage'
import { getToken, getStoredUser, getSession } from './lib/auth'
import type { AuthUser, OsSession } from './lib/auth'
import './index.css'

type Phase = 'launch' | 'login' | 'connect' | 'bind' | 'shell'

function getBindParam(): string | null {
  return new URLSearchParams(window.location.search).get('p')
}

function AuthApp() {
  const [phase, setPhase]     = useState<Phase>('launch')
  const [user, setUser]       = useState<AuthUser | null>(getStoredUser)
  const [session, setSession] = useState<OsSession | null>(getSession)

  // Capture ?p= once at mount before any URL cleanup
  const [bindParam] = useState<string | null>(() => getBindParam())

  function afterLaunch() {
    if (!getToken()) { setPhase('login'); return }
    if (bindParam)   { setPhase('bind');  return }
    if (getSession()) { setPhase('shell'); return }
    setPhase('connect')
  }

  function handleLogin(loggedInUser: AuthUser) {
    setUser(loggedInUser)
    if (bindParam)    { setPhase('bind');    return }
    if (getSession()) { setPhase('shell');   return }
    setPhase('connect')
  }

  function handleBound(sess: OsSession) {
    setSession(sess)
    setPhase('shell')
  }

  // Strip ?p= from URL once bind screen is active so reload doesn't re-trigger
  useEffect(() => {
    if (phase === 'bind' || phase === 'shell') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('p')) {
        url.searchParams.delete('p')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [phase])

  if (phase === 'launch') return <LaunchScreen onComplete={afterLaunch} />
  if (phase === 'login')  return <LoginScreen onLogin={handleLogin} />
  if (phase === 'connect') return <ConnectScreen />

  if (phase === 'bind' && bindParam && user) {
    return (
      <BindScreen
        encoded={bindParam}
        user={user}
        onBound={handleBound}
        onExpired={() => setPhase('connect')}
      />
    )
  }

  if (phase === 'shell' && user && session) {
    return <ShellScreen user={user} session={session} />
  }

  return <LoginScreen onLogin={handleLogin} />
}

export default function App() {
  if (window.location.pathname === '/manifesto') return <ManifestoPage />
  return <AuthApp />
}
