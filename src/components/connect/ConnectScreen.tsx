import { useState } from 'react'
import { EyroEye } from '../eye/EyroEye'
import { clearAuth, clearSession } from '../../lib/auth'
import '../components.css'

const BETA_DISCORD_URL = 'https://discord.gg/JrGnAnBwzM'

function BetaModal({ onClose }: { onClose: () => void }) {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="beta-backdrop" onClick={onClose}>
      <div className="beta-modal" onClick={e => e.stopPropagation()}>
        <div className="beta-modal-header">
          <div className="ob-logo" style={{ marginBottom: 0 }}>
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>
          <button className="beta-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="ob-eyebrow" style={{ marginTop: 20 }}>Beta Program</div>
        <div className="ob-title" style={{ fontSize: 18 }}>Beta NDA &amp; Tester Agreement</div>
        <div className="ob-sub" style={{ marginBottom: 12, fontSize: 12 }}>
          Version 1.0 — May 16, 2026 · Read the full agreement before joining.
        </div>

        <div className="beta-terms">
          <p className="beta-section-label">1. Purpose</p>
          <p>Developer is providing Tester with pre-release access to Eyro OS for the purpose of evaluating functionality, identifying bugs, providing feedback, validating user experience, and stress-testing the OS loop, PCS, routing, and capability extensions.</p>
          <p>Tester acknowledges Eyro OS is confidential, proprietary, and under active development.</p>

          <p className="beta-section-label">2. Confidentiality (NDA)</p>
          <p>Tester agrees to keep all information related to Eyro OS strictly confidential, including features, UI/UX and workflows, architecture, PCS behavior, routing logic or system design, logs, screenshots, recordings or performance data, conversations, prompts or outputs, any documentation, notes or feedback, and any information about the beta program itself.</p>
          <p>Tester may not share, post, publish or disclose anything about Eyro OS; discuss the beta publicly or privately; show Eyro OS to third parties; or upload content to social media, Discord, Reddit, or forums.</p>
          <p>Confidentiality obligations survive indefinitely, even after the beta ends.</p>

          <p className="beta-section-label">3. No Reverse Engineering</p>
          <p>Tester agrees not to decompile, disassemble, or analyze the code; attempt to derive source code, architecture, or internal mechanisms; inspect network traffic, storage, or memory to extract implementation details; or build derivative works based on Eyro OS concepts or behavior.</p>
          <p>Any attempt to reverse engineer or replicate Eyro OS is a material breach.</p>

          <p className="beta-section-label">4. Ownership of IP</p>
          <p>All rights, title, and interest in Eyro OS, PCS (Persistent Cognitive State), routing law, capability graph, self-extension model, VRTx integration, and all related systems, tools, and designs remain 100% the property of Developer.</p>
          <p>Tester gains no rights to the software, concepts, architecture, or any derivative ideas. Any feedback, suggestions, or improvements provided by Tester become Developer's exclusive property without compensation.</p>

          <p className="beta-section-label">5. License to Use (Limited, Revocable)</p>
          <p>Developer grants Tester a non-exclusive, non-transferable, revocable license to use Eyro OS solely for testing. Developer may revoke access at any time, for any reason, without notice.</p>
          <p>Tester may not redistribute the software, copy or clone the software, use Eyro OS for commercial purposes, or install Eyro OS on unauthorized devices.</p>

          <p className="beta-section-label">6. Tester Responsibilities</p>
          <p>Tester agrees to use Eyro OS regularly during the beta, report bugs, crashes, or unexpected behavior, provide honest feedback, avoid malicious or destructive testing, and not attempt to overload or exploit the system.</p>
          <p>Tester understands Eyro OS is pre-release and may contain bugs, crashes, data loss, and incomplete features. Tester uses Eyro OS at their own risk.</p>

          <p className="beta-section-label">7. No Warranty</p>
          <p>Eyro OS is provided "as is" with no warranties of any kind, including performance, reliability, uptime, accuracy, or fitness for any purpose. Developer is not liable for data loss, device issues, downtime, errors, or damages of any kind.</p>

          <p className="beta-section-label">8. Term &amp; Termination</p>
          <p>This Agreement begins when Tester first accesses Eyro OS and continues until Developer ends the beta, Developer revokes Tester's access, or Tester stops using Eyro OS. Sections 2, 3, 4, 7, and 9 survive termination.</p>

          <p className="beta-section-label">9. Remedies</p>
          <p>If Tester breaches this Agreement, Developer may pursue immediate termination of access, injunctive relief, damages, legal fees, and any other remedies available under law. Tester acknowledges that unauthorized disclosure or reverse engineering would cause irreparable harm.</p>

          <p className="beta-section-label">10. Contribution Reward Program</p>
          <p>The Company (Vortex-Global) may reward eligible community contributions with VRTX and/or VRU tokens, subject to the following conditions:</p>
          <p><strong>Bug Fixes:</strong> Users who submit verified, functional bug fixes that are successfully merged into the official repository may receive compensation in VRTX and/or VRU. Reward amounts are determined based on the severity classification of the bug.</p>
          <p><strong>OS Upgrade Recommendations:</strong> Users who submit formal recommendations for Operating System upgrades — including detailed technical rationale, risk assessments, or deployment strategies — may receive VRTX and/or VRU upon official adoption or approval of the recommendation.</p>
          <p><strong>Discretionary Rights:</strong> All rewards are subject to technical verification. The Company reserves the right to determine eligibility, change reward structures, or select which token (VRTX, VRU, or a combination thereof) is distributed for any given submission.</p>

          <p className="beta-section-label">11. Governing Law</p>
          <p>This Agreement is governed by the laws of the State of Alabama, without regard to conflict-of-law principles.</p>

          <p className="beta-section-label">12. Entire Agreement</p>
          <p>This document constitutes the entire agreement between Developer and Tester regarding Eyro OS beta access and supersedes all prior discussions.</p>

          <p className="beta-section-label">13. Acceptance</p>
          <p>By installing, accessing, or using Eyro OS, Tester acknowledges they have read this Agreement, they understand it, and they agree to be bound by it. Tester's participation in the beta constitutes full acceptance.</p>

          <p style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 20 }}>
            Eyro OS — Beta NDA &amp; Tester Agreement · Version 1.0 · May 16, 2026<br/>
            Donovan / Vortex-Global — All rights reserved.
          </p>
        </div>

        <label className="beta-accept-row">
          <input
            type="checkbox"
            className="beta-checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
          />
          <span>I have read and agree to the Beta NDA &amp; Tester Agreement</span>
        </label>

        <a
          href={accepted ? BETA_DISCORD_URL : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => { if (!accepted) e.preventDefault() }}
          style={{
            display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 12,
            opacity: accepted ? 1 : 0.35, cursor: accepted ? 'pointer' : 'not-allowed',
          }}
          className={`btn-primary beta-finished-btn ${!accepted ? 'disabled' : ''}`}
        >
          Finished — Join the Beta Discord →
        </a>
      </div>
    </div>
  )
}

export function ConnectScreen() {
  const [showBeta, setShowBeta] = useState(false)

  function handleLogout() {
    clearAuth()
    clearSession()
    window.location.reload()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <EyroEye state="idle" size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>
          <div className="ob-eyebrow">No OS linked</div>
          <div className="ob-title">Scan to connect</div>
          <div className="ob-sub" style={{ marginBottom: 20 }}>
            Open EyroOS on your PC → go to step 5 → tap <strong style={{ color: 'var(--text-1)' }}>Generate QR</strong> → scan it with your phone.
          </div>
          <div className="ob-sub" style={{ opacity: 0.5, fontSize: 12, marginBottom: 20 }}>
            The QR code will open this app automatically with your OS linked.
          </div>
          <button className="btn-secondary" onClick={handleLogout}>Log out</button>

          <div className="login-beta-divider" style={{ marginTop: 20 }}>
            <span>Beta access</span>
          </div>
          <button className="btn-join-beta" type="button" onClick={() => setShowBeta(true)}>
            Join Beta
          </button>
        </div>
      </div>

      {showBeta && <BetaModal onClose={() => setShowBeta(false)} />}
    </div>
  )
}
