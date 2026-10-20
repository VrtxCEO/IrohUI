/**
 * pixel.ts — events for the Meta Pixel, which index.html loads.
 *
 * The pixel isn't loaded for visitors whose browser sends Global Privacy
 * Control (see index.html and /privacy), so every call here may be a no-op.
 * Purchase also goes to Meta from the server (api/purchase.ts).
 */
import { RESERVE_PRICE } from './preorder'

type Fbq = (cmd: 'track', event: string, params?: Record<string, unknown>, options?: { eventID: string }) => void

function track(event: string, params?: Record<string, unknown>, eventID?: string) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (fbq) fbq('track', event, params, eventID ? { eventID } : undefined)
}

const reservation = { value: RESERVE_PRICE, currency: 'USD', content_name: 'Eyro Mini reservation' }

/** A Reserve button was clicked, on the way to Stripe. */
export const trackCheckout = () => track('InitiateCheckout', reservation)

/** Someone joined the mailing list. */
export const trackLead = () => track('Lead', { content_name: 'Eyro mailing list' })

/** Stripe sent a buyer back to /preorder/success. The server checks the
 *  session with Stripe, reports it to Meta, and returns what was paid; the
 *  pixel then reports the same purchase under the same event id, so Meta
 *  deduplicates them. Counted once per checkout, so a reload doesn't repeat it. */
export async function trackPurchase(sessionId: string | null) {
  const key = `eyro-purchase-tracked:${sessionId ?? ''}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // Storage blocked: count it anyway.
  }
  if (!sessionId) return track('Purchase', reservation)
  if ((navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl) return

  const res = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  }).catch(() => null)
  const body = res?.ok ? await res.json().catch(() => null) : null
  if (body && !body.paid) return // not paid (yet): nothing to count
  const params = body ? { ...reservation, value: body.value, currency: body.currency } : reservation
  track('Purchase', params, sessionId)
}
