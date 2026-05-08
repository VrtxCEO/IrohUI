/**
 * auth.ts — Vortex account auth + EyroOS session management
 *
 * Web app auth  → POST /api/auth/login  (Vortex Next.js app)
 * OS session    → derived from QR binding payload, stored in localStorage
 * Connection    → HMAC-SHA256(key=os_instance_id, msg=code) — both sides derive independently
 */

const AUTH_BASE = import.meta.env.VITE_AUTH_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  name?: string
  isAdmin: boolean
  role: string
}

export interface OsSession {
  os_instance_id: string
  connection_token: string
  public_key: string
  relay_url: string
  direct_url: string
  bound_at: string
}

export interface BindPayload {
  os_instance_id: string
  code: string
  exp: string
  public_key: string
  email?: string
  relay?: string
  direct?: string
}

// ---------------------------------------------------------------------------
// Vortex auth
// ---------------------------------------------------------------------------

export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${AUTH_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(String(err['error'] ?? err['message'] ?? `Login failed (${res.status})`))
  }
  const data = await res.json()
  return { token: data.accessToken, user: data.user }
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<{ user: AuthUser }> {
  const res = await fetch(`${AUTH_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(String(err['error'] ?? err['message'] ?? `Registration failed (${res.status})`))
  }
  const data = await res.json()
  return { user: data.user }
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

const TOKEN_KEY   = 'vortex_token'
const USER_KEY    = 'vortex_user'
const SESSION_KEY = 'eyro_session'
const OB_KEY      = 'eyro_ob_data'

export function storeToken(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ---------------------------------------------------------------------------
// OS session
// ---------------------------------------------------------------------------

export function storeSession(session: OsSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): OsSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ---------------------------------------------------------------------------
// Onboarding data (sanitised — no passwords or API keys)
// ---------------------------------------------------------------------------

export function storeObData(data: Record<string, unknown>): void {
  const safe = {
    username:       data['username'],
    agentName:      data['agentName'],
    agentPhone:     data['agentPhone'],
    twoFaPhone:     data['twoFaPhone'],
    cryptoWallet:   data['cryptoWallet'],
    gloveConnected: data['gloveConnected'],
    riskAuth:       data['riskAuth'],
  }
  localStorage.setItem(OB_KEY, JSON.stringify(safe))
}

export function getObData(): Record<string, unknown> | null {
  const raw = localStorage.getItem(OB_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// ---------------------------------------------------------------------------
// QR payload parser
// ---------------------------------------------------------------------------

export function parseBindPayload(encoded: string): BindPayload | null {
  try {
    const padded = encoded + '=='.slice((encoded.length + 3) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as BindPayload
  } catch {
    return null
  }
}

export function isBindPayloadExpired(payload: BindPayload): boolean {
  return Date.now() > new Date(payload.exp).getTime()
}

// ---------------------------------------------------------------------------
// Connection token derivation
// HMAC-SHA256(key=os_instance_id, msg=code) — mirrors Python implementation
// ---------------------------------------------------------------------------

export async function deriveConnectionToken(osInstanceId: string, code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(osInstanceId),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(code))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ---------------------------------------------------------------------------
// Binding confirmation — POST to OS direct API
// ---------------------------------------------------------------------------

export async function confirmBinding(
  directUrl: string,
  code: string,
  userId: string,
  email: string,
): Promise<void> {
  const res = await fetch(`${directUrl.replace(/\/$/, '')}/api/binding/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, user_id: userId, email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error(String(err['detail'] ?? `Binding failed (${res.status})`))
  }
}

// ---------------------------------------------------------------------------
// Binding status check — GET /api/binding/status
// ---------------------------------------------------------------------------

export async function fetchBindingStatus(baseUrl: string): Promise<{ bound: boolean; bound_email?: string }> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/binding/status`)
  if (!res.ok) throw new Error(`Status check failed (${res.status})`)
  return res.json()
}
