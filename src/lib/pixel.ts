/**
 * pixel.ts — events for the Meta Pixel, which index.html loads.
 *
 * The pixel isn't loaded for visitors whose browser sends Global Privacy
 * Control (see index.html and /privacy), so every call here may be a no-op.
 */
import { RESERVE_PRICE } from './preorder'

type Fbq = (cmd: 'track', event: string, params?: Record<string, unknown>) => void

function track(event: string, params?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (fbq) fbq('track', event, params)
}

const reservation = { value: RESERVE_PRICE, currency: 'USD', content_name: 'Eyro Mini reservation' }

/** A Reserve button was clicked, on the way to Stripe. */
export const trackCheckout = () => track('InitiateCheckout', reservation)

/** Someone joined the mailing list. */
export const trackLead = () => track('Lead', { content_name: 'Eyro mailing list' })

/** Stripe sent a buyer back to /preorder/success. Counted once per browser
 *  session, so reloading the page doesn't count it again. */
export function trackPurchase() {
  const key = 'eyro-purchase-tracked'
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // Storage blocked: count it anyway.
  }
  track('Purchase', reservation)
}
