/**
 * Site switch. Until the SITE_OUVERT variable is set to "oui" in Cloudflare
 * (Settings → Variables and secrets, then redeploy), every page shows a
 * "coming soon" notice and pre-orders are refused. Nothing else changes.
 */
type Env = { SITE_OUVERT?: string }

const PAGE = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>TrailDex — bientôt</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0a0a0b; color: #f5f5f7;
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif; text-align: center; padding: 24px }
  h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: -0.02em }
  p { margin: 0; color: #a1a1a6 }
</style>
</head>
<body>
  <main>
    <h1>Bientôt disponible</h1>
    <p>Les cartes de collection pour traileurs arrivent très vite.</p>
  </main>
</body>
</html>`

export const onRequest = async ({ request, env, next }: { request: Request; env: Env; next: () => Promise<Response> }) => {
  if (env.SITE_OUVERT === "oui") return next()
  const headers = { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" }
  if (new URL(request.url).pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Les précommandes ne sont pas encore ouvertes." }), {
      status: 503,
      headers: { ...headers, "content-type": "application/json; charset=utf-8" },
    })
  }
  return new Response(PAGE, { status: 503, headers: { ...headers, "content-type": "text/html; charset=utf-8" } })
}
