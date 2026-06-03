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
import { MintView } from '../views/MintView'
import { AuthOverlay } from './AuthOverlay'
import { useEyroWS, apiFetch } from '../../lib/useEyroWS'
import type { AuthChallenge } from '../../lib/useEyroWS'
import { SceneCanvas } from '../scene/SceneCanvas'
import type { OsState } from '../../lib/spatialScene'
import '../components.css'

interface Props { user: AuthUser; session: OsSession }

function nowTime() { return new Date().toTimeString().slice(0, 5) }
function uid()     { return Math.random().toString(36).slice(2) }

interface Thread {
  thread_id: string
  title: string
  created_at: number
  updated_at: number
  message_count: number
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts * 1000
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ShellScreen({ user, session }: Props) {
  const agentName   = 'Eyro'
  const userInitial = (user.name ?? user.email).charAt(0).toUpperCase()
  const channelId   = useMemo(() => session.os_instance_id, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isMobile = useMemo(() => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarOpen,  setAvatarOpen]  = useState(false)
  const [panelActive, setPanelActive] = useState(false)
  const [mobileInput, setMobileInput] = useState('')
  const avatarRef     = useRef<HTMLDivElement>(null)
  const swipeRef      = useRef<{ x: number; y: number } | null>(null)
  const mobileChatRef = useRef<HTMLDivElement>(null)

  const [activeView, setActiveView]       = useState<NavView>('home')
  const [messages,   setMessages]         = useState<ChatMessage[]>([])
  const [personality, setPersonality]     = useState('')
  const [authChallenge, setAuthChallenge] = useState<AuthChallenge | null>(null)

  const [threads, setThreads]               = useState<Thread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [threadPanelOpen, setThreadPanelOpen] = useState(false)

  async function loadThreads() {
    try {
      const res = await apiFetch('/api/threads')
      const d = await res.json()
      setThreads(d.threads ?? [])
    } catch {}
  }

  async function newThread() {
    if (threads.length >= 10) return
    try {
      const res = await apiFetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Thread' }),
      })
      const t: Thread = await res.json()
      setThreads(prev => [t, ...prev])
      setActiveThreadId(t.thread_id)
      setMessages([])
      setThreadPanelOpen(false)
    } catch {}
  }

  async function switchThread(threadId: string) {
    setActiveThreadId(threadId)
    setThreadPanelOpen(false)
    try {
      const res = await apiFetch(`/api/threads/${encodeURIComponent(threadId)}/messages`)
      const d = await res.json()
      const msgs: ChatMessage[] = (d.messages ?? []).map((m: { role: string; text: string; ts: number }) => ({
        id: uid(),
        role: m.role as 'user' | 'assistant',
        text: m.text,
        timestamp: new Date(m.ts * 1000).toTimeString().slice(0, 5),
      }))
      setMessages(msgs)
    } catch {}
  }

  async function deleteThread(threadId: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await apiFetch(`/api/threads/${encodeURIComponent(threadId)}`, { method: 'DELETE' })
      setThreads(prev => prev.filter(t => t.thread_id !== threadId))
      if (activeThreadId === threadId) { setActiveThreadId(null); setMessages([]) }
    } catch {}
  }

  useEffect(() => { loadThreads() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { send, busy: isBusy, connected, reconnecting, wsRef } = useEyroWS({
    channelId,
    onReply(reply) {
      setMessages(m => [...m, {
        id: uid(), role: 'assistant', text: reply.text,
        timestamp: nowTime(), trace: reply.trace,
        taskId: reply.taskId ?? undefined,
      }])
    },
    onSessionInvalid() {
      clearSession()
      window.location.reload()
    },
    onAuthChallenge(challenge) {
      setAuthChallenge(challenge)
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
    send(text, activeThreadId ?? undefined)
  }, [isBusy, send, activeThreadId])

  function handleLogout() { clearAuth(); clearSession(); window.location.reload() }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Deactivate panel when leaving home view
  useEffect(() => { if (activeView !== 'home') setPanelActive(false) }, [activeView])

  // Auto-scroll mobile messages
  useEffect(() => {
    if (mobileChatRef.current) mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight
  }, [messages])

  function onPanelSwipeStart(e: React.PointerEvent) {
    swipeRef.current = { x: e.clientX, y: e.clientY }
  }
  function onPanelSwipeEnd(e: React.PointerEvent) {
    if (!swipeRef.current) return
    const dx = e.clientX - swipeRef.current.x
    const dy = e.clientY - swipeRef.current.y
    // Horizontal swipe dismisses the panel
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) setPanelActive(false)
    swipeRef.current = null
  }

  function handleMobileSend() {
    if (!mobileInput.trim() || isBusy) return
    handleSend(mobileInput)
    setMobileInput('')
  }

  const isHome = activeView === 'home'

  return (
    <div style={{ position: 'fixed', inset: 0 }}>

      {/* ── 3D scene (full-screen background) ── */}
      <SceneCanvas
        osState={osState}
        connected={connected}
        panelActive={panelActive}
        onPanelClick={() => setPanelActive(true)}
      />

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
          <div className={`ctx-dot ${!connected ? (reconnecting ? 'reconnecting' : 'off') : isBusy ? 'run' : 'idle'}`} />
          <span>{connected ? (isBusy ? 'Thinking…' : 'Connected') : (reconnecting ? 'Reconnecting…' : 'Disconnected')}</span>
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
      {isHome && panelActive && (
        /* Chat panel — centered, appears over the 3D FloatingPanel after it moves forward */
        <div
          className="spatial-chat-panel"
          onPointerDown={onPanelSwipeStart}
          onPointerUp={onPanelSwipeEnd}
        >
          <div className="spatial-chat-titlebar">
            <span className="spatial-chat-title">Chat</span>
            <button className="spatial-chat-exit" onClick={() => setPanelActive(false)}>Exit</button>
          </div>
          <HomeView
            agentName={agentName}
            userInitial={userInitial}
            messages={messages}
            onSend={handleSend}
            isBusy={isBusy}
            connected={connected}
            activeThreadId={activeThreadId}
            onToggleThreadPanel={() => setThreadPanelOpen(p => !p)}
          />
        </div>
      )}

      {!isHome && (
        /* Other views — full glass overlay */
        <div className="spatial-view-overlay">
          {activeView === 'tasks'     && <TasksView />}
          {activeView === 'workspace' && <WorkspaceView />}
          {activeView === 'foundry'   && <FoundryView />}
          {activeView === 'vault'     && <VaultView onVaultStateChange={() => {}} />}
          {activeView === 'mint'      && <MintView />}
        </div>
      )}

      {/* Auth challenge overlay */}
      <AuthOverlay
        challenge={authChallenge}
        wsRef={wsRef}
        onClose={() => setAuthChallenge(null)}
      />

      {/* ── Thread panel ── */}
      {threadPanelOpen && (
        <div className="thread-panel-backdrop" onClick={() => setThreadPanelOpen(false)}>
          <div className="thread-panel-card" onClick={e => e.stopPropagation()}>
            <div className="thread-panel-header">
              <span className="thread-panel-title">Threads</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="thread-new-btn" onClick={newThread} disabled={threads.length >= 10}>+ New</button>
                <button className="thread-close-btn" onClick={() => setThreadPanelOpen(false)}>✕</button>
              </div>
            </div>
            <div className="thread-list">
              {threads.length === 0 ? (
                <div className="thread-empty">No threads yet — start a new one.</div>
              ) : threads.map(t => (
                <div
                  key={t.thread_id}
                  className={`thread-item ${activeThreadId === t.thread_id ? 'active' : ''}`}
                  onClick={() => switchThread(t.thread_id)}
                >
                  <div className="thread-item-main">
                    <div className="thread-item-title">{t.title}</div>
                    <div className="thread-item-meta">
                      <span>{timeAgo(t.updated_at)}</span>
                      <span>{t.message_count} turn{t.message_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button className="thread-delete-btn" onClick={e => deleteThread(t.thread_id, e)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile chat (thin bar above nav, messages float over eye) ── */}
      {isHome && isMobile && (
        <>
          {messages.length > 0 && (
            <div className="mobile-messages" ref={mobileChatRef}>
              {messages.map(msg => (
                <div key={msg.id} className={`mobile-msg mobile-msg-${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isBusy && (
                <div className="mobile-msg mobile-msg-assistant mobile-msg-thinking">thinking…</div>
              )}
            </div>
          )}
          <div className="mobile-input-bar">
            <button
              className="mobile-threads-btn"
              onClick={() => setThreadPanelOpen(p => !p)}
              title="Threads"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 3h14M1 8h10M1 13h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <input
              className="mobile-input"
              type="text"
              placeholder="Message Eyro…"
              value={mobileInput}
              onChange={e => setMobileInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleMobileSend() }}
              disabled={isBusy}
            />
            <button
              className="mobile-send-btn"
              onClick={handleMobileSend}
              disabled={isBusy || !mobileInput.trim() || !connected}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14L14 8L2 2V7L10 8L2 9V14Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </>
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
        <NavBtn id="mint"      label="Mint"      active={activeView === 'mint'}      onClick={() => setActiveView('mint')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8.5 5C8.5 5 9 3.5 10 3.5C11 3.5 11.5 5 11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 9C6 7.3 7.5 6 10 6C12.5 6 14 7.3 14 9C14 13.5 12.5 16.5 10 16.5C7.5 16.5 6 13.5 6 9Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 9.5V14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M8.5 11C8.5 10.2 9.2 9.5 10 9.5C10.8 9.5 11.5 10.2 11.5 11C11.5 11.8 10.8 12 10 12.5C9.2 13 8.5 13.2 8.5 14C8.5 14.8 9.2 15.5 10 15.5C10.8 15.5 11.5 14.8 11.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
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
