import { RegisterForm } from '../components/auth/RegisterForm'

type RegisterPageProps = {
  onRegister: (nome: string, email: string, senha: string) => Promise<void>
  onLogin: () => void
  erro: string
  carregando: boolean
}

export function RegisterPage({ onRegister, onLogin, erro, carregando }: RegisterPageProps) {
  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:grid sm:place-items-center sm:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),transparent_38rem)]">
      <RegisterForm onSubmit={onRegister} onLogin={onLogin} erro={erro} carregando={carregando} />
    </section>
  )
}
