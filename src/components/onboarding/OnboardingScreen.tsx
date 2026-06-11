import { useState } from 'react'
import type { OnboardingData, RiskLevel, AuthOption, FreedomLevel } from '../../types'
import { EyroEye } from '../eye/EyroEye'
import eyroEyeSrc from '../../assets/eyro_eye.svg'
import '../components.css'

interface Props { onLaunch: (data: OnboardingData) => void }

const DEFAULT_RISK_AUTH: Record<RiskLevel, AuthOption[]> = { 1: ['none'], 2: ['none'], 3: ['none'] }

const FREEDOM_LABELS: Record<number, { title: string; desc: string }> = {
  0: { title: 'Locked',      desc: 'Every action requires your approval before executing.' },
  1: { title: 'Cautious',    desc: 'Risky actions pause for approval. Safe actions run freely.' },
  2: { title: 'Balanced',    desc: 'Only high-risk actions are gated. Recommended for most users.' },
  3: { title: 'Autonomous',  desc: 'Eyro acts freely within your defined policy. Full speed.' },
}

export function OnboardingScreen({ onLaunch }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    username: '', agentName: '', agentPhone: '', password: '',
    twoFaPhone: '', cryptoWallet: '',
    mainApiKey: '', mainApiKeyBackup: '', tutorApiKey: '', tutorApiKeyBackup: '',
    gloveConnected: false,
    riskAuth: DEFAULT_RISK_AUTH,
    freedomLevel: 2,
    freedomLevelChangeAuth: [],
    adminPhrase: '',
    pin: '',
  })
  const [confirmPhrase, setConfirmPhrase] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [authError, setAuthError] = useState('')

  function set(key: keyof OnboardingData, value: unknown) {
    setData(d => ({ ...d, [key]: value }))
  }

  function toggleRiskAuth(risk: RiskLevel, opt: AuthOption) {
    setData(d => {
      const current = d.riskAuth[risk]
      if (opt === 'none') return { ...d, riskAuth: { ...d.riskAuth, [risk]: ['none'] } }
      const without = current.filter(o => o !== 'none' && o !== opt)
      const next = current.includes(opt) ? without : [...without, opt]
      return { ...d, riskAuth: { ...d.riskAuth, [risk]: next.length ? next : ['none'] } }
    })
  }

  function isSelected(risk: RiskLevel, opt: AuthOption) {
    return data.riskAuth[risk].includes(opt)
  }

  function validateAuthStep(): boolean {
    if (!data.adminPhrase.trim()) { setAuthError('Admin phrase is required.'); return false }
    if (data.adminPhrase !== confirmPhrase) { setAuthError('Admin phrases do not match.'); return false }
    if (data.pin && !/^\d{4,6}$/.test(data.pin)) { setAuthError('PIN must be 4–6 digits.'); return false }
    if (data.pin && data.pin !== confirmPin) { setAuthError('PINs do not match.'); return false }
    setAuthError('')
    return true
  }

  const dots = [1, 2, 3, 4, 5, 6].map(i =>
    i < step ? 'done' : i === step ? 'active' : ''
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <EyroEye state="idle" size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <img src={eyroEyeSrc} className="ob-logo-eye" alt="" />
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>

          <div className="ob-step-indicator">
            {dots.map((cls, i) => <div key={i} className={`ob-step-dot ${cls}`} />)}
          </div>

          {step === 1 && (
            <>
              <div className="ob-eyebrow">Step 1 of 4</div>
              <div className="ob-title">Create your OS identity</div>
              <div className="ob-sub">This is your sovereign identity inside Eyro. Only you control it.</div>
              <div className="field">
                <div className="field-label">Username</div>
                <input className="field-input" type="text" placeholder="e.g. don_vortex"
                  value={data.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div className="field">
                <div className="field-label">Agent name <span className="field-optional">what will you call your agent?</span></div>
                <input className="field-input" type="text" placeholder="e.g. Eyro, Atlas, Nova…"
                  value={data.agentName} onChange={e => set('agentName', e.target.value)} />
                {data.agentName.trim() && (
                  <div className="field-hint">
                    <span style={{ color: 'var(--text-2)' }}>Your agent will introduce itself as </span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{data.agentName.trim()}</span>
                  </div>
                )}
              </div>
              <div className="field">
                <div className="field-label">Agent phone number <span className="field-optional">optional</span></div>
                <input className="field-input" type="tel" placeholder="+1 (555) 000-0000"
                  value={data.agentPhone} onChange={e => set('agentPhone', e.target.value)} />
                <div className="field-hint">Your agent can use this number to send texts and make calls.</div>
              </div>
              <div className="field">
                <div className="field-label">Password</div>
                <input className="field-input" type="password" placeholder="Strong password"
                  value={data.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="field">
                <div className="field-label">Phone number <span className="field-optional">for 2FA</span></div>
                <input className="field-input" type="tel" placeholder="+1 (555) 000-0000"
                  value={data.twoFaPhone} onChange={e => set('twoFaPhone', e.target.value)} />
              </div>
              <div className="field">
                <div className="field-label">Crypto wallet <span className="field-optional">optional</span></div>
                <input className="field-input" type="text" placeholder="Solana wallet address"
                  value={data.cryptoWallet} onChange={e => set('cryptoWallet', e.target.value)} />
                <div className="field-hint">Used for on-chain identity and Vortex-Global integration.</div>
              </div>
              <button className="btn-primary" onClick={() => setStep(2)}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ob-eyebrow">Step 2 of 4</div>
              <div className="ob-title">Connect intelligence backends</div>
              <div className="ob-sub">Eyro thinks with one model and learns with another. Both are under your control.</div>
              <div className="brain-block">
                <div className="brain-header">
                  <div className="brain-icon" style={{ background: 'rgba(0,200,150,0.12)' }}>🧠</div>
                  <div>
                    <div className="brain-name">Main LLM — Primary Brain</div>
                    <div className="brain-role">Eyro's reasoning and action engine</div>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 10 }}>
                  <div className="field-label">API Key</div>
                  <input className="field-input" type="password" placeholder="sk-ant-..."
                    value={data.mainApiKey} onChange={e => set('mainApiKey', e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Backup API Key <span className="field-optional">optional</span></div>
                  <input className="field-input" type="password" placeholder="Fallback key if primary fails"
                    value={data.mainApiKeyBackup} onChange={e => set('mainApiKeyBackup', e.target.value)} />
                </div>
              </div>
              <div className="brain-block">
                <div className="brain-header">
                  <div className="brain-icon" style={{ background: 'rgba(79,143,255,0.12)' }}>🎓</div>
                  <div>
                    <div className="brain-name">Tutor LLM — Meta-Brain</div>
                    <div className="brain-role">Grades decisions, builds operational priors</div>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 10 }}>
                  <div className="field-label">Tutor API Key</div>
                  <input className="field-input" type="password" placeholder="sk-ant-..."
                    value={data.tutorApiKey} onChange={e => set('tutorApiKey', e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Tutor Backup Key <span className="field-optional">optional</span></div>
                  <input className="field-input" type="password" placeholder="Fallback tutor key"
                    value={data.tutorApiKeyBackup} onChange={e => set('tutorApiKeyBackup', e.target.value)} />
                </div>
              </div>
              <button className="btn-primary" onClick={() => setStep(3)}>Continue →</button>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ob-eyebrow">Step 3 of 4</div>
              <div className="ob-title">Enhance with Glove</div>
              <div className="ob-sub">Optional but recommended. Glove wraps every AI action in a governance and audit layer.</div>
              <div className="glove-card">
                <div className="glove-badge">🛡 ENDPOINT GOVERNANCE</div>
                <div className="glove-title">Glove for EyroOS</div>
                <div className="glove-desc">Every action Eyro takes gets hash-chained, audited, and governed under your rules. Full AI on your terms.</div>
                <div className="glove-price">
                  <span className="glove-price-new">$4.99<span style={{ fontSize: 13, fontWeight: 500 }}>/mo</span></span>
                  <span className="glove-price-old">$9.99</span>
                  <span className="glove-price-tag">50% off for Eyro users</span>
                </div>
                <div className="glove-btns">
                  <button className="btn-accent-outline" onClick={() => { set('gloveConnected', true); setStep(4) }}>Connect Glove</button>
                  <button className="btn-outline" onClick={() => setStep(4)}>Skip for now</button>
                </div>
              </div>
              <button className="btn-secondary" style={{ marginTop: 14 }} onClick={() => setStep(2)}>← Back</button>
            </>
          )}

          {step === 4 && (
            <>
              <div className="ob-eyebrow">Step 4 of 4</div>
              <div className="ob-title">Define how Eyro acts</div>
              <div className="ob-sub">Set authentication requirements for each risk tier. You can change these anytime in Settings.</div>

              {([1, 2, 3] as RiskLevel[]).map(risk => (
                <div className="risk-block" key={risk}>
                  <div className="risk-header">
                    <span className={`risk-badge risk-${risk}`}>RISK LEVEL {risk}</span>
                    <span className="risk-title">{risk === 1 ? 'Low Risk' : risk === 2 ? 'Medium Risk' : 'High Risk'}</span>
                  </div>
                  <div className="risk-examples">
                    {risk === 1 && 'Read-only tools, local analysis, harmless automations.'}
                    {risk === 2 && 'Sending emails, editing files, posting content, modifying data.'}
                    {risk === 3 && 'Payments, crypto transfers, identity changes, irreversible actions.'}
                  </div>
                  <div className="risk-auth-label">
                    Authentication required <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>select any combination</span>
                  </div>
                  <div className="risk-auth-options">
                    {risk === 3 && <div className="risk-opt locked">Admin Phrase ✓</div>}
                    {risk !== 3 && (
                      <div className={`risk-opt ${isSelected(risk, 'none') ? 'selected' : ''}`}
                        onClick={() => toggleRiskAuth(risk, 'none')}>None</div>
                    )}
                    {(['pin', 'password', '2fa'] as AuthOption[]).map(opt => (
                      <div key={opt}
                        className={`risk-opt ${isSelected(risk, opt) ? 'selected' : ''}`}
                        onClick={() => toggleRiskAuth(risk, opt)}>
                        {opt === '2fa' ? '2FA' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </div>
                    ))}
                  </div>
                  {risk === 3 && <div className="risk-note">Admin phrase is always required for Level 3. Stack any additional layers on top.</div>}
                </div>
              ))}

              {/* Freedom Level */}
              <div className="risk-block" style={{ marginTop: 8 }}>
                <div className="risk-header">
                  <span className="risk-badge" style={{ background: 'rgba(168,85,247,0.15)', color: 'rgba(168,85,247,0.9)' }}>FREEDOM LEVEL</span>
                  <span className="risk-title">Default Autonomy</span>
                </div>
                <div className="risk-examples">How much should Eyro act on its own? You can change this anytime — with your admin phrase.</div>
                <div className="risk-auth-options" style={{ marginTop: 10 }}>
                  {([0, 1, 2, 3] as FreedomLevel[]).map(lvl => (
                    <div
                      key={lvl}
                      className={`risk-opt ${data.freedomLevel === lvl ? 'selected' : ''}`}
                      onClick={() => set('freedomLevel', lvl)}
                      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '10px 12px' }}
                    >
                      <span style={{ fontWeight: 600 }}>{lvl} — {FREEDOM_LABELS[lvl].title}</span>
                      <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{FREEDOM_LABELS[lvl].desc}</span>
                    </div>
                  ))}
                </div>
                <div className="risk-auth-label" style={{ marginTop: 12 }}>
                  Required to change <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>admin phrase is always required</span>
                </div>
                <div className="risk-auth-options">
                  <div className="risk-opt locked">Admin Phrase ✓</div>
                  {(['pin', 'password', '2fa'] as AuthOption[]).map(opt => (
                    <div
                      key={opt}
                      className={`risk-opt ${data.freedomLevelChangeAuth.includes(opt) ? 'selected' : ''}`}
                      onClick={() => {
                        const cur = data.freedomLevelChangeAuth
                        const next = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt]
                        set('freedomLevelChangeAuth', next)
                      }}
                    >
                      {opt === '2fa' ? '2FA' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </div>
                  ))}
                </div>
                <div className="risk-note">Admin phrase is always required to change the freedom level. Stack additional layers for extra security.</div>
              </div>

              <button className="btn-primary" style={{ marginTop: 4 }} onClick={() => setStep(5)}>Continue →</button>
              <button className="btn-secondary" onClick={() => setStep(3)}>← Back</button>
            </>
          )}

          {step === 5 && (
            <>
              <div className="ob-eyebrow">Step 5 of 6</div>
              <div className="ob-title">Set your authorization keys</div>
              <div className="ob-sub">Your admin phrase authorizes high-risk actions and settings changes. Your PIN is for quick confirmation of medium-risk actions.</div>

              <div className="risk-block">
                <div className="risk-header">
                  <span className="risk-badge" style={{ background: 'rgba(255,79,79,0.15)', color: 'rgba(255,100,100,0.9)' }}>ADMIN PHRASE</span>
                  <span className="risk-title">High-stakes authorization</span>
                </div>
                <div className="risk-examples">Used for Risk Level 3 actions, freedom level changes, and vault access. Make it something you'll remember but others won't guess.</div>
                <div className="field" style={{ marginTop: 12, marginBottom: 10 }}>
                  <div className="field-label">Admin Phrase</div>
                  <input className="field-input" type="password" placeholder="A strong, memorable phrase…"
                    value={data.adminPhrase} onChange={e => { set('adminPhrase', e.target.value); setAuthError('') }} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Confirm Admin Phrase</div>
                  <input className="field-input" type="password" placeholder="Repeat your phrase…"
                    value={confirmPhrase} onChange={e => { setConfirmPhrase(e.target.value); setAuthError('') }} />
                </div>
              </div>

              <div className="risk-block">
                <div className="risk-header">
                  <span className="risk-badge" style={{ background: 'rgba(245,166,35,0.15)', color: 'rgba(245,166,35,0.9)' }}>PIN</span>
                  <span className="risk-title">Quick confirmation <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)' }}>optional</span></span>
                </div>
                <div className="risk-examples">4–6 digit PIN for medium-risk actions where a quick tap is enough. Leave blank to skip.</div>
                <div className="field" style={{ marginTop: 12, marginBottom: 10 }}>
                  <div className="field-label">PIN</div>
                  <input className="field-input" type="password" inputMode="numeric" maxLength={6} placeholder="4–6 digits"
                    value={data.pin} onChange={e => { set('pin', e.target.value.replace(/\D/g, '')); setAuthError('') }} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Confirm PIN</div>
                  <input className="field-input" type="password" inputMode="numeric" maxLength={6} placeholder="Repeat PIN"
                    value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setAuthError('') }} />
                </div>
              </div>

              {authError && <div style={{ fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>{authError}</div>}

              <button className="btn-primary" style={{ marginTop: 4 }} onClick={() => { if (validateAuthStep()) setStep(6) }}>Continue →</button>
              <button className="btn-secondary" onClick={() => setStep(4)}>← Back</button>
            </>
          )}

          {step === 6 && (
            <>
              <div className="ob-eyebrow">Step 6 of 6</div>
              <div className="ob-title">Access Eyro anywhere</div>
              <div className="ob-sub">EyroOS runs on your PC or server. If you want to use it on the go from a phone or browser, you'll need to connect your installation to the web app.</div>

              <div className="conn-option-card">
                <div className="conn-option-header">
                  <span className="conn-badge conn-badge-green">Recommended</span>
                  <div className="conn-option-name">WebSocket Relay</div>
                </div>
                <div className="conn-option-desc">Your OS connects outbound to a relay. No open ports, no router setup. Works anywhere with internet.</div>
              </div>

              <div className="conn-option-card">
                <div className="conn-option-header">
                  <div className="conn-option-name">Direct API</div>
                </div>
                <div className="conn-option-desc">The web app connects directly to your PC on your local network or via port forwarding. Full control, no cloud dependency.</div>
              </div>

              <div className="conn-option-card">
                <div className="conn-option-header">
                  <div className="conn-option-name">WebRTC</div>
                </div>
                <div className="conn-option-desc">Peer-to-peer connection via a signaling server. Lowest latency — best for future voice and streaming features.</div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', margin: '12px 0 4px', lineHeight: 1.6 }}>
                When you're ready, tap the <strong style={{ color: 'var(--text-2)' }}>Connections</strong> button at the top of the app and choose your mode. Eyro will walk you through the setup.
              </div>

              <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => onLaunch(data)}>Launch EyroOS →</button>
              <button className="btn-secondary" onClick={() => setStep(5)}>← Back</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
