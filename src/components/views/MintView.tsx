import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/useEyroWS'

interface Wallet {
  id: string
  nickname: string
  address: string
  network: string
  balance_usdc?: number
  monthly_budget_usdc?: number
  card_last_four?: string
  card_provider?: string
}

export function MintView() {
  const [wallets, setWallets]   = useState<Wallet[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState({ nickname: '', address: '', budget: '', card: '', provider: 'Zebec Carbon' })
  const [addError, setAddError] = useState('')

  async function loadWallets() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/finance/wallets')
      const d = await res.json()
      setWallets(d.wallets ?? [])
    } catch { setWallets([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadWallets() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function addWallet() {
    setAddError('')
    if (!addForm.address) { setAddError('Wallet address is required.'); return }
    try {
      const res = await apiFetch('/api/finance/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname:             addForm.nickname || 'My Wallet',
          address:              addForm.address,
          network:              'solana',
          monthly_budget_usdc:  addForm.budget ? parseFloat(addForm.budget) : null,
          card_last_four:       addForm.card ? addForm.card.slice(-4) : null,
          card_provider:        addForm.provider || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); setAddError(d.detail || 'Failed to add.'); return }
      setShowAdd(false)
      setAddForm({ nickname: '', address: '', budget: '', card: '', provider: 'Zebec Carbon' })
      loadWallets()
    } catch { setAddError('Network error.') }
  }

  const totalUsdc = wallets.reduce((s, w) => s + (w.balance_usdc ?? 0), 0)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1,#fff)' }}>The Mint</div>
          <div style={{ fontSize: 12, color: 'var(--text-3,rgba(255,255,255,0.4))', marginTop: 2 }}>Agent Finance · Zebec / Solana</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--accent,#00c896)', border: 'none',
            color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >+ Add Wallet</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'rgba(255,210,0,0.08)', border: '1px solid rgba(255,210,0,0.15)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,210,0,0.7)', marginBottom: 4 }}>Total USDC</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ffd200' }}>{totalUsdc.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>across all wallets</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Wallets</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1,#fff)' }}>{wallets.length}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>connected</div>
        </div>
      </div>

      {/* Wallets list */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Wallets &amp; Cards
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 32 }}>Loading…</div>
      ) : wallets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
          <div style={{ color: 'var(--text-1,#fff)', fontWeight: 600, marginBottom: 6 }}>No wallets added yet</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Add your Zebec Carbon wallet to track balance and budget.</div>
          <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--accent,#00c896)', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer' }}>
            Add Zebec Carbon Wallet
          </button>
        </div>
      ) : wallets.map(w => (
        <div key={w.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-1,#fff)', fontSize: 14 }}>{w.nickname}</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {w.address.slice(0, 8)}…{w.address.slice(-6)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ffd200' }}>{(w.balance_usdc ?? 0).toFixed(2)} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>USDC</span></div>
              {w.monthly_budget_usdc && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Budget: {w.monthly_budget_usdc} / mo</div>
              )}
            </div>
          </div>
          {w.card_last_four && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {w.card_provider ?? 'Card'} ···· {w.card_last_four}
            </div>
          )}
        </div>
      ))}

      {/* Add wallet modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div style={{ background: 'var(--bg-2,#0e1117)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1,#fff)' }}>Add Wallet</div>
            {(['nickname|Nickname|e.g. Zebec Carbon', 'address|Wallet Address|7xKX…', 'budget|Monthly Budget (USDC)|e.g. 200', 'card|Card Number (last 4)|optional', 'provider|Card Provider|Zebec Carbon'] as const).map(row => {
              const [field, lbl, ph] = row.split('|')
              return (
                <div key={field}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{lbl}</div>
                  <input
                    value={(addForm as Record<string, string>)[field]}
                    onChange={e => setAddForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )
            })}
            {addError && <div style={{ fontSize: 12, color: '#e55' }}>{addError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={addWallet} style={{ flex: 1, padding: 11, borderRadius: 10, background: 'var(--accent,#00c896)', border: 'none', color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add Wallet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
