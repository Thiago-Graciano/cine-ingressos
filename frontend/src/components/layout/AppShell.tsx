import type { ReactNode } from 'react'
import type { Papel } from '../../types'

type AppShellProps = {
  nome: string
  papel: Papel
  children: ReactNode
  onHome: () => void
  onTickets: () => void
  onLogout: () => void
}

export function AppShell({ nome, papel, children, onHome, onTickets, onLogout }: AppShellProps) {
  const isClient = papel === 'CLIENTE'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button className="text-sm font-bold tracking-[0.2em] text-white" onClick={onHome} aria-label="Voltar para o início">
            <span className="mr-2 text-orange-400">◉</span>CINE<span className="text-zinc-500">PASS</span>
          </button>
          <nav className="flex items-center gap-2 sm:gap-5">
            {isClient && <>
              <button className="text-sm text-zinc-400 transition hover:text-white" onClick={onHome}>Filmes</button>
              <button className="text-sm text-zinc-400 transition hover:text-white" onClick={onTickets}>Meus ingressos</button>
            </>}
            <span className="hidden text-sm text-orange-300 sm:inline">{nome}</span>
            <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-orange-400 hover:text-orange-300" onClick={onLogout}>Sair</button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
