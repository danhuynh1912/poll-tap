import { Check, Link2, Crown, Settings2, ExternalLink } from 'lucide-react'
import { Button } from '../../components/ui'
import { LinkRow } from './LinkRow'

export function CreatedSuccess({ created, go, toast }) {
  const origin = window.location.origin
  const publicUrl = `${origin}/vote/${created.id}`
  const adminUrl  = `${origin}/vote/${created.id}?token=${created.token}`

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
            <LinkRow tone="volt" icon={Link2} label="Public voting link" hint="Share with everyone"
              url={publicUrl} onCopy={() => copy(publicUrl, 'Public link')} />
            <LinkRow tone="dark" icon={Crown} label="Admin management link" hint="Keep private — full control"
              url={adminUrl} onCopy={() => copy(adminUrl, 'Admin link')} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="volt" size="lg" className="flex-1"
              onClick={() => go(`/vote/${created.id}?token=${created.token}`)}>
              Open admin dashboard <Settings2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="flex-1"
              onClick={() => go(`/vote/${created.id}`)}>
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
