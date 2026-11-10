import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { validSession } from "@lib/auth";
import { db, initDb } from "@lib/db";
import { json, sameOrigin } from "@lib/http";

export const GET: APIRoute = async (context) => {
  if (!validSession(context)) return json({ error: "Unauthorized" }, 401);
  await initDb();
  const result = await db().execute("SELECT id,name,description,price,image,category,active FROM products ORDER BY created_at DESC");
  return json(result.rows.map((row) => ({ ...row, price: Number(row.price) / 100 })));
};
export const POST: APIRoute = async (context) => {
  if (!validSession(context)) return json({ error: "Unauthorized" }, 401);
  if (!sameOrigin(context.request)) return json({ error: "Invalid request origin" }, 403);
  const body = await context.request.json().catch(() => ({}));
  const { name, description, price, image, category } = body;
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 100 || typeof description !== "string" || description.length > 1000 || !Number.isFinite(price) || price <= 0 || price > 100000 || typeof image !== "string" || image.length > 500 || (image && !/^https:\/\//i.test(image)) || typeof category !== "string" || !["Tops", "Bottoms", "Layers"].includes(category)) return json({ error: "Check the product details and try again" }, 400);
  await initDb();
  const id = randomUUID();
  await db().execute({ sql: "INSERT INTO products(id,name,description,price,image,category) VALUES(?,?,?,?,?,?)", args: [id, name.trim(), description.trim(), Math.round(price * 100), image.trim(), category.trim()] });
  return json({ id }, 201);
};
export const PATCH: APIRoute = async (context) => {
  if (!validSession(context)) return json({ error: "Unauthorized" }, 401);
  if (!sameOrigin(context.request)) return json({ error: "Invalid request origin" }, 403);
  const body = await context.request.json().catch(() => ({}));
  if (typeof body.id !== "string" || !/^[\da-f-]{36}$/i.test(body.id) || (body.price !== undefined && (!Number.isFinite(body.price) || body.price <= 0 || body.price > 100000))) return json({ error: "Invalid product update" }, 400);
  await initDb();
  const result = body.price === undefined
    ? await db().execute({ sql: "UPDATE products SET active=0 WHERE id=?", args: [body.id] })
    : await db().execute({ sql: "UPDATE products SET price=? WHERE id=?", args: [Math.round(body.price * 100), body.id] });
  return result.rowsAffected ? json({ ok: true }) : json({ error: "Product not found" }, 404);
};
