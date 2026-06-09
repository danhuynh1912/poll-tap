import { AlertTriangle } from 'lucide-react'

export function ConfigWarning() {
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
