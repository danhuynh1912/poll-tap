import { ArrowRight } from 'lucide-react'
import { Button } from '../ui'
import { Logo } from './Logo'

export function Nav({ go }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo onClick={() => go('/')} />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="volt" onClick={() => {
            go('/')
            setTimeout(() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500)
          }}>
            Create a Vote <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
