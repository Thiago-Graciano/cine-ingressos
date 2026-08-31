import type { Ingresso } from '../types'
import { TicketCard } from '../components/tickets/TicketCard'

export function TicketsPage({ ingressos }: { ingressos: Ingresso[] }) {
  return <section><p className="text-xs font-semibold tracking-[0.24em] text-orange-400">SUA ESTANTE</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Meus ingressos.</h1><div className="mt-8 grid gap-4">{ingressos.map((ingresso) => <TicketCard key={ingresso.id} ingresso={ingresso} />)}{!ingressos.length && <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">Você ainda não possui ingressos.</div>}</div></section>
}
