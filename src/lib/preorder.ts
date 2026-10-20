/**
 * preorder.ts — Eyro Mini reservations, through a Stripe Payment Link.
 *
 * The amounts below are shown on the page only. Stripe charges whatever the
 * Payment Link's price is, so change both together.
 */

export const RESERVE_URL = 'https://buy.stripe.com/eVqeVd3qr1kLbv0ajTdMI00'
export const SITE_URL = 'https://eyro.io'
export const MANIFESTO_URL = 'https://www.omni-ouro.com/manifesto'

// The monthly giveaway: being in this server at the end of a month is the
// entry. Rules at /giveaway; the draw is scripts/giveaway-draw.mjs.
export const DISCORD_URL = 'https://discord.gg/2WNKQY8wdc'
export const GIVEAWAY_START = 'January 2027'

export const REGULAR_PRICE = 699
export const RESERVE_PRICE = 30
export const SHIPPING = 'January 2027'
export const REFUND_BY = 'January 31, 2027'

// Pre-order pricing: orders placed before January cost PREORDER_PRICE. At
// midnight Central on January 1 the site goes back to the regular price by
// itself, so it never shows an expired deal.
export const PREORDER_PRICE = 529
export const DEAL_ENDS = 'December 31, 2026'
export const DEAL_ACTIVE = Date.now() < Date.parse('2027-01-01T00:00:00-06:00')
export const DEAL_PERCENT = Math.round((1 - PREORDER_PRICE / REGULAR_PRICE) * 100)

/** What an Eyro Mini costs if you reserve today. */
export const DEVICE_PRICE = DEAL_ACTIVE ? PREORDER_PRICE : REGULAR_PRICE
/** Due when it ships: the price less the full reservation, whether or not
 *  the reservation was paid with the promotion code. */
export const BALANCE = DEVICE_PRICE - RESERVE_PRICE

// The Stripe promotion code a mailing-list signup is shown on the page. It
// must exist in Stripe, and the Payment Link must allow promotion codes.
// Empty: the page tells them to check their inbox instead.
export const PROMO_CODE = 'AGENT50'

/** The Payment Link, with the promotion code already filled in at checkout. */
export function reserveUrl(code = ''): string {
  return code ? `${RESERVE_URL}?prefilled_promo_code=${encodeURIComponent(code)}` : RESERVE_URL
}

// Same Buttondown list and List-only tag as omni-ouro.com's signup form, plus
// EyroMini to mark who came through eyro.io. A reservation is a purchase, not
// support, so eyro.io never applies a payer tag. Tag names must match the
// Buttondown dashboard exactly, or it creates a new tag.
const MAILING_LIST_ENDPOINT = 'https://buttondown.com/api/emails/embed-subscribe/OmniDon'
const TAGS = ['List-only', 'EyroMini']

/** Resolves true when Buttondown accepted the email. A successful signup may
 *  redirect to a Buttondown page, which counts as success. */
export async function subscribe(email: string): Promise<boolean> {
  const form = new FormData()
  form.set('email', email)
  for (const tag of TAGS) form.append('tag', tag)
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
