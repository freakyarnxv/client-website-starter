import type { APIRoute } from "astro";
import Stripe from "stripe";
import { db, initDb } from "@lib/db";
import { json, sameOrigin } from "@lib/http";

export const POST: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const key = import.meta.env.STRIPE_SECRET_KEY;
  if (!key) return json({ error: "Checkout is not configured yet" }, 503);
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) return json({ error: "Your bag is empty" }, 400);
  await initDb();
  const ids: string[] = [...new Set<string>(body.items.map((item: { id?: string }) => item?.id).filter((id: unknown): id is string => typeof id === "string"))];
  if (!ids.length || ids.length !== body.items.length) return json({ error: "Invalid bag" }, 400);
  const placeholders = ids.map(() => "?").join(",");
  const result = await db().execute({ sql: `SELECT id,name,price FROM products WHERE active=1 AND id IN (${placeholders})`, args: ids });
  if (result.rows.length !== ids.length) return json({ error: "A product in your bag is no longer available" }, 409);
  const byId = new Map(result.rows.map((row) => [String(row.id), row]));
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: body.items.map((item: { id: string; quantity?: number }) => {
      const product = byId.get(item.id)!;
      const quantity = Number.isInteger(item.quantity) ? Math.min(Math.max(item.quantity!, 1), 10) : 1;
      return { quantity, price_data: { currency: import.meta.env.CURRENCY || "inr", unit_amount: Number(product.price), product_data: { name: String(product.name) } } };
    }),
    success_url: `${url.origin}/?order=success`, cancel_url: `${url.origin}/?order=cancelled`,
  });
  await db().execute({ sql: "INSERT INTO orders(id,stripe_session,amount,currency) VALUES(?,?,?,?)", args: [session.id, session.id, session.amount_total ?? 0, session.currency ?? "inr"] });
  return json({ url: session.url });
};
