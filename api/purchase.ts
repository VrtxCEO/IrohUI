/**
 * POST /api/purchase — the server half of the Meta Purchase event (Conversions
 * API), a Vercel function beside the static site.
 *
 * The confirmation page posts the Stripe Checkout Session id it was sent back
 * with. This asks Stripe whether that session was paid and for how much, sends
 * Meta the Purchase, and returns the amount so the page's pixel reports the
 * same event. Both use the session id as the event id, so Meta counts one.
 *
 * Environment (Vercel → Settings → Environment Variables):
 *   STRIPE_SECRET_KEY       a restricted key that can read Checkout Sessions
 *   META_CAPI_TOKEN         Events Manager → the pixel → Settings → Conversions API
 *   STRIPE_PAYMENT_LINK_ID  optional: plink_..., to ignore other Stripe sales
 *   META_TEST_EVENT_CODE    optional: TEST..., to see events in Test events
 * Without the first two it answers 503 and the page falls back to the pixel.
 */
import { createHash } from 'node:crypto'

const PIXEL_ID = '1137030735548932'
const SUCCESS_URL = 'https://eyro.io/preorder/success'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const clean = (s: unknown) => (typeof s === 'string' ? s.trim().toLowerCase() : '')

/** Meta wants personal fields normalised, then SHA-256 hashed, in an array. */
function hashed(value: unknown, normalise: (s: string) => string = (s) => s) {
  const v = normalise(clean(value))
  return v ? [sha256(v)] : undefined
}

function cookie(header: string | null, name: string) {
  const m = header?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

interface CheckoutSession {
  id: string
  created: number
  payment_status: string
  payment_link: string | null
  amount_total: number
  currency: string
  customer_details?: {
    email?: string | null
    name?: string | null
    phone?: string | null
    address?: { city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null } | null
  } | null
}

export async function POST(request: Request): Promise<Response> {
  const { STRIPE_SECRET_KEY, META_CAPI_TOKEN, STRIPE_PAYMENT_LINK_ID, META_TEST_EVENT_CODE } = process.env
  if (!STRIPE_SECRET_KEY || !META_CAPI_TOKEN) return json({ error: 'Not configured' }, 503)

  const { session_id } = (await request.json().catch(() => ({}))) as { session_id?: unknown }
  if (typeof session_id !== 'string' || !/^cs_(test|live)_\w+$/.test(session_id)) return json({ error: 'Bad session id' }, 400)

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  })
  if (!res.ok) return json({ error: 'Unknown session' }, 404)
  const s = (await res.json()) as CheckoutSession
  if (STRIPE_PAYMENT_LINK_ID && s.payment_link !== STRIPE_PAYMENT_LINK_ID) return json({ error: 'Unknown session' }, 404)
  if (s.payment_status !== 'paid') return json({ paid: false })

  const value = s.amount_total / 100
  const currency = s.currency.toUpperCase()

  // Global Privacy Control is the opt-out eyro.io/privacy offers: the pixel
  // doesn't load, and nothing goes to Meta from here either.
  if (request.headers.get('sec-gpc') !== '1') {
    const d = s.customer_details ?? {}
    const a = d.address ?? {}
    const [first = '', ...rest] = clean(d.name).split(/\s+/)
    const cookies = request.headers.get('cookie')
    const event = {
      event_name: 'Purchase',
      event_time: s.created,
      event_id: s.id,
      action_source: 'website',
      event_source_url: SUCCESS_URL,
      user_data: {
        em: hashed(d.email),
        ph: hashed(d.phone, (p) => p.replace(/\D/g, '')),
        fn: hashed(first),
        ln: hashed(rest.join(' ')),
        ct: hashed(a.city, (c) => c.replace(/[^a-z]/g, '')),
        st: hashed(a.state, (c) => c.replace(/[^a-z]/g, '')),
        zp: hashed(a.postal_code, (z) => z.replace(/\s/g, '')),
        country: hashed(a.country),
        client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim(),
        client_user_agent: request.headers.get('user-agent') ?? undefined,
        fbp: cookie(cookies, '_fbp'),
        fbc: cookie(cookies, '_fbc'),
      },
      custom_data: { value, currency, content_name: 'Eyro Mini reservation' },
    }
    // The buyer has paid either way; a failure here only costs Meta the
    // server copy, so log it rather than fail the page.
    const meta = await fetch(`https://graph.facebook.com/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], access_token: META_CAPI_TOKEN, test_event_code: META_TEST_EVENT_CODE || undefined }),
    }).catch((e: unknown) => e)
    if (!(meta instanceof Response) || !meta.ok) {
      console.error('Meta Conversions API failed:', meta instanceof Response ? await meta.text() : meta)
    }
  }

  return json({ paid: true, value, currency })
}
