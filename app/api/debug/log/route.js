// app/api/debug/log/route.js
export async function POST(req) {
  const body = await req.json()
  console.log('Client Debug Log:', body)
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
