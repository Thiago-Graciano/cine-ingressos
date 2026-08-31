import type { Ingresso } from '../../types'

export function TicketCard({ ingresso }: { ingresso: Ingresso }) {
  const { evento } = ingresso.reserva.sessao
  const dataFormatada = new Date(ingresso.reserva.sessao.dataHora).toLocaleString('pt-BR')
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(ingresso.qrToken)}&size=120`

  return <article className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between"><div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">{ingresso.status}</span><h2 className="mt-4 text-xl font-semibold text-white">{evento.titulo}</h2><p className="mt-2 text-sm text-zinc-400">{ingresso.reserva.assento.codigo} · {dataFormatada}</p><small className="mt-3 block break-all text-xs text-zinc-500">Link compartilhável: /ingressos/{ingresso.shareToken}</small></div><div className="w-fit rounded-xl bg-white p-2 text-center"><img className="h-28 w-28" src={qrUrl} alt="QR Code do ingresso" /><small className="block text-xs text-zinc-700">Apresente este código</small></div></article>
}
