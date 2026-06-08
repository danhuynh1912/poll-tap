# 🏸 POLLTAP — Poll + Tap

**The Future of Club Attendance Architecture.**

A production-ready, no-login attendance voting app ("gom gạch") for sports clubs.
Members tap a link, vote **Yes / No**, optionally attach guests (**+n**), and the
roster fills live with **strict slot protection**. Built with **React + Vite +
Tailwind + Lucide**, backed by **Supabase (Postgres + Realtime)**.

---

## ✨ Features

- **No-login voting** — anonymous device fingerprint stored in `localStorage`.
- **Dynamic guest counter (+n)** — bring friends/family, each counts as a slot.
- **Strict slot protection** — the `+` button auto-disables when capacity is hit.
- **Deadline lock** — voting UI freezes after the deadline (live countdown).
- **Admin link** — owner gets a secret `?token=` link to close/re-open the vote.
- **Live results** — realtime roster via Supabase channels.
- **Premium minimalist design** — glassmorphism, Volt-green accents, SVG sport art.

---

## 🚀 Setup (3 steps)

### 1. Create the database
Open your Supabase project → **SQL Editor** → paste & run
[`supabase/schema.sql`](supabase/schema.sql). It creates `clubs`, `votes`,
`responses`, RLS policies, and enables Realtime.

### 2. Add credentials
```bash
cp .env.example .env
```
Fill in from **Supabase → Project Settings → API**:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```
> Alternatively edit the `SUPABASE_URL` / `SUPABASE_ANON_KEY` constants at the
> top of [`src/App.jsx`](src/App.jsx).

### 3. Run
```bash
npm install
npm run dev      # → http://localhost:5173
```

Build for production: `npm run build` (output in `dist/`).

---

## 🗺️ Routes

| Path | Page |
|------|------|
| `/` | Home — create a vote |
| `/vote/:id` | Public voting + live results |
| `/vote/:id?token=ADMIN_TOKEN` | Same page **+ admin controls** |

Client-side routing uses the History API. The included `vercel.json` and
`public/_redirects` provide SPA fallbacks for Vercel / Netlify so deep links work.

---

## 🔒 Security notes

This is a **no-login** reference build, so the anon key drives everything and the
owner gate is enforced client-side via the secret `admin_token`. For a hardened
production deploy:

1. Move owner actions (close/re-open) into a Supabase **Edge Function / RPC** that
   checks the `admin_token` server-side.
2. Drop the broad `votes` `SELECT` policy (so `admin_token` isn't readable) and
   expose only the public columns through a view or RPC.

The reference RLS policies in `schema.sql` keep things open + simple for instant deploy.
