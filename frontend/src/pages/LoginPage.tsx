import { LoginForm } from '../components/auth/LoginForm'

type LoginPageProps = {
  onLogin: (email: string, senha: string) => Promise<void>
  onCreateAccount: () => void
  erro: string
  carregando: boolean
}

export function LoginPage({ onLogin, onCreateAccount, erro, carregando }: LoginPageProps) {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:grid sm:place-items-center sm:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),transparent_38rem)]">
      <LoginForm onSubmit={onLogin} onCreateAccount={onCreateAccount} erro={erro} carregando={carregando} />
    </section>
  )
}
