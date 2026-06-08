/* ============================================================================
 *  POLLTAP — Poll + Tap
 *  The Future of Club Attendance Architecture.
 *
 *  Single-file React application (Tailwind CSS + Lucide icons + Supabase).
 *  3 experiences, one component tree, wired to a real Postgres backend:
 *    1. Home            "/"                          → create a vote
 *    2. Public Voting   "/vote/:id"                  → members vote (no login)
 *    3. Admin Mgmt      "/vote/:id?token=ADMIN_KEY"  → owner manages / closes
 *
 *  See /supabase/schema.sql for the database. See README.md to run.
 * ========================================================================== */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Activity, ArrowRight, ArrowLeft, Check, X, Plus, Minus, Users, Clock,
  Calendar, Shield, Zap, Lock, Link2, Copy, CheckCircle2, Circle,
  LayoutGrid, ChevronRight, Sparkles, Trophy, Settings2, Loader2,
  CalendarClock, UserPlus, Crown, AlertTriangle, ExternalLink, Hash,
} from 'lucide-react'

/* ----------------------------------------------------------------------------
 *  ① SUPABASE CONFIG  — replace these, or use a .env file (recommended)
 * ------------------------------------------------------------------------- */
const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL || 'https://YOUR-PROJECT-ref.supabase.co'
const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR-ANON-PUBLIC-KEY'

const isConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes('YOUR-ANON')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ----------------------------------------------------------------------------
 *  ② TINY HELPERS
 * ------------------------------------------------------------------------- */
const uuid = () =>
  (crypto?.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    }))

// Stable anonymous identity for this device (the "no-login" fingerprint).
function getDeviceUser() {
  let id = localStorage.getItem('polltap_anonymous_user_id')
  if (!id) {
    id = uuid()
    localStorage.setItem('polltap_anonymous_user_id', id)
  }
  const name = localStorage.getItem('polltap_user_name') || ''
  return { id, name }
}
function setDeviceName(name) {
  localStorage.setItem('polltap_user_name', name)
}

const cx = (...c) => c.filter(Boolean).join(' ')

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

// Returns { closed, label } for a deadline countdown.
function useCountdown(deadlineIso) {
  const [, force] = useState(0)
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])
  if (!deadlineIso) return { closed: false, label: '' }
  const ms = new Date(deadlineIso).getTime() - Date.now()
  if (ms <= 0) return { closed: true, label: 'Closed' }
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const label =
    d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
  return { closed: false, label }
}

/* ----------------------------------------------------------------------------
 *  ③ MINIMALIST SPORT ILLUSTRATIONS (pure SVG / CSS — no external imagery)
 * ------------------------------------------------------------------------- */
function CourtIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="court" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#ccff00" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="url(#court)" />
      <rect width="400" height="300" rx="24" fill="url(#glow)" />
      {/* perspective court */}
      <g stroke="#ccff00" strokeOpacity="0.55" strokeWidth="1.4">
        <path d="M120 250 L70 50 L330 50 L280 250 Z" />
        <line x1="95" y1="150" x2="305" y2="150" />
        <line x1="200" y1="50" x2="200" y2="250" />
        <path d="M150 50 L150 250" strokeOpacity="0.25" />
        <path d="M250 50 L250 250" strokeOpacity="0.25" />
      </g>
      {/* net */}
      <line x1="95" y1="150" x2="305" y2="150" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.2" strokeDasharray="4 4" />
      {/* shuttle trail */}
      <g className="animate-float-slow">
        <circle cx="210" cy="110" r="6" fill="#ccff00" />
        <path d="M210 110 q 18 -26 40 -34" stroke="#ccff00" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
        <path d="M250 76 l -6 -3 m 6 3 l 1 -7 m -1 7 l 6 1" stroke="#ccff00" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function RacketGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <ellipse cx="26" cy="22" rx="16" ry="19" stroke="currentColor" strokeWidth="2.4" />
      <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
        <line x1="14" y1="14" x2="38" y2="30" />
        <line x1="12" y1="22" x2="40" y2="22" />
        <line x1="14" y1="30" x2="38" y2="14" />
        <line x1="20" y1="8" x2="20" y2="36" />
        <line x1="32" y1="8" x2="32" y2="36" />
      </g>
      <path d="M37 35 L52 54" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

/* ----------------------------------------------------------------------------
 *  ④ UI PRIMITIVES
 * ------------------------------------------------------------------------- */
function Button({ as = 'button', variant = 'primary', size = 'md', className = '', children, ...p }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]'
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-[15px] px-5 py-3',
    lg: 'text-base px-7 py-4',
  }
  const variants = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10',
    volt:
      'bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-400/30',
    ghost:
      'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }
  const Comp = as
  return (
    <Comp className={cx(base, sizes[size], variants[variant], className)} {...p}>
      {children}
    </Comp>
  )
}

function Field({ label, icon: Icon, hint, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {label}
        {hint && <span className="text-slate-400 font-normal">· {hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5'

function Badge({ tone = 'slate', icon: Icon, children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    volt: 'bg-lime-400 text-slate-900',
    cyan: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    red: 'bg-red-50 text-red-600 ring-1 ring-red-200',
    dark: 'bg-slate-900 text-lime-300',
  }
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', tones[tone])}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const full = value >= max && max > 0
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-500">Slots filled</span>
        <span className="text-sm font-bold text-slate-900">
          {value}<span className="text-slate-400 font-medium"> / {max}</span>
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
            full ? 'bg-slate-900' : 'bg-lime-400'
          )}
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 -skew-x-12 bg-white/30 animate-shimmer" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{pct}% capacity</span>
        <span>{full ? 'Full' : `${Math.max(0, max - value)} open`}</span>
      </div>
    </div>
  )
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl border border-slate-100 bg-white/90 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
        checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      )}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <UserPlus className="w-4 h-4" />
        {label}
      </span>
      <span className={cx('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-lime-400' : 'bg-slate-200')}>
        <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
    </button>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-fade-in">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
        <CheckCircle2 className="w-4 h-4 text-lime-400" />
        {toast}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 *  ⑤ NAV / SHELL
 * ------------------------------------------------------------------------- */
function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5">
      <span className="relative transition group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden>
          <rect width="32" height="32" rx="8" fill="#0f172a" />
          <path d="M9 22V10h6.2a4 4 0 0 1 0 8H12" fill="none" stroke="#ccff00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22.5" cy="11" r="2" fill="#ccff00" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        POLL<span className="text-lime-500">TAP</span>
      </span>
    </button>
  )
}

function Nav({ go }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo onClick={() => go('/')} />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="volt" onClick={() => go('/')}>
            Create a Vote <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

function ConfigWarning() {
  return (
    <div className="mx-auto mt-4 max-w-6xl px-5">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Supabase not configured.</strong> Set <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> in a <code className="rounded bg-amber-100 px-1">.env</code> file
          (or edit the constants at the top of <code className="rounded bg-amber-100 px-1">App.jsx</code>) and run the SQL in{' '}
          <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>.
        </p>
      </div>
    </div>
  )
}

/* ============================================================================
 *  ⑥ PAGE 1 — HOME / CREATE
 * ========================================================================== */
function FeatureCard({ icon: Icon, title, desc, glyph }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 transition hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/[0.04]">
      <div className="pointer-events-none absolute -right-6 -top-6 text-slate-100 transition group-hover:text-lime-200">
        {glyph}
      </div>
      <div className="relative">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-lime-400">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  )
}

function HomePage({ go, toast }) {
  const [form, setForm] = useState({
    club: '',
    title: '',
    matchDate: '',
    maxSlots: 8,
    deadline: '',
  })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null) // { id, token }
  const [error, setError] = useState('')

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target?.value ?? e }))

  const valid =
    form.title.trim().length > 1 &&
    Number(form.maxSlots) > 0 &&
    form.deadline

  async function handleCreate(e) {
    e.preventDefault()
    if (!valid || creating) return
    if (!isConfigured) {
      setError('Connect Supabase first (see the banner above).')
      return
    }
    setCreating(true)
    setError('')
    try {
      let clubId = null
      if (form.club.trim()) {
        const { data: club, error: ce } = await supabase
          .from('clubs')
          .insert({ name: form.club.trim() })
          .select('id')
          .single()
        if (ce) throw ce
        clubId = club.id
      }
      const { data, error: ve } = await supabase
        .from('votes')
        .insert({
          club_id: clubId,
          title: form.title.trim(),
          match_date: form.matchDate ? new Date(form.matchDate).toISOString() : null,
          max_slots: Number(form.maxSlots),
          deadline: new Date(form.deadline).toISOString(),
        })
        .select('id, admin_token')
        .single()
      if (ve) throw ve

      // Persist admin token so the creator keeps owner access on this device.
      const store = JSON.parse(localStorage.getItem('polltap_admin_tokens') || '{}')
      store[data.id] = data.admin_token
      localStorage.setItem('polltap_admin_tokens', JSON.stringify(store))

      setCreated({ id: data.id, token: data.admin_token })
    } catch (err) {
      setError(err.message || 'Something went wrong creating the vote.')
    } finally {
      setCreating(false)
    }
  }

  if (created) return <CreatedSuccess created={created} go={go} toast={toast} />

  return (
    <main className="bg-grid flex-1">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 lg:grid-cols-2 lg:pt-24">
          {/* Left copy */}
          <div className="animate-fade-in">
            <Badge tone="dark" icon={Trophy}>Built for sports clubs</Badge>
            <h1 className="mt-6 text-5xl font-black leading-[1.04] tracking-tight text-slate-900 sm:text-6xl">
              Know{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">who's playing</span>
                <span className="absolute -bottom-1 left-0 z-0 h-4 w-full -rotate-1 bg-lime-300/70" />
              </span>
              , before the match.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">
              Sort out attendance in seconds — no accounts, no friction,
              just a link to tap. Strict slot protection keeps your roster honest.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" variant="volt" as="a" href="#create">
                Create attendance vote <ArrowRight className="h-5 w-5" />
              </Button>
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-lime-500" />
                Free · No sign-up
              </span>
            </div>
          </div>

          {/* Right illustration */}
          <div className="relative animate-fade-in [animation-delay:120ms]">
            <div className="absolute inset-0 -rotate-3 rounded-[2rem] border border-slate-100 bg-white/60 backdrop-blur" />
            <div className="relative rounded-[2rem] border border-slate-100 bg-white/80 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <CourtIllustration className="w-full rounded-2xl" />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: 'Slots', v: '6/8', t: 'volt' },
                  { k: 'Voted', v: '12', t: 'cyan' },
                  { k: 'Closes', v: '3h', t: 'slate' },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl border border-slate-100 bg-white p-3 text-center">
                    <p className="text-xs font-medium text-slate-400">{s.k}</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rotate-6 text-slate-900">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
                <RacketGlyph className="h-10 w-10 text-lime-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="No-Login Voting"
            desc="Members tap a link and vote instantly. A private device fingerprint remembers them — zero passwords, zero friction."
            glyph={<RacketGlyph className="h-28 w-28" />}
          />
          <FeatureCard
            icon={UserPlus}
            title="Dynamic Guest Addition (+n)"
            desc="Bringing friends or family? Attach guests with a refined +n counter. Every extra body is counted toward the roster."
            glyph={<Users className="h-24 w-24" strokeWidth={1} />}
          />
          <FeatureCard
            icon={Shield}
            title="Strict Slot Protection"
            desc="Capacity is sacred. The system blocks the moment the court is full — no overbooking, no awkward bumping."
            glyph={<Lock className="h-24 w-24" strokeWidth={1} />}
          />
        </div>
      </section>

      {/* CREATE FORM */}
      <section id="create" className="mx-auto max-w-3xl px-5 py-16 pb-[136px]">
        <div className="mb-8 text-center">
          <Badge tone="volt" icon={Sparkles}>Step 1</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
            Design your attendance vote
          </h2>
          <p className="mt-2 text-slate-500">
            Set the rules once. We generate the public + admin links automatically.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="space-y-5 rounded-3xl border border-slate-100 bg-white/80 p-7 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Club name" icon={Trophy} hint="optional">
              <input className={inputCls} placeholder="Smash Republic" value={form.club} onChange={set('club')} />
            </Field>
            <Field label="Vote title" icon={Hash}>
              <input className={inputCls} placeholder="Tuesday Night Smash 🏸" value={form.title} onChange={set('title')} required />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Match date" icon={Calendar} hint="optional">
              <input type="datetime-local" className={inputCls} value={form.matchDate} onChange={set('matchDate')} />
            </Field>
            <Field label="Max slots" icon={Users}>
              <input type="number" min="1" className={inputCls} value={form.maxSlots} onChange={set('maxSlots')} required />
            </Field>
            <Field label="Deadline" icon={CalendarClock}>
              <input type="datetime-local" className={inputCls} value={form.deadline} onChange={set('deadline')} required />
            </Field>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          <Button type="submit" size="lg" variant="primary" className="w-full" disabled={!valid || creating}>
            {creating ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating…</> : <>Generate vote links <Sparkles className="h-5 w-5 text-lime-400" /></>}
          </Button>
          <p className="text-center text-xs text-slate-400">
            You'll get a public voting link + a private admin link saved to this device.
          </p>
        </form>
      </section>

      <Footer />
    </main>
  )
}

function CreatedSuccess({ created, go, toast }) {
  const origin = window.location.origin
  const publicUrl = `${origin}/vote/${created.id}`
  const adminUrl = `${origin}/vote/${created.id}?token=${created.token}`

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(`${label} copied`)
    } catch {
      toast('Copy failed — select manually')
    }
  }

  return (
    <main className="bg-grid flex-1">
      <div className="mx-auto max-w-2xl px-5 py-20">
        <div className="animate-scale-in rounded-3xl border border-slate-100 bg-white/85 p-8 text-center shadow-2xl shadow-slate-900/[0.06] backdrop-blur-xl">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-lime-400">
            <Check className="h-8 w-8 text-slate-900" strokeWidth={3} />
          </span>
          <h2 className="mt-6 text-2xl font-black text-slate-900">Vote is live 🎉</h2>
          <p className="mt-2 text-slate-500">Share the public link with your members. Keep the admin link private.</p>

          <div className="mt-8 space-y-4 text-left">
            <LinkRow tone="volt" icon={Link2} label="Public voting link" hint="Share with everyone" url={publicUrl} onCopy={() => copy(publicUrl, 'Public link')} />
            <LinkRow tone="dark" icon={Crown} label="Admin management link" hint="Keep private — full control" url={adminUrl} onCopy={() => copy(adminUrl, 'Admin link')} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="volt" size="lg" className="flex-1" onClick={() => go(`/vote/${created.id}?token=${created.token}`)}>
              Open admin dashboard <Settings2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => go(`/vote/${created.id}`)}>
              Preview public page <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">
          The admin link is saved in this browser, so you'll stay owner even if you lose it.
        </p>
      </div>
    </main>
  )
}

function LinkRow({ tone, icon: Icon, label, hint, url, onCopy }) {
  const dark = tone === 'dark'
  return (
    <div className={cx('rounded-2xl border p-4', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50')}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cx('h-4 w-4', dark ? 'text-lime-400' : 'text-slate-500')} />
        <span className={cx('text-sm font-semibold', dark ? 'text-white' : 'text-slate-700')}>{label}</span>
        <span className={cx('text-xs', dark ? 'text-slate-400' : 'text-slate-400')}>· {hint}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className={cx('flex-1 truncate rounded-xl px-3 py-2 text-xs', dark ? 'bg-slate-800 text-lime-300' : 'bg-white text-slate-600 border border-slate-100')}>
          {url}
        </code>
        <Button size="sm" variant={dark ? 'volt' : 'ghost'} onClick={onCopy}>
          <Copy className="h-4 w-4" /> Copy
        </Button>
      </div>
    </div>
  )
}

/* ============================================================================
 *  ⑦ PAGES 2 & 3 — PUBLIC VOTING + LIVE RESULTS (+ admin controls)
 * ========================================================================== */
function VotePage({ voteId, adminToken, go, toast }) {
  const [vote, setVote] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const me = useRef(getDeviceUser())

  // ── load + realtime ──────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const { data: v, error } = await supabase
      .from('votes').select('*').eq('id', voteId).single()
    if (error || !v) { setNotFound(true); setLoading(false); return }
    setVote(v)
    const { data: r } = await supabase
      .from('responses').select('*').eq('vote_id', voteId)
      .order('created_at', { ascending: true })
    setResponses(r || [])
    setLoading(false)
  }, [voteId])

  useEffect(() => {
    if (!isConfigured) { setLoading(false); setNotFound(true); return }
    loadAll()
    const ch = supabase
      .channel(`vote-${voteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responses', filter: `vote_id=eq.${voteId}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `id=eq.${voteId}` }, loadAll)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [voteId, loadAll])

  // ── derived state ────────────────────────────────────────────────
  const isAdmin = !!vote && !!adminToken && adminToken === vote.admin_token
  const countdown = useCountdown(vote?.deadline)
  const closed = !!vote && (vote.is_closed || countdown.closed)

  const attendees = useMemo(
    () => responses.filter((r) => r.attending),
    [responses]
  )
  const filledSlots = useMemo(
    () => attendees.reduce((sum, r) => sum + 1 + (r.guests || 0), 0),
    [attendees]
  )
  const myResponse = responses.find((r) => r.anonymous_user_id === me.current.id)

  // ── render gates ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading vote…
        </div>
      </div>
    )
  }
  if (notFound || !vote) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-5 text-center">
        <div className="animate-fade-in">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
            <X className="h-8 w-8 text-slate-400" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">Vote not found</h2>
          <p className="mt-2 text-slate-500">
            {isConfigured ? 'This link may be invalid or the vote was removed.' : 'Supabase is not configured yet.'}
          </p>
          <Button className="mt-6" variant="volt" onClick={() => go('/')}>
            <ArrowLeft className="h-4 w-4" /> Back home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-grid flex-1">
      <div className="mx-auto max-w-5xl px-5 py-10 pb-[134px]">
        {/* header */}
        <button onClick={() => go('/')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> POLLTAP
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && <Badge tone="dark" icon={Crown}>Admin</Badge>}
              {closed
                ? <Badge tone="red" icon={Lock}>Vote Closed</Badge>
                : <Badge tone="cyan" icon={Clock}>Closes in {countdown.label}</Badge>}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{vote.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
              {vote.match_date && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {fmtDate(vote.match_date)}</span>}
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> Deadline {fmtDate(vote.deadline)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* LEFT — voting / admin */}
          <div className="space-y-6 lg:col-span-2">
            {isAdmin && <AdminPanel vote={vote} closed={closed} filledSlots={filledSlots} toast={toast} onChanged={loadAll} />}
            <VotePanel
              vote={vote} closed={closed} filledSlots={filledSlots}
              myResponse={myResponse} me={me} toast={toast} onChanged={loadAll}
            />
          </div>

          {/* RIGHT — live results */}
          <div className="lg:col-span-3">
            <ResultsPanel
              vote={vote} attendees={attendees} responses={responses}
              filledSlots={filledSlots} meId={me.current.id}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

/* ── Public voting panel ──────────────────────────────────────────── */
function VotePanel({ vote, closed, filledSlots, myResponse, me, toast, onChanged }) {
  const [nameModal, setNameModal] = useState(false)
  const [nameDraft, setNameDraft] = useState(me.current.name)
  const [attending, setAttending] = useState(myResponse ? myResponse.attending : null)
  const [withGuests, setWithGuests] = useState((myResponse?.guests || 0) > 0)
  const [guests, setGuests] = useState(myResponse?.guests || 0)
  const [saving, setSaving] = useState(false)

  // keep local state in sync when realtime refreshes my row
  useEffect(() => {
    if (myResponse) {
      setAttending(myResponse.attending)
      setGuests(myResponse.guests || 0)
      setWithGuests((myResponse.guests || 0) > 0)
    }
  }, [myResponse?.id, myResponse?.attending, myResponse?.guests])

  // slots consumed by everyone *except* me (so I can recompute my own cap)
  const otherSlots = filledSlots - (myResponse?.attending ? 1 + (myResponse.guests || 0) : 0)
  const remainingForMe = vote.max_slots - otherSlots // includes my own head
  const maxGuestsForMe = Math.max(0, remainingForMe - 1)
  const canAddGuest = guests < maxGuestsForMe

  const ensureName = (cb) => {
    if (me.current.name) return cb()
    setNameDraft('')
    setNameModal(() => () => cb)
  }

  async function persist(nextAttending, nextGuests) {
    if (!me.current.name) return
    setSaving(true)
    try {
      const payload = {
        vote_id: vote.id,
        anonymous_user_id: me.current.id,
        name: me.current.name,
        attending: nextAttending,
        guests: nextAttending ? nextGuests : 0,
      }
      const { error } = await supabase
        .from('responses')
        .upsert(payload, { onConflict: 'vote_id,anonymous_user_id' })
      if (error) throw error
      toast(nextAttending ? 'You\'re in ✅' : 'Marked as not attending')
      onChanged()
    } catch (e) {
      toast(e.message || 'Could not save vote')
    } finally {
      setSaving(false)
    }
  }

  function choose(yes) {
    if (closed) return
    const apply = () => {
      setAttending(yes)
      if (!yes) { setWithGuests(false); setGuests(0); persist(false, 0) }
      else { persist(true, withGuests ? guests : 0) }
    }
    ensureName(apply)
  }

  function confirmName() {
    const n = nameDraft.trim()
    if (n.length < 2) return
    setDeviceName(n)
    me.current.name = n
    const pending = typeof nameModal === 'function' ? nameModal() : null
    setNameModal(false)
    if (typeof pending === 'function') pending()
  }

  const yesFull = otherSlots >= vote.max_slots && !myResponse?.attending

  if (closed) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/80 p-7 text-center backdrop-blur-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50">
          <Lock className="h-6 w-6 text-red-500" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Voting is closed</h3>
        <p className="mt-1 text-sm text-slate-500">
          {myResponse
            ? `Your final answer: ${myResponse.attending ? `Attending${myResponse.guests ? ` (+${myResponse.guests})` : ''}` : 'Not attending'}.`
            : 'The deadline has passed. Check the results on the right.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/80 p-7 backdrop-blur-xl">
      <h3 className="text-lg font-bold text-slate-900">Will you play?</h3>
      <p className="mt-1 text-sm text-slate-500">
        {me.current.name ? <>Voting as <strong className="text-slate-700">{me.current.name}</strong></> : 'No login needed — just your name.'}
      </p>

      {/* Yes / No */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => choose(true)}
          disabled={saving || yesFull}
          className={cx(
            'group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition disabled:opacity-50',
            attending === true ? 'border-lime-400 bg-lime-50' : 'border-slate-200 bg-white hover:border-slate-300'
          )}
        >
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl', attending === true ? 'bg-lime-400 text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200')}>
            <Check className="h-5 w-5" strokeWidth={3} />
          </span>
          <p className="mt-3 font-bold text-slate-900">Yes</p>
          <p className="text-xs text-slate-500">{yesFull ? 'Court is full' : 'Count me in'}</p>
        </button>

        <button
          onClick={() => choose(false)}
          disabled={saving}
          className={cx(
            'group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition disabled:opacity-50',
            attending === false ? 'border-slate-900 bg-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'
          )}
        >
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl', attending === false ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200')}>
            <X className="h-5 w-5" strokeWidth={3} />
          </span>
          <p className={cx('mt-3 font-bold', attending === false ? 'text-white' : 'text-slate-900')}>No</p>
          <p className={cx('text-xs', attending === false ? 'text-slate-300' : 'text-slate-500')}>Can't make it</p>
        </button>
      </div>

      {/* Guests (only when Yes) */}
      {attending === true && (
        <div className="mt-5 animate-fade-in space-y-4">
          <Toggle
            checked={withGuests}
            label="Bring a guest"
            onChange={(v) => {
              setWithGuests(v)
              if (!v) { setGuests(0); persist(true, 0) }
            }}
          />

          {withGuests && (
            <div className="animate-fade-in rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Guests</p>
                  <p className="text-xs text-slate-400">{maxGuestsForMe - guests} more allowed</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { const g = Math.max(0, guests - 1); setGuests(g); persist(true, g) }}
                    disabled={guests <= 0 || saving}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-2xl font-black tabular-nums text-slate-900">+{guests}</span>
                  <button
                    onClick={() => { const g = guests + 1; setGuests(g); persist(true, g) }}
                    disabled={!canAddGuest || saving}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!canAddGuest && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Shield className="h-3.5 w-3.5" /> Slot limit reached — guest cap protected.
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">
            You're taking <span className="text-lime-400">{1 + guests}</span> slot{1 + guests > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {saving && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
        </p>
      )}

      {/* Name modal */}
      <Modal open={!!nameModal} onClose={() => setNameModal(false)}>
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-lime-400">
            <Sparkles className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-slate-900">What's your name?</h3>
          <p className="mt-1 text-sm text-slate-500">No account needed — we'll remember you on this device.</p>
        </div>
        <input
          autoFocus
          className={cx(inputCls, 'mt-5 text-center text-lg')}
          placeholder="e.g. Nguyễn Văn A"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && confirmName()}
        />
        <Button variant="volt" size="lg" className="mt-4 w-full" onClick={confirmName} disabled={nameDraft.trim().length < 2}>
          Continue <ArrowRight className="h-5 w-5" />
        </Button>
      </Modal>
    </div>
  )
}

/* ── Admin panel ──────────────────────────────────────────────────── */
function AdminPanel({ vote, closed, filledSlots, toast, onChanged }) {
  const [busy, setBusy] = useState(false)

  async function toggleClosed() {
    setBusy(true)
    try {
      const { error } = await supabase
        .from('votes').update({ is_closed: !vote.is_closed }).eq('id', vote.id)
      if (error) throw error
      toast(vote.is_closed ? 'Vote re-opened' : 'Vote closed')
      onChanged()
    } catch (e) { toast(e.message || 'Action failed') }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-lime-400" />
        <h3 className="font-bold">Admin controls</h3>
      </div>
      <p className="mt-1 text-sm text-slate-400">Owner-only. This panel is hidden without the admin token.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Filled</p>
          <p className="text-2xl font-black text-lime-400">{filledSlots}<span className="text-base text-slate-500">/{vote.max_slots}</span></p>
        </div>
        <div className="rounded-2xl bg-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-lg font-bold">{closed ? 'Closed' : 'Open'}</p>
        </div>
      </div>

      <Button
        variant={vote.is_closed ? 'volt' : 'danger'}
        className={cx('mt-4 w-full', !vote.is_closed && 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700')}
        onClick={toggleClosed}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : vote.is_closed ? <><Check className="h-4 w-4" /> Re-open voting</> : <><Lock className="h-4 w-4" /> Close vote now</>}
      </Button>
      {!vote.is_closed && closed && (
        <p className="mt-2 text-center text-xs text-slate-500">Already closed automatically by deadline.</p>
      )}
    </div>
  )
}

/* ── Live results ─────────────────────────────────────────────────── */
function ResultsPanel({ vote, attendees, responses, filledSlots, meId }) {
  const declined = responses.filter((r) => !r.attending)
  return (
    <div className="rounded-3xl border border-slate-100 bg-white/80 p-7 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">Attendees</h3>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
          </span>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={filledSlots} max={vote.max_slots} />
      </div>

      {/* attendees */}
      <ul className="mt-6 space-y-2">
        {attendees.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No one's in yet — be the first to tap Yes.
          </li>
        )}
        {attendees.map((r, i) => {
          const total = 1 + (r.guests || 0)
          const mine = r.anonymous_user_id === meId
          return (
            <li
              key={r.id}
              className={cx(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 transition',
                mine ? 'border-lime-300 bg-lime-50' : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-lime-400">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {r.name}
                  {mine && <span className="ml-2 text-xs font-medium text-lime-600">(you)</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {r.guests > 0
                    ? `+${r.guests} guest${r.guests > 1 ? 's' : ''} · ${total} slots total`
                    : '1 slot'}
                </p>
              </div>
              {r.guests > 0 && <Badge tone="volt" icon={Users}>{total}</Badge>}
            </li>
          )
        })}
      </ul>

      {/* declined */}
      {declined.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Not attending · {declined.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {declined.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400 line-through">
                <Circle className="h-2 w-2 fill-slate-300 text-slate-300" /> {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* totals strip */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center">
        <Stat label="Players" value={attendees.length} />
        <Stat label="Guests" value={attendees.reduce((s, r) => s + (r.guests || 0), 0)} />
        <Stat label="Total slots" value={filledSlots} accent />
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className={cx('text-2xl font-black tabular-nums', accent ? 'text-lime-500' : 'text-slate-900')}>{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 *  ⑧ FOOTER
 * ------------------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white/50 sm:fixed sm:bottom-0 w-full backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row">
        <Logo onClick={() => (window.location.href = '/')} />
        <p className="text-sm text-slate-400 hidden sm:block">Poll + Tap · Club attendance, reimagined.</p>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-xs">© {new Date().getFullYear()} POLLTAP</span>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================================
 *  ⑨ ROOT — tiny client router (path + query, no extra deps)
 * ========================================================================== */
export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [search, setSearch] = useState(window.location.search)
  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef(null)

  const go = useCallback((to) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', url)
    setPath(url.pathname)
    setSearch(url.search)
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    const onPop = () => { setPath(window.location.pathname); setSearch(window.location.search) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const toast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  // route parsing: "/vote/:id"
  const voteMatch = path.match(/^\/vote\/([^/]+)\/?$/)
  const adminToken = new URLSearchParams(search).get('token')

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900 antialiased">
      <Nav go={go} />
      {!isConfigured && <ConfigWarning />}
      {voteMatch
        ? <VotePage key={voteMatch[1]} voteId={voteMatch[1]} adminToken={adminToken} go={go} toast={toast} />
        : <HomePage go={go} toast={toast} />}
      <Toast toast={toastMsg} />
    </div>
  )
}
