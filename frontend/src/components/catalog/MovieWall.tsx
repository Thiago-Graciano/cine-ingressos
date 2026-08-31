import type { Evento } from '../../types'
import { MovieCard } from './MovieCard'

type MovieWallProps = { eventos: Evento[]; onSelect: (id: string) => void }

export function MovieWall({ eventos, onSelect }: MovieWallProps) {
  if (!eventos.length) {
    return <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">Nenhum filme publicado ainda.</div>
  }

  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{eventos.map((evento) => <MovieCard key={evento.id} evento={evento} onSelect={onSelect} />)}</div>
}
