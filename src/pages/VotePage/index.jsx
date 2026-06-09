import { useRef, useMemo, useEffect, useState } from 'react'
import { ArrowLeft, X, Calendar, CalendarClock, Clock, Lock, Crown, Loader2, CheckCircle2 } from 'lucide-react'
import { useVote } from '../../hooks/useVote'
import { useCountdown } from '../../hooks/useCountdown'
import { getDeviceUser } from '../../lib/localStorage'
import { fmtDate } from '../../lib/utils'
import { isConfigured, supabase } from '../../lib/supabase'
import { Badge, Button } from '../../components/ui'
import { Footer } from '../../components/layout'
import { VotePanel } from './VotePanel'
import { AdminPanel } from './AdminPanel'
import { ResultsPanel } from './ResultsPanel'

export function VotePage({ voteId, adminToken, go, toast }) {
  const { vote, responses, loading, notFound, reload } = useVote(voteId)
  const me = useRef(getDeviceUser())
  const [settledLog, setSettledLog] = useState(null)

  const isAdmin = !!vote && !!adminToken && adminToken === vote.admin_token
  const countdown = useCountdown(vote?.deadline)
  const closed = !!vote && (vote.is_closed || countdown.closed)

  useEffect(() => {
    if (!vote) return
    supabase
      .from('session_logs')
      .select('id, played_on, guest_revenue')
      .eq('vote_id', voteId)
      .maybeSingle()
      .then(({ data }) => setSettledLog(data || null))
  }, [vote, voteId])

  const attendees = useMemo(() => responses.filter((r) => r.attending), [responses])
  const filledSlots = useMemo(
    () => attendees.reduce((sum, r) => sum + 1 + (r.guests || 0), 0),
    [attendees]
  )
  const myResponse = responses.find((r) => r.anonymous_user_id === me.current.id)

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
              {settledLog && (
                <Badge tone="volt" icon={CheckCircle2}>
                  Settled · {fmtDate(settledLog.played_on)}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{vote.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
              {vote.match_date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {fmtDate(vote.match_date)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> Deadline {fmtDate(vote.deadline)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            {isAdmin && (
              <AdminPanel vote={vote} closed={closed} filledSlots={filledSlots} toast={toast} onChanged={reload} />
            )}
            <VotePanel
              vote={vote} closed={closed} filledSlots={filledSlots}
              myResponse={myResponse} me={me} toast={toast} onChanged={reload}
            />
          </div>
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
