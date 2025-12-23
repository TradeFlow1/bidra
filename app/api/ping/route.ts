export async function GET() {
  return new Response(JSON.stringify({ ok: true, route: "ping-app" }), {
    headers: { "Content-Type": "application/json" },
  });
}
