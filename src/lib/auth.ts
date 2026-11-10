import { timingSafeEqual, createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import type { APIContext } from "astro";

const cookieName = "atelier_admin";
function secret() {
  const value = import.meta.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return value;
}
function signature(payload: string) { return createHmac("sha256", secret()).update(payload).digest("hex"); }
export function validSession(context: APIContext) {
  const value = context.cookies.get(cookieName)?.value;
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  const expected = signature(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const [user, expires] = Buffer.from(payload, "base64url").toString().split(":");
  return user === import.meta.env.ADMIN_EMAIL && Number(expires) > Date.now();
}
export async function login(email: string, password: string, context: APIContext) {
  const configuredEmail = import.meta.env.ADMIN_EMAIL;
  const hash = import.meta.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !hash) throw new Error("Admin credentials are not configured");
  const emailMatch = email.trim().toLowerCase() === configuredEmail.toLowerCase();
  const passwordMatch = await bcrypt.compare(password, hash);
  if (!(emailMatch && passwordMatch)) return false;
  const payload = Buffer.from(`${configuredEmail}:${Date.now() + 8 * 60 * 60 * 1000}`).toString("base64url");
  context.cookies.set(cookieName, `${payload}.${signature(payload)}`, { httpOnly: true, secure: import.meta.env.PROD, sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
  return true;
}
export function logout(context: APIContext) { context.cookies.delete(cookieName, { path: "/" }); }
