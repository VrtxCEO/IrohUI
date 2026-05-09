import { usePoll, apiFetch } from '../../lib/useEyroWS'

interface WsFile {
  name: string
  path: string
  size_kb: number
  modified_at: string
}

const EXT_ICON: Record<string, string> = {
  md: '📝', txt: '📄', py: '🐍', ts: '🔷', tsx: '🔷', js: '🟨',
  json: '📊', yaml: '⚙️', yml: '⚙️', toml: '⚙️', csv: '📈',
}

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_ICON[ext] ?? '📄'
}

function relTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 2)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'yesterday'
    if (days < 7)   return `${days} days ago`
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return '' }
}

export function WorkspaceView() {
  const { data, loading, error } = usePoll<{ files: WsFile[] }>(
    () => apiFetch('/api/workspace/files').then(r => r.json()),
    30000,
  )

  const files = data?.files ?? []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="content-panel">
        <div className="panel-title">Workspace</div>
        <div className="panel-sub">Files and documents in the OS workspace, most recently modified first.</div>

        {error && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
            OS offline — can't load files
          </div>
        )}

        {loading && !data && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 24, textAlign: 'center' }}>Loading…</div>
        )}

        {!loading && !error && files.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 24, textAlign: 'center' }}>No files found.</div>
        )}

        {files.length > 0 && (
          <>
            <div className="section-label">Recent · {files.length} files</div>
            {files.map(f => (
              <div key={f.path} className="file-row">
                <div className="file-icon">{fileIcon(f.name)}</div>
                <div className="file-info">
                  <div className="file-name">{f.name}</div>
                  <div className="file-meta">{f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') : 'root'} · {relTime(f.modified_at)} · {f.size_kb}kb</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
