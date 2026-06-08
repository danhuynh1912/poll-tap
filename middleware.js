/**
 * POLLTAP — Vercel Edge Middleware
 *
 * Intercepts /vote/:id requests and injects dynamic Open Graph meta tags
 * so link previews in Messenger / Zalo / iMessage show the vote's actual
 * title, slot count, and deadline — not the generic index.html fallback.
 *
 * Works at the edge (no cold-start), runs before the SPA is served.
 */

export const config = {
  matcher: '/vote/:id*',
}

export default async function middleware(request) {
  const url = new URL(request.url)

  // Strip query string to get the bare vote ID
  const voteId = url.pathname.replace('/vote/', '').split('/')[0]
  if (!voteId) return new Response(null, { status: 404 })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  // ── Fetch vote data from Supabase REST (no SDK needed at edge) ──
  let ogTitle = 'Attendance vote — POLLTAP'
  let ogDesc  = 'Tap to vote. No login needed.'

  try {
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    }

    const [voteRes, respRes] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/votes?id=eq.${voteId}&select=title,match_date,max_slots,deadline,is_closed`,
        { headers }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/responses?vote_id=eq.${voteId}&attending=eq.true&select=guests`,
        { headers }
      ),
    ])

    const [vote]    = await voteRes.json()
    const responses = await respRes.json()

    if (vote) {
      const filled = Array.isArray(responses)
        ? responses.reduce((sum, r) => sum + 1 + (r.guests || 0), 0)
        : 0

      const isClosed =
        vote.is_closed || new Date(vote.deadline).getTime() < Date.now()

      const deadline = new Date(vote.deadline).toLocaleDateString('en', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })

      const status = isClosed ? '🔒 Closed' : '🟢 Open for voting'
      const open   = vote.max_slots - filled

      ogTitle = `${vote.title} — POLLTAP`
      ogDesc  = isClosed
        ? `${filled}/${vote.max_slots} slots filled · ${status}`
        : `${filled}/${vote.max_slots} slots filled · ${open} open · Deadline ${deadline} · ${status}`
    }
  } catch {
    // Silently fall back to generic tags if Supabase is unreachable
  }

  const pageUrl  = url.href
  const imageUrl = `${url.origin}/og.png`

  // ── Fetch the SPA shell from Vercel's static layer ──
  const staticRes = await fetch(url.origin + '/', {
    headers: { 'x-middleware-subrequest': '1' },
  })
  const html = await staticRes.text()

  // ── Strip any existing og/twitter tags injected at build time ──
  const stripped = html.replace(
    /<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gi,
    ''
  )

  // ── Inject fresh dynamic tags ──
  const tags = `
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
  `

  const injected = stripped.replace('</head>', `${tags}\n  </head>`)

  return new Response(injected, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Short cache so slot count stays reasonably fresh
      'cache-control': 'public, max-age=30, stale-while-revalidate=60',
    },
  })
}
