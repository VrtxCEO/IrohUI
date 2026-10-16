/**
 * preorder.ts — Eyro Mini reservations, through a Stripe Payment Link.
 *
 * The amounts below are shown on the page only. Stripe charges whatever the
 * Payment Link's price is, so change both together.
 */

export const RESERVE_URL = 'https://buy.stripe.com/eVqeVd3qr1kLbv0ajTdMI00'
export const SITE_URL = 'https://eyro.io'

export const DEVICE_PRICE = 699
export const RESERVE_PRICE = 30
export const SHIPPING = 'January 2027'
export const REFUND_BY = 'January 31, 2027'
export const BALANCE = DEVICE_PRICE - RESERVE_PRICE

// The Stripe promotion code a mailing-list signup is shown on the page. It
// must exist in Stripe, and the Payment Link must allow promotion codes.
// Empty: the page tells them to check their inbox instead.
export const PROMO_CODE = 'AGENT50'

/** The Payment Link, with the promotion code already filled in at checkout. */
export function reserveUrl(code = ''): string {
  return code ? `${RESERVE_URL}?prefilled_promo_code=${encodeURIComponent(code)}` : RESERVE_URL
}

// Same Buttondown list and tag as omni-ouro.com's signup form. A reservation
// is a purchase, not support, so eyro.io never applies a payer tag. The tag
// name must match the Buttondown dashboard exactly, or it creates a new tag.
const MAILING_LIST_ENDPOINT = 'https://buttondown.com/api/emails/embed-subscribe/OmniDon'
const LIST_ONLY_TAG = 'List-only'

/** Resolves true when Buttondown accepted the email. A successful signup may
 *  redirect to a Buttondown page, which counts as success. */
export async function subscribe(email: string): Promise<boolean> {
  const form = new FormData()
  form.set('email', email)
  form.set('tag', LIST_ONLY_TAG)
  const res = await fetch(MAILING_LIST_ENDPOINT, { method: 'POST', body: form, redirect: 'manual' })
  return res.ok || res.type === 'opaqueredirect'
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/** The phone's share sheet where there is one, otherwise copy the link. */
export async function shareEyro(): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Eyro Mini',
        text: `Eyro Mini: reserve one for $${RESERVE_PRICE}. Shipments start ${SHIPPING}.`,
        url: SITE_URL,
      })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(SITE_URL)
    return 'copied'
  } catch {
    return 'failed'
  }
}
