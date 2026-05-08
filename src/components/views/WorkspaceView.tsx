const FILES = [
  { icon: '📄', name: 'io_wrapper.ts', meta: 'EyroOS Dev · in progress · 2.1kb' },
  { icon: '📊', name: 'stage_schema_v2.json', meta: 'Digi Defense · today · 4.8kb' },
  { icon: '📝', name: 'offload_tier_structure.md', meta: 'Offload · yesterday · 1.2kb' },
  { icon: '📈', name: 'vortex_contest_review.md', meta: 'Vortex-Global · 3 days ago · 3.4kb' },
  { icon: '🗂', name: 'glove_gtm_phase3.md', meta: 'Glove · 4 days ago · 2.7kb' },
]

export function WorkspaceView() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="content-panel">
        <div className="panel-title">Workspace</div>
        <div className="panel-sub">Outputs, files, and notes Eyro has produced. Ask Eyro to generate anything new.</div>
        <div className="section-label">Recent</div>
        {FILES.map(f => (
          <div key={f.name} className="file-row">
            <div className="file-icon">{f.icon}</div>
            <div className="file-info">
              <div className="file-name">{f.name}</div>
              <div className="file-meta">{f.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
