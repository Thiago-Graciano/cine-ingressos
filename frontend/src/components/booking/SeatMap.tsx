import type { Assento, Sessao } from '../../types'

type SeatMapProps = { sessao: Sessao; selecionado: Assento | null; onSelect: (assento: Assento) => void }

export function SeatMap({ sessao, selecionado, onSelect }: SeatMapProps) {
  return (
    <section className="mt-8 border-t border-zinc-800 pt-8" aria-label="Mapa de assentos">
      <div className="mx-auto mb-8 w-3/4 border-t-4 border-orange-400 pt-2 text-center text-xs font-medium tracking-[0.2em] text-zinc-500">TELA</div>
      <div className="mx-auto grid max-w-xl grid-cols-10 gap-2">
        {(sessao.assentos ?? []).map((assento) => {
          const selecionadoClass = selecionado?.id === assento.id ? 'bg-orange-400 text-zinc-950 ring-2 ring-orange-200' : ''
          const statusClass = assento.status === 'DISPONIVEL' ? 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600' : 'cursor-not-allowed bg-zinc-700 text-zinc-500'

          return <button key={assento.id} type="button" disabled={assento.status !== 'DISPONIVEL'} className={`rounded-md px-1 py-2 text-xs font-semibold transition sm:py-2.5 ${statusClass} ${selecionadoClass}`} onClick={() => onSelect(assento)}>{assento.codigo}</button>
        })}
      </div>
      <div className="mt-6 flex justify-center gap-6 text-xs text-zinc-400"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-700" />disponível</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-zinc-700" />ocupado</span></div>
    </section>
  )
}
