import type { APIRoute } from "astro";
import { login, logout, validSession } from "@lib/auth";
import { json, sameOrigin } from "@lib/http";

const attempts = new Map<string, { count: number; reset: number }>();

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin" }, 403);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.reset > now && current.count >= 8) return json({ error: "Too many sign-in attempts. Try again in a few minutes." }, 429);
  if (!current || current.reset <= now) attempts.set(ip, { count: 1, reset: now + 10 * 60 * 1000 });
  else current.count++;
  const body = await request.json().catch(() => ({}));
  if (typeof body.email !== "string" || typeof body.password !== "string" || body.password.length > 200) return json({ error: "Invalid credentials" }, 400);
  if (!await login(body.email, body.password, { cookies, request } as never)) return json({ error: "Email or password is incorrect" }, 401);
  attempts.delete(ip);
  return json({ ok: true });
};
export const DELETE: APIRoute = async ({ cookies }) => { logout({ cookies } as never); return json({ ok: true }); };
export const GET: APIRoute = async (context) => json({ authenticated: validSession(context) });
