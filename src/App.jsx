import { useRouter } from './hooks/useRouter'
import { isConfigured } from './lib/supabase'
import { Nav, ConfigWarning } from './components/layout'
import { Toast } from './components/ui'
import { HomePage } from './pages/HomePage'
import { VotePage } from './pages/VotePage'

export default function App() {
  const { go, toast, toastMsg, voteMatch, adminToken } = useRouter()

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
