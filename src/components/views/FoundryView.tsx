import { usePoll, apiFetch } from '../../lib/useEyroWS'

interface FoundryEntry {
  id: string
  title: string
  keywords: string[]
  confidence: number
  fire_count: number
}

export function FoundryView() {
  const { data } = usePoll<{ entries: FoundryEntry[] }>(
    () => apiFetch('/api/foundry').then(r => r.json()),
    30000,
  )

  const entries = data?.entries ?? []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="content-panel">
        <div className="panel-title">The Foundry</div>
        <div className="panel-sub">Your agent's knowledge layer. Eyro builds and refines this over time.</div>

        <div className="section-label">Knowledge Base</div>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24 }}>📚</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Knowledge entries</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                {entries.length > 0 ? `${entries.length} loaded patterns` : 'Building…'}
              </div>
            </div>
          </div>
        </div>

        {entries.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: 16 }}>Recent Entries</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(e => (
                <div key={e.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{e.title}</div>
                  {e.keywords.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {e.keywords.map(k => (
                        <span key={k} style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 99,
                          background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)',
                          color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace",
                        }}>{k}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', lineHeight: 1.5, fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
                    {[
                      e.confidence && `confidence: ${Math.round(e.confidence * 100)}%`,
                      e.fire_count && `applied ${e.fire_count}×`,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 16, padding: '12px', background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.12)', borderRadius: 10, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>The Foundry</span> is your agent's dynamic knowledge layer. Every decision, feedback, and success refines these patterns. Your agent learns in real time.
        </div>
      </div>
    </div>
  )
}
