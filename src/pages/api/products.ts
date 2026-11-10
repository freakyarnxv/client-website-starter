import type { APIRoute } from "astro";
import { db, initDb } from "@lib/db";
import { json } from "@lib/http";

export const GET: APIRoute = async () => {
  await initDb();
  const result = await db().execute("SELECT id,name,description,price,image,category FROM products WHERE active=1 ORDER BY created_at DESC");
  return json(result.rows.map((row) => ({ ...row, price: Number(row.price) / 100 })));
};
