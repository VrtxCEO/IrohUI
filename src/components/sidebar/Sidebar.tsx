import { useState, useEffect } from 'react'
import type { SidebarTab } from '../../types'
import { usePoll, apiFetch } from '../../lib/useEyroWS'
import { clearAuth, clearSession } from '../../lib/auth'

interface LiveSmith {
  id: string
  name: string
  description: string
  risk_level: number
}

interface LiveTool {
  id: string
  name: string
  description: string
  risk_level: number
  safety_class: string
  enabled: boolean
}

interface TraceEntry {
  tag: string
  message: string
  task_id: string
  goal: string
  timestamp: string
}

interface Stats {
  decisions_today: number
  success_rate: number
  total_tasks: number
  completed_tasks: number
  avg_steps_per_task: number
  unique_tools_used: number
}

interface Props {
  open: boolean
  onClose: () => void
  agentName: string
  personality: string
  onPersonalitySave: (val: string) => void
}

const FALLBACK_SMITHS = [
  { id: 'research', name: 'Research Smith', description: 'Deep research, synthesis, and knowledge aggregation.', risk_level: 1 },
  { id: 'code',     name: 'Code Smith',     description: 'Code generation, debugging, and technical architecture.', risk_level: 2 },
  { id: 'strategy', name: 'Strategy Smith', description: 'Tactical planning, decision analysis, and competitive intelligence.', risk_level: 1 },
  { id: 'data',     name: 'Data Smith',     description: 'Data processing, analysis, visualization, and statistical modeling.', risk_level: 2 },
]

const TAG_CLASS: Record<string, string> = {
  OBSERVE: 'tt-observe', DECIDE: 'tt-decide', ACTION: 'tt-action',
  ESCALATE: 'tt-escalate', COMPLETE: 'tt-complete',
}
const RISK_CLASS: Record<number, string> = { 1: 'risk-1', 2: 'risk-2', 3: 'risk-3' }

function relTime(iso: string): string {
  if (!iso) return ''
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch { return '' }
}

export function Sidebar({ open, onClose, agentName, personality, onPersonalitySave }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('trace')
  const [smithActive, setSmithActive] = useState<Record<string, boolean>>({})
  const [identityText, setIdentityText] = useState(personality)
  const [saveConfirm, setSaveConfirm] = useState(false)
  const [freedomLevel, setFreedomLevel] = useState<number | null>(null)
  const [savingIdentity, setSavingIdentity] = useState(false)
  const [flModalOpen, setFlModalOpen] = useState(false)
  const [flPending, setFlPending] = useState<number | null>(null)
  const [flPhrase, setFlPhrase] = useState('')
  const [flError, setFlError] = useState('')
  const [flSaving, setFlSaving] = useState(false)

  const { data: smithData } = usePoll<{ smiths: LiveSmith[] }>(
    () => apiFetch('/api/smiths').then(r => r.json()),
    60000,
  )
  const { data: toolData } = usePoll<{ tools: LiveTool[] }>(
    () => apiFetch('/api/tools').then(r => r.json()),
    60000,
  )
  const { data: traceData } = usePoll<{ entries: TraceEntry[] }>(
    () => apiFetch('/api/trace/recent').then(r => r.json()),
    8000,
  )
  const { data: statsData } = usePoll<Stats>(
    () => apiFetch('/api/stats').then(r => r.json()),
    15000,
  )

  useEffect(() => {
    apiFetch('/api/settings/freedom').then(r => r.json()).then(d => {
      if (d.freedom_level != null) setFreedomLevel(d.freedom_level)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/settings/identity').then(r => r.json()).then(d => {
      if (d.text) setIdentityText(d.text)
    }).catch(() => {})
  }, [])

  const liveSmiths = smithData?.smiths?.length ? smithData.smiths : FALLBACK_SMITHS
  const liveTools = toolData?.tools ?? []
  const traceEntries = traceData?.entries ?? []
  const stats = statsData

  function toggleSmith(id: string) {
    setSmithActive(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  async function savePersonality() {
    setSavingIdentity(true)
    try {
      await apiFetch('/api/settings/identity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: identityText }),
      })
      onPersonalitySave(identityText)
      setSaveConfirm(true)
      setTimeout(() => setSaveConfirm(false), 3000)
    } finally {
      setSavingIdentity(false)
    }
  }

  function requestFreedomChange(level: number) {
    if (level === freedomLevel) return
    setFlPending(level)
    setFlPhrase('')
    setFlError('')
    setFlModalOpen(true)
  }

  async function confirmFreedomChange() {
    if (!flPhrase.trim()) { setFlError('Admin phrase is required.'); return }
    setFlSaving(true)
    setFlError('')
    try {
      const res = await apiFetch('/api/settings/freedom', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: flPending, admin_phrase: flPhrase }),
      })
      if (!res.ok) { setFlError('Incorrect admin phrase.'); return }
      setFreedomLevel(flPending!)
      setFlModalOpen(false)
    } catch {
      setFlError('Could not reach OS.')
    } finally {
      setFlSaving(false)
    }
  }

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-mark">E</div>
          <div className="logo-name">{agentName.toLowerCase()}<span>OS</span></div>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="sidebar-tabs">
        {(['trace','tools','smiths','growth','settings'] as SidebarTab[]).map(tab => (
          <div key={tab} className={`s-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      <div className="sidebar-body">
        {/* TRACE */}
        <div className={`s-panel ${activeTab === 'trace' ? 'active' : ''}`}>
          <div className="s-label">Recent Agent Trace</div>
          {traceEntries.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 16, textAlign: 'center' }}>
              No trace yet — start a task on Home.
            </div>
          )}
          {traceEntries.map((e, i) => (
            <div key={i} className="trace-entry">
              <div className="trace-top">
                <span className={`t-tag ${TAG_CLASS[e.tag] ?? 'tt-action'}`}>{e.tag}</span>
                <span className="t-id">{e.task_id?.slice(0, 8)}</span>
              </div>
              <div className="t-msg">{e.message}</div>
              {e.goal && <div className="t-reason">{e.goal}</div>}
              <div className="t-meta"><span>{relTime(e.timestamp)}</span></div>
            </div>
          ))}
        </div>

        {/* TOOLS */}
        <div className={`s-panel ${activeTab === 'tools' ? 'active' : ''}`}>
          <div className="s-label">Tool Index · {liveTools.length} registered</div>
          {liveTools.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 16, textAlign: 'center' }}>Loading tools…</div>
          )}
          {liveTools.map(t => (
            <div key={t.id} className="tool-card">
              <div className="tool-top">
                <div className="tool-icon" style={{ background: 'rgba(0,200,150,0.1)' }}>⚙️</div>
                <div className="tool-info">
                  <div className="tool-name">{t.name || t.id}</div>
                  <div className="tool-desc">{t.description || t.id}</div>
                </div>
              </div>
              <div className="tool-bottom">
                <span className={`tool-risk ${RISK_CLASS[t.risk_level] ?? 'risk-1'}`}>Risk {t.risk_level}</span>
                <span style={{ fontSize: 10, color: t.enabled ? 'var(--accent)' : 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace" }}>
                  {t.enabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* SMITHS */}
        <div className={`s-panel ${activeTab === 'smiths' ? 'active' : ''}`}>
          <div className="s-label">Available Smiths</div>
          {liveSmiths.map(s => {
            const active = smithActive[s.id] ?? true
            return (
              <div key={s.id} className="tool-card">
                <div className="tool-top">
                  <div className="tool-icon" style={{ background: 'rgba(168,85,247,0.1)' }}>⚒️</div>
                  <div className="tool-info">
                    <div className="tool-name">{s.name}</div>
                    <div className="tool-desc">{s.description}</div>
                  </div>
                </div>
                <div className="tool-bottom">
                  <span className={`tool-risk ${RISK_CLASS[s.risk_level] ?? 'risk-1'}`}>Risk {s.risk_level}</span>
                  <div className="toggle-wrap">
                    <div className={`toggle ${active ? 'on' : ''}`} onClick={() => toggleSmith(s.id)} />
                    <span className="toggle-label">{active ? 'active' : 'inactive'}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", padding: '4px 2px', marginTop: 4 }}>
            Smiths are specialized subagents. Eyro delegates complex tasks to the right Smith.
          </div>
        </div>

        {/* GROWTH */}
        <div className={`s-panel ${activeTab === 'growth' ? 'active' : ''}`}>
          <div className="s-label">Activity Overview</div>
          <div className="growth-grid">
            {[
              [String(stats?.decisions_today ?? '—'), 'tasks today'],
              [stats?.success_rate != null ? `${stats.success_rate}%` : '—', 'success rate'],
              [String(stats?.total_tasks ?? '—'), 'total tasks'],
              [String(stats?.unique_tools_used ?? '—'), 'tools used'],
            ].map(([v, l]) => (
              <div key={l} className="growth-stat">
                <div className="growth-stat-val">{v}</div>
                <div className="growth-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS */}
        <div className={`s-panel ${activeTab === 'settings' ? 'active' : ''}`}>
          <div className="s-label">Security</div>
          {[
            { icon: '🔑', name: 'Admin Phrase', desc: 'Required for all Risk Level 3 actions' },
            { icon: '🛡', name: 'Risk Level Auth', desc: 'L1: None · L2: None · L3: Phrase' },
          ].map(r => <SettingRow key={r.name} {...r} />)}

          <div className="s-label" style={{ marginTop: 8 }}>Freedom Level</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[0, 1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => requestFreedomChange(lvl)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)',
                  background: freedomLevel === lvl ? 'var(--accent)' : 'var(--bg-2)',
                  color: freedomLevel === lvl ? '#000' : 'var(--text-2)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
            {freedomLevel === 0 ? 'Locked — all actions require approval'
            : freedomLevel === 1 ? 'Cautious — risky actions require approval'
            : freedomLevel === 2 ? 'Balanced — only high-risk actions gated'
            : 'Autonomous — Eyro acts freely within policy'}
          </div>

          <div className="s-label">Intelligence</div>
          {[
            { icon: '🧠', name: 'Main LLM', desc: 'Primary + backup API keys' },
            { icon: '🎓', name: 'Tutor LLM', desc: 'Tutor + backup API keys' },
          ].map(r => <SettingRow key={r.name} {...r} />)}
          <div className="s-label" style={{ marginTop: 8 }}>Account</div>
          {[
            { icon: '👤', name: 'Profile', desc: 'don_vortex' },
            { icon: '🛡', name: 'Glove Integration', desc: 'Connect / manage subscription' },
          ].map(r => <SettingRow key={r.name} {...r} />)}

          <button
            className="btn-secondary"
            style={{ width: '100%', marginTop: 16, marginBottom: 4 }}
            onClick={() => { clearAuth(); clearSession(); window.location.reload() }}
          >
            Log out
          </button>

          <div className="s-label" style={{ marginTop: 12 }}>Agent Personality</div>
          <div className="personality-card">
            <div className="personality-body">
              <div className="p-field-label" style={{ marginBottom: 2 }}>Identity</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.5 }}>
                Describe how your agent should think, speak, and behave. Write it however feels natural.
              </div>
              <textarea className="p-textarea" value={identityText}
                placeholder="e.g. Tactical and direct. Never sugarcoats. Thinks like a founder — speed over perfection, but flags ambiguity before acting."
                onChange={e => setIdentityText(e.target.value)} />
              <button className="p-save-btn" onClick={savePersonality} disabled={savingIdentity}>
                {savingIdentity ? 'Saving…' : 'Save'}
              </button>
              <div className={`p-save-confirm ${saveConfirm ? 'show' : ''}`}>✓ Identity saved to OS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Freedom level auth modal */}
      {flModalOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, borderRadius: 'inherit' }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '85%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Change Freedom Level</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Changing to level <strong style={{ color: 'var(--text-1)' }}>{flPending}</strong> requires your admin phrase.
            </div>
            <input
              type="password"
              placeholder="Admin phrase…"
              value={flPhrase}
              onChange={e => setFlPhrase(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmFreedomChange()}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-1)', fontSize: 13 }}
              autoFocus
            />
            {flError && <div style={{ fontSize: 11, color: 'var(--red)' }}>{flError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={confirmFreedomChange} disabled={flSaving}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {flSaving ? 'Confirming…' : 'Confirm'}
              </button>
              <button onClick={() => setFlModalOpen(false)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingRow({ icon, name, desc }: { icon: string; name: string; desc: string }) {
  return (
    <div className="setting-row">
      <div className="setting-icon">{icon}</div>
      <div className="setting-info">
        <div className="setting-name">{name}</div>
        <div className="setting-desc">{desc}</div>
      </div>
      <svg className="setting-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
