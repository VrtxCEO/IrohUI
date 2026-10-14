# Eyro Mini pre-orders: status

Where the eyro.io pre-order work stands, and what's left before it takes real
money. Written 2026-10-14.

The work spans two repos, each on a branch named `eyro-mini-preorder`,
committed locally and **not pushed**:

| Repo | Folder | Commit | What it holds |
| --- | --- | --- | --- |
| EyroUI (`VrtxCEO/IrohUI`), the eyro.io site | `Desktop/Omni-Ouro/Eyro/EyroUI` | f8355e1 | The pages |
| Vortex (`VrtxCEO/vortex-enterprises`) | `Desktop/New folder (3)` | 7ab2255 | The Stripe key, checkout, webhook, database |

Vortex's own setup doc is `EYRO_MINI_PREORDERS.md` in its repo.

## What's being sold

| Order | Device price | Expected | Reserve today | Due at shipping |
| --- | --- | --- | --- | --- |
| Standard | $699 | February 2027 | $20 | $679 |
| Rush | $750 | December 2026 | $20 | $730 |

Eyro Mini: Intel N95, 16 GB RAM, 512 GB SSD, Linux with Eyro built in.

The $20 is fully refundable until the unit ships, and is credited toward the
price. Delivery dates are estimates: if one slips, the buyer is told and can
cancel for a full refund.

## Done

**eyro.io (EyroUI)**
- The home page is the pre-order page: the specs, Standard or Rush, and one
  "Reserve for $20" button that goes straight to Stripe Checkout.
- Signing in is offered, not required. A guest gives Stripe their email, and
  the reservation joins their account later by that email. A signed-in buyer
  sees their reservations on the page.
- `/preorder/success` is where Stripe returns buyers. What it shows comes from
  Stripe.
- The existing Eyro app (sign-in, pairing, the shell) moved to `/app`. Old
  pairing QR links (`?p=`) still open it, and `/manifesto` is unchanged.
- The deposit amount, prices and terms text all come from Vortex, so the page
  never disagrees with checkout.
- Type-checked, lint-clean and builds.

**Vortex**
- `GET /api/preorder`: the deposit (read from Stripe), both orders, the terms.
- `POST /api/preorder/checkout`: creates the Stripe Checkout session.
- `GET /api/preorder/mine`: a signed-in buyer's reservations, guest ones
  included by email.
- `GET /api/preorder/session`: what the confirmation page shows.
- `POST /api/webhooks/stripe`: the only thing that records a reservation as
  paid. It checks Stripe's signature first, records each payment once even if
  Stripe resends it, and marks refunds.
- A new `Preorder` table, with its migration file.
- A rate limit on `/api/preorder`, beside `/api/purchase`'s.
- The lockfile now matches package.json (`next-mdx-remote` 6, asked for since
  February), plus the Stripe SDK.
- Adds no type errors (the project has 30 before and after) and lint-clean.

## Not done

- **Never run against Stripe.** Nothing has been through a real or test-mode
  checkout yet; that needs the keys below.
- **The migration hasn't been run** on the database.
- **Neither branch is pushed.** Pushing EyroUI's main deploys eyro.io.
- **Collecting the balance.** Nothing charges the $679 / $730 at shipping yet,
  or asks for a shipping address. Both happen later, outside this flow.
- **Emails from you.** The confirmation page says you'll email buyers before
  their unit ships. Nothing sends that email yet.
- **An admin view of reservations.** For now they're in Stripe and the
  `Preorder` table.

## Setting up Stripe and going live

Do these in order.

1. **The product's price.** In Stripe, open the pre-order product and make
   sure its **default price** is the $20 one-time price. The site reads the
   amount from there.
2. **Vortex's environment variables** in Vercel (Settings → Environment
   Variables). They go there, never in the code or a chat:
   - `STRIPE_SECRET_KEY`: start with the test key (`sk_test_...`).
   - `STRIPE_PREORDER_PRODUCT_ID`: the product's id (`prod_...`).
   - `STRIPE_WEBHOOK_SECRET`: from step 3 (`whsec_...`).
   - `EYRO_SITE_URL`: optional. It defaults to `https://eyro.io`, where Stripe
     sends buyers back.
3. **The webhook.** In Stripe → Developers → Webhooks, add an endpoint at
   `https://<Vortex's address>/api/webhooks/stripe` with these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded`

   Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
4. **The database.** With `DATABASE_URL` set to the production database, run
   `node migrate-production.js` in the Vortex folder. It creates the
   `Preorder` table.
5. **Deploy Vortex first, then EyroUI.** The page calls Vortex, so Vortex has
   to be live before the page is.
6. **Test in test mode,** on eyro.io itself (see the first caution below):
   - reserve once signed in and once as a guest, with card
     `4242 4242 4242 4242`;
   - check both appear in Stripe and in the `Preorder` table, and that the
     signed-in one shows on the page;
   - refund one in Stripe and check it's marked `refunded`.
7. **Go live.** Swap in the live secret key, make a live webhook endpoint (its
   secret differs from the test one), and update `STRIPE_WEBHOOK_SECRET`.
   Optionally turn on "Successful payments" emails in Stripe so buyers get a
   receipt.

## Cautions

- **Only `https://eyro.io` can reserve.** Vortex accepts browser requests from
  exactly that address, so Vercel preview links and `www.eyro.io` can't reach
  checkout. Widen the list in Vortex's `middleware.ts` (`CORS_ORIGIN`) if you
  want to test on previews.
- **The Rush date is a commitment.** US mail-order rules require a reasonable
  basis for promising December delivery, and notice plus a refund offer if a
  date slips. The page and checkout call the dates estimates, but the N95
  isn't signed off yet.
- **Check the page's wording** before launch. Besides the specs, it says:
  "Your agent works on your desk, under rules you set: it asks, and Eyro
  decides."
