import { useState } from 'react'
import type { SidebarTab } from '../../types'
import { usePoll, apiFetch } from '../../lib/useEyroWS'
import { clearAuth, clearSession } from '../../lib/auth'

interface LiveSmith {
  id: string
  name: string
  description: string
  risk_level: number
}

interface Props {
  open: boolean
  onClose: () => void
  agentName: string
  personality: string
  onPersonalitySave: (val: string) => void
}

const TRACE_ENTRIES = [
  { tag: 'OBSERVE', cls: 'tt-observe', id: '#t-0248', msg: 'Received: "Refactor adapter layer for file I/O ops"', reason: 'Classifying scope — file I/O is adapter-layer. No escalation needed.', time: '14:32:01', conf: '97%', isNew: true },
  { tag: 'DECIDE', cls: 'tt-decide', id: '#t-0247', msg: 'Strategy: typed modular wrapper', reason: 'Prior #22 — typed interfaces reduced errors 34% in similar patterns.', time: '14:31:55', conf: '89%', prior: '#22', isNew: false },
  { tag: 'ACTION', cls: 'tt-action', id: '#t-0246', msg: 'write_file("adapters/io_wrapper.ts")', reason: 'Sandboxed write — risk level 1. No auth required.', time: '14:31:48', conf: '99%', risk: '1', isNew: false },
  { tag: 'ESCALATE', cls: 'tt-escalate', id: '#t-0241', msg: 'External socket dependency — flagging for review', reason: 'Exceeds adapter scope. Tier-2 escalation policy.', time: '14:28:11', conf: '62%', risk: '2', isNew: false },
  { tag: 'COMPLETE', cls: 'tt-complete', id: '#t-0237', msg: 'Task closed: "Build Digi Defense stage schema v2"', time: '14:19:04', conf: '95%', isNew: false },
]

const TOOLS = [
  { icon: '📁', name: 'File System Access', desc: 'Read, write, and organize files in sandboxed workspace.', risk: 1, bg: 'rgba(0,200,150,0.1)', enabled: true },
  { icon: '📧', name: 'Email Composer', desc: 'Draft and send emails on your behalf.', risk: 2, bg: 'rgba(79,143,255,0.1)', enabled: true },
  { icon: '🌐', name: 'Web Search', desc: 'Query the web for live information.', risk: 1, bg: 'rgba(245,166,35,0.1)', enabled: true },
  { icon: '💸', name: 'Crypto Transfer', desc: 'Execute on-chain transfers via connected wallet.', risk: 3, bg: 'rgba(255,79,79,0.1)', enabled: false },
]

const SMITHS = [
  { icon: '⚒️', name: 'Research Smith', desc: 'Specialized in deep research, synthesis, and knowledge aggregation.', risk: 1, bg: 'rgba(168,85,247,0.1)', active: true },
  { icon: '⚒️', name: 'Code Smith', desc: 'Expert in code generation, debugging, and technical architecture.', risk: 2, bg: 'rgba(79,143,255,0.1)', active: true },
  { icon: '⚒️', name: 'Strategy Smith', desc: 'Tactical planning, decision analysis, and competitive intelligence.', risk: 1, bg: 'rgba(0,200,150,0.1)', active: true },
  { icon: '⚒️', name: 'Data Smith', desc: 'Data processing, analysis, visualization, and statistical modeling.', risk: 2, bg: 'rgba(245,166,35,0.1)', active: true },
]

const RISK_CLASS: Record<number, string> = { 1: 'risk-1', 2: 'risk-2', 3: 'risk-3' }

export function Sidebar({ open, onClose, agentName, personality, onPersonalitySave }: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('trace')
  const [toolStates, setToolStates] = useState(TOOLS.map(t => t.enabled))
  const [smithActive, setSmithActive] = useState<Record<string, boolean>>({})
  const [identityText, setIdentityText] = useState(personality)
  const [saveConfirm, setSaveConfirm] = useState(false)

  const { data: smithData } = usePoll<{ smiths: LiveSmith[] }>(
    () => apiFetch('/api/smiths').then(r => r.json()),
    60000,
  )
  const liveSmiths: LiveSmith[] = smithData?.smiths?.length
    ? smithData.smiths
    : SMITHS.map(s => ({ id: s.name, name: s.name, description: s.desc, risk_level: s.risk }))

  function toggleSmith(id: string) {
    setSmithActive(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  function savePersonality() {
    onPersonalitySave(identityText)
    setSaveConfirm(true)
    setTimeout(() => setSaveConfirm(false), 3000)
  }

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-mark">I</div>
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
          <div className="s-label">Live Agent Trace</div>
          {TRACE_ENTRIES.map((e, i) => (
            <div key={i} className={`trace-entry ${e.isNew ? 'new' : ''}`}>
              <div className="trace-top">
                <span className={`t-tag ${e.cls}`}>{e.tag}</span>
                <span className="t-id">{e.id}</span>
              </div>
              <div className="t-msg">{e.msg}</div>
              {e.reason && <div className="t-reason">{e.reason}</div>}
              <div className="t-meta">
                <span>{e.time}</span>
                {e.conf && <span>conf: {e.conf}</span>}
                {e.risk && <span>risk: {e.risk}</span>}
                {e.prior && <span>prior: {e.prior}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* TOOLS */}
        <div className={`s-panel ${activeTab === 'tools' ? 'active' : ''}`}>
          <div className="s-label">Tool Index</div>
          {TOOLS.map((t, i) => (
            <div key={t.name} className="tool-card">
              <div className="tool-top">
                <div className="tool-icon" style={{ background: t.bg }}>{t.icon}</div>
                <div className="tool-info">
                  <div className="tool-name">{t.name}</div>
                  <div className="tool-desc">{t.desc}</div>
                </div>
              </div>
              <div className="tool-bottom">
                <span className={`tool-risk ${RISK_CLASS[t.risk]}`}>Risk {t.risk}</span>
                <div className="toggle-wrap">
                  <div className={`toggle ${toolStates[i] ? 'on' : ''}`}
                    onClick={() => setToolStates(s => s.map((v, j) => j === i ? !v : v))} />
                  <span className="toggle-label">{toolStates[i] ? 'enabled' : 'disabled'}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", padding: '4px 2px' }}>
            Tools are sourced from The Forge. Eyro will request new capabilities as needed.
          </div>
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
          <div className="s-label">Learning Overview</div>
          <div className="growth-grid">
            {[['248','decisions today'],['91%','success rate'],['37','active priors'],['4','tools available']].map(([v,l]) => (
              <div key={l} className="growth-stat">
                <div className="growth-stat-val">{v}</div>
                <div className="growth-stat-label">{l}</div>
              </div>
            ))}
          </div>
          <div className="s-label" style={{ marginTop: 8 }}>What Eyro learned this week</div>
          {[
            { title: 'Adapter patterns', body: 'Typed interfaces consistently reduce downstream errors. Now a default strategy for all adapter-layer work.' },
            { title: 'Scope discipline', body: 'Eyro correctly escalated 4 out of 4 out-of-scope actions this week — sandbox boundaries are stable.' },
            { title: 'Context switching', body: 'Transitions between projects have zero cross-contamination across 31 sessions.' },
          ].map(c => (
            <div key={c.title} className="learn-card">
              <div className="learn-title">{c.title}</div>
              <div className="learn-body">{c.body}</div>
            </div>
          ))}
        </div>

        {/* SETTINGS */}
        <div className={`s-panel ${activeTab === 'settings' ? 'active' : ''}`}>
          <div className="s-label">Security</div>
          {[
            { icon: '🔑', name: 'Admin Phrase', desc: 'Required for all Risk Level 3 actions' },
            { icon: '🛡', name: 'Risk Level Auth', desc: 'L1: None · L2: None · L3: Phrase' },
          ].map(r => <SettingRow key={r.name} {...r} />)}
          <div className="s-label" style={{ marginTop: 8 }}>Intelligence</div>
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
              <button className="p-save-btn" onClick={savePersonality}>Save</button>
              <div className={`p-save-confirm ${saveConfirm ? 'show' : ''}`}>✓ Identity saved — active next session</div>
            </div>
          </div>
        </div>
      </div>
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
