import type { Evento } from '../../types'

type MovieCardProps = { evento: Evento; onSelect: (id: string) => void }

export function MovieCard({ evento, onSelect }: MovieCardProps) {
  return (
    <button className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-left shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-orange-400/70 hover:shadow-orange-950/20" onClick={() => onSelect(evento.id)}>
      {evento.posterUrl ? (
        <img className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={evento.posterUrl} alt={`Pôster de ${evento.titulo}`} />
      ) : (
        <div className="flex aspect-[2/3] items-end bg-gradient-to-br from-orange-500/70 via-red-500/40 to-zinc-900 p-5 text-2xl font-semibold text-white">{evento.titulo}</div>
      )}
      <div className="p-4"><strong className="block text-base text-white">{evento.titulo}</strong><span className="mt-1 block text-sm text-zinc-400">Ver detalhes e horários</span></div>
    </button>
  )
}
