import { User } from 'lucide-react'
import { SlotTip } from './SlotTip'

export function SlotGrid({ filledSlots, maxSlots, attendees }) {
  const slots = []
  attendees.forEach((r) => {
    const count = 1 + (r.guests || 0)
    for (let i = 0; i < count; i++) {
      slots.push({
        filled: true,
        isMain: i === 0,
        initial: r.name.trim().charAt(0).toUpperCase(),
        tooltip: i === 0 ? r.name : `${r.name}'s guest`,
      })
    }
  })
  for (let i = filledSlots; i < maxSlots; i++) slots.push({ filled: false, idx: i - filledSlots })

  const cols = maxSlots <= 6 ? maxSlots : maxSlots <= 10 ? 5 : maxSlots <= 16 ? 8 : 10

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {slots.map((slot, i) =>
        slot.filled ? (
          <SlotTip key={i} text={slot.tooltip}>
            <div className="aspect-square rounded-xl bg-slate-900 flex items-center justify-center cursor-default">
              {slot.isMain
                ? <span className="text-sm font-black text-lime-400">{slot.initial}</span>
                : <User className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />}
            </div>
          </SlotTip>
        ) : (
          <div key={i} className="aspect-square rounded-xl border-2 border-lime-400/40 bg-lime-400/5 relative overflow-hidden">
            <span
              className="absolute inset-0 rounded-xl animate-ping bg-lime-400/15"
              style={{ animationDelay: `${slot.idx * 180}ms`, animationDuration: '2.4s' }}
            />
          </div>
        )
      )}
    </div>
  )
}
