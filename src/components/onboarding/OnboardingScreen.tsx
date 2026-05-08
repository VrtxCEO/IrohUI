import { useState } from 'react'
import type { OnboardingData, RiskLevel, AuthOption } from '../../types'
import { IrohEye } from '../eye/IrohEye'
import '../components.css'

interface Props { onLaunch: (data: OnboardingData) => void }

const DEFAULT_RISK_AUTH: Record<RiskLevel, AuthOption[]> = { 1: ['none'], 2: ['none'], 3: ['none'] }

export function OnboardingScreen({ onLaunch }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    username: '', agentName: '', agentPhone: '', password: '',
    twoFaPhone: '', cryptoWallet: '',
    mainApiKey: '', mainApiKeyBackup: '', tutorApiKey: '', tutorApiKeyBackup: '',
    gloveConnected: false,
    riskAuth: DEFAULT_RISK_AUTH,
  })

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

  const dots = [1, 2, 3, 4, 5].map(i =>
    i < step ? 'done' : i === step ? 'active' : ''
  )

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <IrohEye state="idle" size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">iroh<span>OS</span></div>
          </div>

          <div className="ob-step-indicator">
            {dots.map((cls, i) => <div key={i} className={`ob-step-dot ${cls}`} />)}
          </div>

          {step === 1 && (
            <>
              <div className="ob-eyebrow">Step 1 of 4</div>
              <div className="ob-title">Create your OS identity</div>
              <div className="ob-sub">This is your sovereign identity inside Iroh. Only you control it.</div>
              <div className="field">
                <div className="field-label">Username</div>
                <input className="field-input" type="text" placeholder="e.g. don_vortex"
                  value={data.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div className="field">
                <div className="field-label">Agent name <span className="field-optional">what will you call your agent?</span></div>
                <input className="field-input" type="text" placeholder="e.g. Iroh, Atlas, Nova…"
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
              <div className="ob-sub">Iroh thinks with one model and learns with another. Both are under your control.</div>
              <div className="brain-block">
                <div className="brain-header">
                  <div className="brain-icon" style={{ background: 'rgba(0,200,150,0.12)' }}>🧠</div>
                  <div>
                    <div className="brain-name">Main LLM — Primary Brain</div>
                    <div className="brain-role">Iroh's reasoning and action engine</div>
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
                <div className="glove-title">Glove for IrohOS</div>
                <div className="glove-desc">Every action Iroh takes gets hash-chained, audited, and governed under your rules. Full AI on your terms.</div>
                <div className="glove-price">
                  <span className="glove-price-new">$4.99<span style={{ fontSize: 13, fontWeight: 500 }}>/mo</span></span>
                  <span className="glove-price-old">$9.99</span>
                  <span className="glove-price-tag">50% off for Iroh users</span>
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
              <div className="ob-title">Define how Iroh acts</div>
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

              <button className="btn-primary" style={{ marginTop: 4 }} onClick={() => setStep(5)}>Continue →</button>
              <button className="btn-secondary" onClick={() => setStep(3)}>← Back</button>
            </>
          )}

          {step === 5 && (
            <>
              <div className="ob-eyebrow">Step 5 of 5</div>
              <div className="ob-title">Access Iroh anywhere</div>
              <div className="ob-sub">IrohOS runs on your PC or server. If you want to use it on the go from a phone or browser, you'll need to connect your installation to the web app.</div>

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
                When you're ready, tap the <strong style={{ color: 'var(--text-2)' }}>Connections</strong> button at the top of the app and choose your mode. Iroh will walk you through the setup.
              </div>

              <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => onLaunch(data)}>Launch IrohOS →</button>
              <button className="btn-secondary" onClick={() => setStep(4)}>← Back</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
