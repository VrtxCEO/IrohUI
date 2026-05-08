import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, TraceEntry } from '../../types'

interface Props {
  agentName: string
  userInitial: string
  messages: ChatMessage[]
  onSend: (text: string) => void
  isBusy: boolean
}

function nowTime() { return new Date().toTimeString().slice(0, 5) }

function TraceBlock({ trace }: { trace: TraceEntry[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="msg-trace">
      <div className="msg-trace-header" onClick={() => setOpen(o => !o)}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M4 6L5.5 7.5L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Reasoning trace · {trace.length} steps
        <svg className={`trace-arrow ${open ? 'open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      {open && (
        <div className="msg-trace-body open">
          {trace.map((t, i) => (
            <div key={i} className="msg-trace-line">{t.tag} · {t.message}</div>
          ))}
        </div>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Refactor the adapter layer',
  "Show today's decisions",
  'Load Digi Defense context',
  'Summarize active priors',
]

export function HomeView({ agentName, userInitial, messages, onSend, isBusy }: Props) {
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg) return
    onSend(msg)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="chat-area" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-logo-mark">I</div>
            <div className="empty-title">What should {agentName} do?</div>
            <div className="empty-sub">Every decision gets logged and reasoned. Just talk to {agentName}.</div>
            <div className="suggestion-row">
              {SUGGESTIONS.map(s => (
                <div key={s} className="suggestion" onClick={() => handleSend(s)}>{s}</div>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="msg-wrap">
              <div className={`msg-avatar ${msg.role === 'assistant' ? 'iroh' : 'user'}`}>
                {msg.role === 'assistant' ? agentName.charAt(0).toUpperCase() : userInitial}
              </div>
              <div className="msg-body">
                <div className="msg-name">
                  {msg.role === 'assistant' ? agentName : 'You'}
                  <span className="msg-ts">{msg.timestamp}</span>
                </div>
                <div className="msg-text"><p>{msg.text}</p></div>
                {msg.trace && msg.trace.length > 0 && <TraceBlock trace={msg.trace} />}
              </div>
            </div>
          ))
        )}
        {isBusy && messages.length > 0 && (
          <div className="msg-wrap">
            <div className="msg-avatar iroh">{agentName.charAt(0).toUpperCase()}</div>
            <div className="msg-body">
              <div className="msg-name">{agentName} <span className="msg-ts">{nowTime()}</span></div>
              <div className="msg-text" style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>thinking…</div>
            </div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <div className="input-inner">
          <div className="input-top">
            <textarea
              ref={textareaRef}
              className="msg-textarea"
              rows={1}
              placeholder={`Message ${agentName}…`}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKey}
            />
            <button className="send-btn" onClick={() => handleSend()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14L14 8L2 2V7L10 8L2 9V14Z" fill="black"/>
              </svg>
            </button>
          </div>
          <div className="input-footer">
            <div className="input-footer-btn">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Trace on
            </div>
            <div className="input-sep"/>
            <div className="input-footer-btn">IrohOS Dev</div>
            <span style={{ marginLeft: 'auto' }}>⇧ Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  )
}
