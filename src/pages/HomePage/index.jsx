import { useState, useEffect } from 'react'
import {
  ArrowRight, Check, Users, Zap, Shield, Lock, UserPlus,
  Calendar, CalendarClock, Hash, Trophy, Sparkles, Loader2, AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { saveAdminToken } from '../../lib/localStorage'
import { Badge, Button, Field, inputCls } from '../../components/ui'
import { Footer } from '../../components/layout'
import { HeroIllustration } from '../../components/illustrations/HeroIllustration'
import { RacketGlyph } from '../../components/illustrations/RacketGlyph'
import { FeatureCard } from './FeatureCard'
import { CreatedSuccess } from './CreatedSuccess'

export function HomePage({ go, toast }) {
  const [form, setForm] = useState({
    clubToken: '', title: '', matchDate: '', maxSlots: 8, deadline: '',
  })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')
  const [prefilled, setPrefilled] = useState(false)

  // Auto-fill form from SPOFUND deep-link params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const token    = p.get('token')
    const date     = p.get('date')
    const deadline = p.get('deadline')
    const slots    = p.get('slots')
    const title    = p.get('title')
    if (!token) return

    // Verify token and get club name, then fill form
    supabase
      .from('clubs')
      .select('name')
      .eq('polltap_link_token', token)
      .maybeSingle()
      .then(({ data: club }) => {
        if (!club) return
        setForm((f) => ({
          ...f,
          clubToken: token,
          title:     title     ? decodeURIComponent(title) : `${club.name} · Vote`,
          matchDate: date      || f.matchDate,
          deadline:  deadline  || f.deadline,
          maxSlots:  slots     ? Number(slots) : f.maxSlots,
        }))
        setPrefilled(true)
        // Scroll to form
        setTimeout(() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' }), 100)
      })
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target?.value ?? e }))

  const valid = form.title.trim().length > 1 && Number(form.maxSlots) > 0 && form.deadline

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
      const token = form.clubToken.trim()
      if (token) {
        const { data: club } = await supabase
          .from('clubs').select('id').eq('polltap_link_token', token).maybeSingle()
        if (!club) {
          setError('Club token not found. Check the token in your SPOFUND settings.')
          setCreating(false)
          return
        }
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

      saveAdminToken(data.id, data.admin_token)
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
          <div className="animate-fade-in [animation-delay:120ms]">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={Zap} title="No-Login Voting"
            desc="Members tap a link and vote instantly. A private device fingerprint remembers them — zero passwords, zero friction."
            glyph={<RacketGlyph className="h-28 w-28" />}
          />
          <FeatureCard icon={UserPlus} title="Dynamic Guest Addition (+n)"
            desc="Bringing friends or family? Attach guests with a refined +n counter. Every extra body is counted toward the roster."
            glyph={<Users className="h-24 w-24" strokeWidth={1} />}
          />
          <FeatureCard icon={Shield} title="Strict Slot Protection"
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

        <form onSubmit={handleCreate}
          className="space-y-5 rounded-3xl border border-slate-100 bg-white/80 p-7 shadow-xl shadow-slate-900/[0.04] backdrop-blur-xl">

          {prefilled && (
            <div className="flex items-center gap-2 rounded-2xl bg-lime-50 border border-lime-200 px-4 py-3 text-sm font-medium text-lime-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Pre-filled from SPOFUND — review the details then generate your vote link.
            </div>
          )}

          <Field label="Vote title" icon={Hash}>
            <input className={inputCls} placeholder="Tuesday Night Smash 🏸" value={form.title} onChange={set('title')} required />
          </Field>
          <Field label="SPOFUND Club Token" icon={Trophy} hint="optional — links this vote to your club">
            <input className={inputCls} placeholder="Paste token from SPOFUND Settings" value={form.clubToken} onChange={set('clubToken')} />
          </Field>

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
            {creating
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating…</>
              : <>Generate vote links <Sparkles className="h-5 w-5 text-lime-400" /></>}
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
