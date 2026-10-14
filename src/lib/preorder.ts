/**
 * preorder.ts — Eyro Mini reservations, through Vortex and Stripe Checkout.
 *
 * Signing in is encouraged, never required: a signed-in buyer's token rides
 * along so the reservation joins their account; a guest gives Stripe an email.
 */
import { AUTH_BASE, getToken } from './auth'

export type Plan = 'standard' | 'rush'

export interface PlanInfo {
  id: Plan
  label: string
  device_cents: number
  balance_cents: number
  delivery: string
}

export interface PreorderInfo {
  device: string
  deposit: { amount_cents: number; currency: string }
  plans: PlanInfo[]
  terms: string
}

export interface Reservation {
  id: string
  plan: Plan
  delivery: string
  status: 'reserved' | 'refunded'
  deposit_cents: number
  currency: string
  device_cents: number
  reserved_at: string
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  return t && t !== 'dev-token' ? { Authorization: `Bearer ${t}` } : {}
}

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(String((body as Record<string, unknown>).error ?? `Request failed (${res.status})`))
  return body as T
}

export async function fetchPreorderInfo(): Promise<PreorderInfo> {
  return json(await fetch(`${AUTH_BASE}/api/preorder`))
}

/** Start checkout and go to Stripe. */
export async function reserve(plan: Plan): Promise<void> {
  const { url } = await json<{ url: string }>(
    await fetch(`${AUTH_BASE}/api/preorder/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ plan }),
    }),
  )
  window.location.assign(url)
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  const { reservations } = await json<{ reservations: Reservation[] }>(
    await fetch(`${AUTH_BASE}/api/preorder/mine`, { headers: authHeaders() }),
  )
  return reservations
}

export async function fetchCheckoutResult(sessionId: string): Promise<{ paid: boolean; plan: Plan; delivery: string; email: string | null }> {
  return json(await fetch(`${AUTH_BASE}/api/preorder/session?id=${encodeURIComponent(sessionId)}`))
}

export function money(cents: number, currency = 'usd'): string {
  const whole = cents % 100 === 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100)
}
