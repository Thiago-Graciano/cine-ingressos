import type { Assento, Sessao } from '../../types'

type PaymentActionsProps = { sessao: Sessao; assento: Assento | null; carregando: boolean; onPay: (aprovado: boolean) => void }

export function PaymentActions({ sessao, assento, carregando, onPay }: PaymentActionsProps) {
  const resumo = assento ? `Lugar ${assento.codigo} · R$ ${Number(sessao.preco).toFixed(2)}` : 'Selecione seu lugar'

  return <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center"><span className="flex-1 text-sm text-zinc-300">{resumo}</span><button className="rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={!assento || carregando} onClick={() => onPay(true)}>{carregando ? 'Processando...' : 'Pagar aprovado'}</button><button className="rounded-xl border border-orange-400/50 px-5 py-3 text-sm font-medium text-orange-300 transition hover:bg-orange-400/10 disabled:cursor-not-allowed disabled:opacity-50" disabled={!assento || carregando} onClick={() => onPay(false)}>Simular recusa</button></div>
}
