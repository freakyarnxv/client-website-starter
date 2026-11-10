export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin === new URL(request.url).origin;
  const referer = request.headers.get("referer");
  return !!referer && new URL(referer).origin === new URL(request.url).origin;
}
