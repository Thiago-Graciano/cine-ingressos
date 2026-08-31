import type { Evento } from '../types'
import { MovieWall } from '../components/catalog/MovieWall'

type CustomerHomePageProps = { eventos: Evento[]; onSelectEvento: (id: string) => void }

export function CustomerHomePage({ eventos, onSelectEvento }: CustomerHomePageProps) {
  return <section><div className="mb-10 max-w-2xl"><p className="text-xs font-semibold tracking-[0.24em] text-orange-400">PROGRAMAÇÃO DA SEMANA</p><h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-7xl">Escolha sua<br /><span className="font-serif italic text-orange-400">próxima sessão.</span></h1><p className="mt-5 max-w-md text-base leading-7 text-zinc-400">Filmes, horários e lugares escolhidos por você.</p></div><MovieWall eventos={eventos} onSelect={onSelectEvento} /></section>
}
