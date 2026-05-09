import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { NavView, ChatMessage } from '../../types'
import type { AuthUser, OsSession } from '../../lib/auth'
import { clearAuth, clearSession } from '../../lib/auth'
import { Sidebar } from '../sidebar/Sidebar'
import { HomeView } from '../views/HomeView'
import { TasksView } from '../views/TasksView'
import { WorkspaceView } from '../views/WorkspaceView'
import { FoundryView } from '../views/FoundryView'
import { VaultView } from '../views/VaultView'
import { useEyroWS } from '../../lib/useEyroWS'
import { EyroEye } from '../eye/EyroEye'
import '../components.css'

interface Props { user: AuthUser; session: OsSession }

function nowTime() { return new Date().toTimeString().slice(0, 5) }
function uid() { return Math.random().toString(36).slice(2) }

export function ShellScreen({ user, session }: Props) {
  const agentName   = 'Eyro'
  const userInitial = (user.name ?? user.email).charAt(0).toUpperCase()
  const channelId   = useMemo(() => session.os_instance_id, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarOpen, setAvatarOpen]   = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  function handleLogout() {
    clearAuth()
    clearSession()
    window.location.reload()
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])
  const [activeView, setActiveView] = useState<NavView>('home')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [vaultOpen, setVaultOpen] = useState(false)
  const [personality, setPersonality] = useState('')
  const [connOpen, setConnOpen] = useState(false)
  const connRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (connRef.current && !connRef.current.contains(e.target as Node)) setConnOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const { send, busy: isBusy, connected } = useEyroWS({
    channelId,
    onReply(reply) {
      setMessages(m => [...m, {
        id: uid(),
        role: 'assistant',
        text: reply.text,
        timestamp: nowTime(),
        trace: reply.trace,
        taskId: reply.taskId ?? undefined,
      }])
    },
    onError(detail) {
      setMessages(m => [...m, {
        id: uid(),
        role: 'assistant',
        text: `⚠ ${detail}`,
        timestamp: nowTime(),
      }])
    },
  })

  function handleNavSwitch(view: NavView) {
    if (view !== 'vault' && vaultOpen) setVaultOpen(false)
    setActiveView(view)
  }

  const handleSend = useCallback((text: string) => {
    if (isBusy) return
    const userMsg: ChatMessage = { id: uid(), role: 'user', text, timestamp: nowTime() }
    setMessages(m => [...m, userMsg])
    send(text)
  }, [isBusy, send])

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Overlay */}
      <div className={`overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        agentName={agentName}
        personality={personality}
        onPersonalitySave={setPersonality}
      />

      {/* Header */}
      <div className="main-header">
        <button className="burger" onClick={() => setSidebarOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="h-logo">
          <div className="h-logo-mark">I</div>
          <div className="h-logo-name">{agentName.toLowerCase()}<span>OS</span></div>
        </div>

        {/* Connections button */}
        <div className="conn-wrap" ref={connRef}>
          <button className="conn-btn" onClick={() => setConnOpen(o => !o)}>
            Connections
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          {connOpen && (
            <div className="conn-dropdown">
              <div className="conn-dropdown-label">Connect on the go</div>
              {[
                { id: 'relay',  name: 'WebSocket Relay', desc: 'Zero config · recommended', badge: 'Recommended' },
                { id: 'direct', name: 'Direct API',       desc: 'Local network or port forward' },
                { id: 'webrtc', name: 'WebRTC',           desc: 'Peer-to-peer · lowest latency' },
              ].map(opt => (
                <div key={opt.id} className="conn-option" onClick={() => {
                  setConnOpen(false)
                  setActiveView('home')
                  const pages: Record<string, string> = {
                    relay:  'thefoundry/brain/systems/sys.connectivity.websocket-relay.md',
                    direct: 'thefoundry/brain/systems/sys.connectivity.direct-api.md',
                    webrtc: 'thefoundry/brain/systems/sys.connectivity.webrtc.md',
                  }
                  handleSend(`I want to set up ${opt.name} to connect my web app to EyroOS. Read the setup guide at ${pages[opt.id]} and walk me through it step by step.`)
                }}>
                  <div className="conn-option-row">
                    <span className="conn-option-name">{opt.name}</span>
                    {opt.badge && <span className="conn-option-badge">{opt.badge}</span>}
                  </div>
                  <div className="conn-option-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-center">
          <div className="ctx-pill">
            <div className={`ctx-dot ${!connected ? 'off' : isBusy ? 'run' : 'idle'}`} />
            {connected ? 'EyroOS Dev' : 'Disconnected'}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4 }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className="avatar-wrap" ref={avatarRef}>
          <div className="avatar" onClick={() => setAvatarOpen(o => !o)}>{userInitial}</div>
          {avatarOpen && (
            <div className="avatar-menu">
              <div className="avatar-menu-email">{user.email}</div>
              <button className="avatar-menu-logout" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>

      {/* Eye background — home view only */}
      {activeView === 'home' && (
        <div className={`shell-eye-bg ${isBusy ? 'active' : ''}`}>
          <EyroEye state={isBusy ? 'processing' : 'idle'} size={320} />
        </div>
      )}

      {/* Views */}
      <div style={{ flex: 1, display: activeView === 'home' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <HomeView agentName={agentName} userInitial={userInitial} messages={messages} onSend={handleSend} isBusy={isBusy} connected={connected} />
      </div>
      <div style={{ flex: 1, display: activeView === 'tasks' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <TasksView />
      </div>
      <div style={{ flex: 1, display: activeView === 'workspace' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <WorkspaceView />
      </div>
      <div style={{ flex: 1, display: activeView === 'foundry' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <FoundryView />
      </div>
      <div style={{ flex: 1, display: activeView === 'vault' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <VaultView onVaultStateChange={setVaultOpen} />
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <NavItem id="home" label="Home" active={activeView === 'home'} onClick={() => handleNavSwitch('home')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9L10 3L17 9V17H13V13H7V17H3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        </NavItem>
        <NavItem id="tasks" label="Tasks" active={activeView === 'tasks'} onClick={() => handleNavSwitch('tasks')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavItem>
        <NavItem id="workspace" label="Workspace" active={activeView === 'workspace'} onClick={() => handleNavSwitch('workspace')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 5C4 3.9 4.9 3 6 3H11L16 8V17C16 18.1 15.1 19 14 19H6C4.9 19 4 18.1 4 17V5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M11 3V8H16" stroke="currentColor" strokeWidth="1.5"/></svg>
        </NavItem>
        <NavItem id="foundry" label="Foundry" active={activeView === 'foundry'} onClick={() => handleNavSwitch('foundry')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8H17M6 5V20M14 5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </NavItem>
        <NavItem id="vault" label="Vault" active={activeView === 'vault'} onClick={() => handleNavSwitch('vault')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 6V4.5a4 4 0 018 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 14v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {vaultOpen && <div className="vault-nav-dot visible" />}
        </NavItem>
      </div>
    </div>
  )
}

function NavItem({ id, label, active, onClick, children }: { id: string; label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} id={`nav-${id}`} onClick={onClick}>
      {children}
      <span className="nav-label">{label}</span>
    </div>
  )
}
