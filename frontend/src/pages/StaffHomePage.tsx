import type { Papel } from '../types'

export function StaffHomePage({ papel }: { papel: Papel }) {
  const organizador = papel === 'ORGANIZADOR'
  const title = organizador ? 'Organizador.' : 'Portaria.'
  const intro = organizador ? 'Aqui você poderá buscar um filme no catálogo e publicar novas sessões.' : 'Acesse a validação para conferir os ingressos na entrada.'

  return <section><p className="text-xs font-semibold tracking-[0.24em] text-orange-400">ÁREA RESTRITA</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{title}</h1><p className="mt-5 max-w-xl leading-7 text-zinc-400">{intro}</p><div className="mt-8 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><strong className="text-white">{organizador ? 'Próximo passo' : 'Validar ingressos'}</strong><span className="mt-2 block text-sm text-zinc-400">{organizador ? 'Painel de criação de eventos em construção.' : 'Use a opção Portaria para abrir o leitor.'}</span></div></section>
}
