import { useState } from 'react'
import type { FormEvent } from 'react'

type RegisterFormProps = {
  onSubmit: (nome: string, email: string, senha: string) => Promise<void>
  onLogin: () => void
  erro: string
  carregando: boolean
}

const inputClass = 'mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10'

export function RegisterForm({ onSubmit, onLogin, erro, carregando }: RegisterFormProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(nome, email, senha)
  }

  return (
    <form className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10" onSubmit={enviar}>
      <p className="text-xs font-semibold tracking-[0.24em] text-orange-400">NOVO NO CINEPASS</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Crie sua conta.</h1>
      <p className="mt-4 text-sm leading-6 text-zinc-400">Seu cadastro cria uma conta de cliente e já libera a compra de ingressos.</p>

      <label className="mt-7 block text-sm font-medium text-zinc-200">
        Nome
        <input className={inputClass} value={nome} onChange={(event) => setNome(event.target.value)} required placeholder="Seu nome" autoComplete="name" />
      </label>
      <label className="mt-5 block text-sm font-medium text-zinc-200">
        E-mail
        <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="voce@email.com" autoComplete="email" />
      </label>
      <label className="mt-5 block text-sm font-medium text-zinc-200">
        Senha
        <input className={inputClass} value={senha} onChange={(event) => setSenha(event.target.value)} type="password" minLength={6} required placeholder="Pelo menos 6 caracteres" autoComplete="new-password" />
      </label>

      {erro && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{erro}</p>}

      <button className="mt-7 w-full rounded-xl bg-orange-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={carregando}>
        {carregando ? 'Criando conta...' : 'Criar conta'}
      </button>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Já possui uma conta?{' '}
        <button type="button" className="font-semibold text-orange-400 hover:text-orange-300" onClick={onLogin}>Entrar</button>
      </p>
    </form>
  )
}
