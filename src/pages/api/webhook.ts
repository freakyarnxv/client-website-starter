import type { APIRoute } from "astro";
import Stripe from "stripe";
import { db, initDb } from "@lib/db";

export const POST: APIRoute = async ({ request }) => {
  const key = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !webhookSecret) return new Response("Webhook is not configured", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try { event = new Stripe(key).webhooks.constructEvent(await request.text(), signature, webhookSecret); }
  catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await initDb();
    await db().execute({ sql: "UPDATE orders SET status='paid' WHERE stripe_session=?", args: [session.id] });
  }
  return new Response("ok");
};
