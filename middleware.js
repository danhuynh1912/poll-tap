/**
 * POLLTAP — Vercel Edge Middleware
 *
 * Intercepts /vote/:id requests from link-preview crawlers (Facebook,
 * Messenger, Zalo, iMessage, Telegram, Discord…) and returns a minimal
 * HTML page with dynamic Open Graph meta tags.
 *
 * Real users are passed straight through to the Vite SPA — no overhead.
 */

export const config = {
  matcher: '/vote/:id*',
}

// Known link-preview crawler User-Agent patterns
const BOT_RE =
  /facebookexternalhit|Facebot|facebookcatalog|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Discordbot|Slackbot|Googlebot|bingbot|Applebot|ZaloPC|zalo/i

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''

  // ── Real users: pass straight through to the SPA ──────────────────
  if (!BOT_RE.test(ua)) return

  // ── Crawlers: build dynamic OG HTML ───────────────────────────────
  const url    = new URL(request.url)
  const voteId = url.pathname.replace(/^\/vote\//, '').split('/')[0]

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  let ogTitle = 'Attendance vote — POLLTAP'
  let ogDesc  = 'Tap to vote Yes or No. No login needed.'

  // Fetch vote data (best-effort — falls back to generic tags on error)
  if (supabaseUrl && supabaseKey && voteId) {
    try {
      const h = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }

      const [voteRes, respRes] = await Promise.all([
        fetch(
          `${supabaseUrl}/rest/v1/votes?id=eq.${voteId}&select=title,match_date,max_slots,deadline,is_closed`,
          { headers: h }
        ),
        fetch(
          `${supabaseUrl}/rest/v1/responses?vote_id=eq.${voteId}&attending=eq.true&select=guests`,
          { headers: h }
        ),
      ])

      const [vote] = await voteRes.json()
      const resps  = await respRes.json()

      if (vote) {
        const filled   = Array.isArray(resps)
          ? resps.reduce((s, r) => s + 1 + (r.guests || 0), 0)
          : 0
        const isClosed = vote.is_closed || new Date(vote.deadline) < new Date()
        const open     = Math.max(0, vote.max_slots - filled)
        const deadline = new Date(vote.deadline).toLocaleDateString('en', {
          weekday: 'short', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })

        ogTitle = `${vote.title} — POLLTAP`
        ogDesc  = isClosed
          ? `${filled}/${vote.max_slots} slots filled · 🔒 Voting closed`
          : `${filled}/${vote.max_slots} slots filled · ${open} spot${open !== 1 ? 's' : ''} left · Deadline ${deadline} · 🟢 Open`
      }
    } catch {
      // fall through to generic tags
    }
  }

  const pageUrl  = url.href
  const imageUrl = `${url.origin}/og.png`

  // Minimal HTML — just enough for crawlers to read OG tags.
  // The <body> content is visible only if a bot renders the page.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDesc}" />

  <meta property="fb:app_id"        content="${process.env.FB_APP_ID || ''}" />
  <meta property="og:site_name"    content="POLLTAP" />
  <meta property="og:type"         content="website" />
  <meta property="og:url"          content="${pageUrl}" />
  <meta property="og:title"        content="${ogTitle}" />
  <meta property="og:description"  content="${ogDesc}" />
  <meta property="og:image"        content="${imageUrl}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="${ogTitle}" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:image"       content="${imageUrl}" />
</head>
<body>
  <h1>${ogTitle}</h1>
  <p>${ogDesc}</p>
</body>
</html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Short cache so slot count stays fresh (30 s serve, up to 60 s stale)
      'cache-control': 'public, max-age=30, stale-while-revalidate=60',
    },
  })
}
