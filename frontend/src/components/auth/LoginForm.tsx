import { useState } from 'react'
import type { FormEvent } from 'react'

type LoginFormProps = {
  onSubmit: (email: string, senha: string) => Promise<void>
  onCreateAccount: () => void
  erro: string
  carregando: boolean
}

const inputClass = 'mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10'

export function LoginForm({ onSubmit, onCreateAccount, erro, carregando }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(email, senha)
  }

  return (
    <form className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10" onSubmit={enviar}>
      <p className="text-xs font-semibold tracking-[0.24em] text-orange-400">ACESSO AO CINEPASS</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Bem-vindo de volta.</h1>
      <p className="mt-4 text-sm leading-6 text-zinc-400">Entre para reservar seu lugar ou acessar a área da equipe.</p>

      <label className="mt-7 block text-sm font-medium text-zinc-200">
        E-mail
        <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="voce@email.com" autoComplete="email" />
      </label>
      <label className="mt-5 block text-sm font-medium text-zinc-200">
        Senha
        <input className={inputClass} value={senha} onChange={(event) => setSenha(event.target.value)} type="password" required placeholder="Sua senha" autoComplete="current-password" />
      </label>

      {erro && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{erro}</p>}

      <button className="mt-7 w-full rounded-xl bg-orange-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Ainda não tem uma conta?{' '}
        <button type="button" className="font-semibold text-orange-400 hover:text-orange-300" onClick={onCreateAccount}>Crie uma</button>
      </p>
    </form>
  )
}
