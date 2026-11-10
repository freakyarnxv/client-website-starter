# Wariours Shop

An Astro storefront for an independent clothing label. The storefront reads its catalog from a private Turso/libSQL database, and `/admin` is protected by a server-signed, HttpOnly session cookie. Payments use Stripe Checkout; card data stays with Stripe.

## Run locally

1. Install dependencies with `npm install`.
2. Create a Turso database, copy `.env.example` to `.env`, and set the database URL and auth token.
3. Create a Stripe account and set a test secret key. Set `STRIPE_WEBHOOK_SECRET` from the Stripe CLI listener (`stripe listen --forward-to localhost:4321/api/webhook`).
4. Create an admin password hash: `node -e "console.log(require('bcryptjs').hashSync('choose-a-long-password', 12))"`. Put the resulting hash and your email in `ADMIN_PASSWORD_HASH` and `ADMIN_EMAIL`.
5. Generate a session secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and set `SESSION_SECRET`.
6. Run `npm run dev`, open `/admin`, and add products. Tables are created on the first API request.

## Payments and launch

Checkout amounts are fetched from the database on the server; client-submitted prices are ignored. Stripe's signed webhook marks orders paid. Before accepting live payments, configure a production webhook endpoint for `/api/webhook`, set production Stripe keys and `CURRENCY`, and confirm tax, shipping, refunds, privacy and consumer policies for the markets you serve. The checkout currently collects payment only; it does not collect shipping addresses or fulfill orders.

Deploy the Node adapter output from `npm run build` to a Node-compatible host with the environment values above. Use HTTPS, a durable Turso database, and a trusted reverse proxy. The login limiter is process-local; set an edge/platform rate limit on `/api/admin/session` for multi-instance deployments. Set your actual domain in `astro.config.mjs` before launch.

## Admin operations

- Visit `/admin` and sign in with the single environment-provisioned admin account.
- Add a product, change its price, or remove it from the public collection. Removed products remain archived so old orders still refer to valid records.
- There is no public registration or admin API without a valid session.

The newsletter form is a visual starter interaction and does not submit or store addresses yet. Connect a mailing-list provider before using it.

