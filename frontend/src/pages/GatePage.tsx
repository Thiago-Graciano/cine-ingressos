import { useState } from 'react'
import type { FormEvent } from 'react'
import { validarIngresso } from '../api/client'
import { CameraScanner } from '../components/gate/CameraScanner'

export function GatePage({ token, onMessage }: { token: string; onMessage: (message: string) => void }) {
  const [codigo, setCodigo] = useState('')
  const [status, setStatus] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function validar(event?: FormEvent, codigoLido = codigo) {
    event?.preventDefault()
    if (!codigoLido || carregando) return
    setCarregando(true)
    try { const resultado = await validarIngresso(token, codigoLido); setStatus(resultado.status); onMessage(`Ingresso ${resultado.status.toLowerCase()}.`) } catch (erro) { setStatus('INVALIDO'); onMessage((erro as Error).message) } finally { setCarregando(false) }
  }

  return <section className="mx-auto max-w-md"><form className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl shadow-black/20" onSubmit={validar}><p className="text-xs font-semibold tracking-[0.24em] text-orange-400">CONTROLE DE ENTRADA</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Portaria.</h1><p className="mt-4 text-sm leading-6 text-zinc-400">Escaneie o QR Code ou cole o código do ingresso.</p><CameraScanner onCode={(code) => { setCodigo(code); void validar(undefined, code) }} /><input className="mt-5 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400" value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder="Cole o código aqui" /><button className="mt-4 w-full rounded-xl bg-orange-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={!codigo || carregando}>{carregando ? 'Validando...' : 'Validar ingresso'}</button>{status && <div className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-semibold ${status === 'VALIDO' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-200'}`}>{status}</div>}<small className="mt-5 block text-xs text-zinc-500">A digitação continua disponível como fallback.</small></form></section>
}
