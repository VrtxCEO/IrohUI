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
import { SceneCanvas } from '../scene/SceneCanvas'
import type { OsState } from '../../lib/spatialScene'
import '../components.css'

interface Props { user: AuthUser; session: OsSession }

function nowTime() { return new Date().toTimeString().slice(0, 5) }
function uid()     { return Math.random().toString(36).slice(2) }

export function ShellScreen({ user, session }: Props) {
  const agentName   = 'Eyro'
  const userInitial = (user.name ?? user.email).charAt(0).toUpperCase()
  const channelId   = useMemo(() => session.os_instance_id, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarOpen,  setAvatarOpen]  = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  const [activeView, setActiveView] = useState<NavView>('home')
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [personality, setPersonality] = useState('')

  const { send, busy: isBusy, connected } = useEyroWS({
    channelId,
    onReply(reply) {
      setMessages(m => [...m, {
        id: uid(), role: 'assistant', text: reply.text,
        timestamp: nowTime(), trace: reply.trace,
        taskId: reply.taskId ?? undefined,
      }])
    },
  })

  // Map WS state → spatial eye state
  const osState: OsState = !connected ? 'idle'
    : isBusy              ? 'processing'
    : messages.length > 0 && messages[messages.length - 1].role === 'assistant' ? 'responding'
    : 'idle'

  const handleSend = useCallback((text: string) => {
    if (isBusy) return
    setMessages(m => [...m, { id: uid(), role: 'user', text, timestamp: nowTime() }])
    send(text)
  }, [isBusy, send])

  function handleLogout() { clearAuth(); clearSession(); window.location.reload() }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const isHome = activeView === 'home'

  return (
    <div style={{ position: 'fixed', inset: 0 }}>

      {/* ── 3D scene (full-screen background) ── */}
      <SceneCanvas osState={osState} connected={connected} />

      {/* ── Sidebar ── */}
      <div className={`overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} style={{ zIndex: 30 }} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        agentName={agentName}
        personality={personality}
        onPersonalitySave={setPersonality}
      />

      {/* ── Top bar (minimal glass strip) ── */}
      <div className="spatial-topbar">
        <button className="spatial-icon-btn" onClick={() => setSidebarOpen(true)} title="Menu">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="spatial-logo">
          <span className="spatial-logo-mark">I</span>
          <span className="spatial-logo-name">{agentName.toLowerCase()}<em>OS</em></span>
        </div>

        <div className="spatial-status">
          <div className={`ctx-dot ${!connected ? 'off' : isBusy ? 'run' : 'idle'}`} />
          <span>{connected ? (isBusy ? 'Thinking…' : 'Connected') : 'Disconnected'}</span>
        </div>

        <div className="avatar-wrap" ref={avatarRef} style={{ marginLeft: 'auto' }}>
          <div className="avatar" onClick={() => setAvatarOpen(o => !o)}>{userInitial}</div>
          {avatarOpen && (
            <div className="avatar-menu">
              <div className="avatar-menu-email">{user.email}</div>
              <button className="avatar-menu-logout" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content overlay ── */}
      {isHome ? (
        /* Chat panel — right side, glass, over the 3D FloatingPanel area */
        <div className="spatial-chat-panel">
          <HomeView
            agentName={agentName}
            userInitial={userInitial}
            messages={messages}
            onSend={handleSend}
            isBusy={isBusy}
            connected={connected}
          />
        </div>
      ) : (
        /* Other views — full glass overlay */
        <div className="spatial-view-overlay">
          {activeView === 'tasks'     && <TasksView />}
          {activeView === 'workspace' && <WorkspaceView />}
          {activeView === 'foundry'   && <FoundryView />}
          {activeView === 'vault'     && <VaultView onVaultStateChange={() => {}} />}
        </div>
      )}

      {/* ── Bottom nav — glassy icon pill ── */}
      <nav className="spatial-nav">
        <NavBtn id="home"      label="Home"      active={activeView === 'home'}      onClick={() => setActiveView('home')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 9L10 3L17 9V17H13V13H7V17H3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        </NavBtn>
        <NavBtn id="tasks"     label="Tasks"     active={activeView === 'tasks'}     onClick={() => setActiveView('tasks')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>
        <NavBtn id="workspace" label="Files"     active={activeView === 'workspace'} onClick={() => setActiveView('workspace')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 5C4 3.9 4.9 3 6 3H11L16 8V17C16 18.1 15.1 19 14 19H6C4.9 19 4 18.1 4 17V5Z" stroke="currentColor" strokeWidth="1.5"/><path d="M11 3V8H16" stroke="currentColor" strokeWidth="1.5"/></svg>
        </NavBtn>
        <NavBtn id="foundry"   label="Foundry"   active={activeView === 'foundry'}   onClick={() => setActiveView('foundry')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8H17M6 5V20M14 5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </NavBtn>
        <NavBtn id="vault"     label="Vault"     active={activeView === 'vault'}     onClick={() => setActiveView('vault')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6 6V4.5a4 4 0 018 0V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 14v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </NavBtn>
      </nav>

    </div>
  )
}

function NavBtn({ id, label, active, onClick, children }: { id: string; label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`spatial-nav-btn ${active ? 'active' : ''}`} id={`nav-${id}`} onClick={onClick} title={label}>
      {children}
      <span className="spatial-nav-label">{label}</span>
    </button>
  )
}
