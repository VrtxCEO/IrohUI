import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../lib/useEyroWS'

interface KeepFile {
  id: string
  name: string
  category: string
  size_kb: number
  modified_at: string
}

interface KeepStatus {
  initialized: boolean
  open: boolean
  file_count: number
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼'
  if (ext === 'pdf') return '📄'
  if (['txt', 'md'].includes(ext)) return '📝'
  if (['json', 'yaml', 'yml', 'csv'].includes(ext)) return '📋'
  if (['zip', 'tar', 'gz'].includes(ext)) return '📦'
  return '🔒'
}

export function VaultView({ onVaultStateChange }: { onVaultStateChange?: (open: boolean) => void }) {
  const [status, setStatus] = useState<KeepStatus | null>(null)
  const [files, setFiles] = useState<KeepFile[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchStatus() {
    try {
      const res = await apiFetch('/api/keep/status')
      if (res.ok) {
        const data: KeepStatus = await res.json()
        setStatus(data)
        if (data.open) {
          onVaultStateChange?.(true)
          fetchFiles()
        }
      }
    } catch {}
  }

  async function fetchFiles() {
    try {
      const res = await apiFetch('/api/keep/files')
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files ?? [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 15000)
    return () => clearInterval(id)
  }, [])

  function openModal() { setModalOpen(true); setError(''); setPhrase(''); setPin('') }
  function closeModal() { setModalOpen(false) }

  async function attemptUnlock() {
    if (!phrase.trim()) { setError('Admin phrase is required.'); return }
    setError('')
    setUnlocking(true)
    try {
      const res = await apiFetch('/api/keep/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_phrase: phrase, pin }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as any).detail || 'Incorrect phrase or PIN.')
        return
      }
      setStatus(s => s ? { ...s, open: true } : { initialized: true, open: true, file_count: 0 })
      setModalOpen(false)
      onVaultStateChange?.(true)
      await fetchFiles()
    } catch {
      setError('Network error. Try again.')
    } finally {
      setUnlocking(false)
    }
  }

  async function lock() {
    try { await apiFetch('/api/keep/lock', { method: 'POST' }) } catch {}
    setStatus(s => s ? { ...s, open: false } : null)
    setFiles([])
    onVaultStateChange?.(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('category', '')
      const res = await apiFetch('/api/keep/files', { method: 'POST', body: form })
      if (res.ok) await fetchFiles()
    } catch {}
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function downloadFile(f: KeepFile) {
    try {
      const res = await apiFetch(`/api/keep/files/${f.id}`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = f.name; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  async function deleteFile(id: string) {
    try {
      await apiFetch(`/api/keep/files/${id}`, { method: 'DELETE' })
      setFiles(fs => fs.filter(f => f.id !== id))
      setStatus(s => s ? { ...s, file_count: Math.max(0, s.file_count - 1) } : null)
    } catch {}
  }

  const fileCount = status?.file_count ?? 0
  const isOpen = status?.open ?? false

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {!isOpen ? (
        <div className="vault-locked-overlay">
          <div className="vault-locked-icon">🔒</div>
          <div className="vault-locked-title">TheKeep</div>
          <div className="vault-locked-sub">Your encrypted file vault. Your agent has zero access — only you can unlock and view these files.</div>
          <div className="vault-locked-detail">
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="5" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 5V3.5a3 3 0 016 0V5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Fernet AES-128-CBC + HMAC-SHA256
            </div>
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Agent access: <strong style={{ color: 'var(--red)', marginLeft: 4 }}>none</strong>
            </div>
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              {fileCount} encrypted file{fileCount !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="btn-vault-open" onClick={openModal}>Open Vault Session</button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="vault-banner">
            <div className="vault-banner-dot" />
            <div className="vault-banner-text">Vault session active — <strong>agent access blocked</strong></div>
            <div className="vault-lock-btn" onClick={lock}>🔒 Lock</div>
          </div>
          <div className="content-panel" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="panel-title">TheKeep</div>
            <div className="panel-sub">Decrypted for this session. Only you can read these files.</div>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Vault contents · {files.length} file{files.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-1)', cursor: 'pointer', opacity: uploading ? 0.5 : 1,
                }}
              >
                {uploading ? 'Uploading…' : '+ Add File'}
              </button>
            </div>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
            {files.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                No files yet. Tap + Add File to store something securely.
              </div>
            ) : files.map(f => (
              <div key={f.id} className="vault-file-row">
                <div className="vault-file-icon">{fileIcon(f.name)}</div>
                <div className="vault-file-info" style={{ flex: 1, cursor: 'pointer' }} onClick={() => downloadFile(f)}>
                  <div className="vault-file-name">{f.name}</div>
                  <div className="vault-file-meta">
                    {f.category || 'File'} · {relativeTime(f.modified_at)} · {f.size_kb}kb
                  </div>
                </div>
                <span
                  className="vault-enc-badge"
                  style={{ cursor: 'pointer', color: 'var(--red)', opacity: 0.7 }}
                  onClick={() => deleteFile(f.id)}
                >
                  delete
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlock modal */}
      <div className={`modal-backdrop ${modalOpen ? 'open' : ''}`}>
        <div className="modal-card">
          <div className="modal-lock-icon">🔐</div>
          <div className="modal-title">TheKeep</div>
          <div className="modal-sub">Your encrypted vault. The key is derived in memory and never written to disk.</div>
          <div className="modal-auth-steps">
            <div className="modal-auth-step">
              <div className="modal-auth-label"><span className="step-num">1</span> Admin Phrase</div>
              <input
                className="modal-input" type="password" placeholder="Enter your admin phrase…"
                value={phrase} onChange={e => setPhrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && attemptUnlock()}
              />
            </div>
            <div className="modal-auth-step">
              <div className="modal-auth-label">
                <span className="step-num">2</span> PIN
                <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 6 }}>(if set)</span>
              </div>
              <input
                className="modal-input" type="password" placeholder="4–6 digit PIN" maxLength={6}
                inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && attemptUnlock()}
              />
            </div>
          </div>
          <div className="modal-error">{error}</div>
          <button className="btn-vault-unlock" onClick={attemptUnlock} style={unlocking ? { opacity: 0.6 } : {}}>
            {unlocking ? 'Decrypting…' : 'Unlock Vault'}
          </button>
          <button className="btn-vault-cancel" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
