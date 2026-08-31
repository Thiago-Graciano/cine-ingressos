import { useEffect, useState } from 'react'
import {
  cadastrar,
  criarReserva,
  detalharEvento,
  listarEventos,
  listarMeusIngressos,
  login,
  pagarReserva,
} from './api/client'
import type { Assento, AuthSession, Evento, Ingresso, Papel, Sessao } from './types'
import { AppShell } from './components/layout/AppShell'
import { CustomerHomePage } from './pages/CustomerHomePage'
import { EventDetailsPage } from './pages/EventDetailsPage'
import { GatePage } from './pages/GatePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StaffHomePage } from './pages/StaffHomePage'
import { TicketsPage } from './pages/TicketsPage'

type Tela = 'inicio' | 'evento' | 'ingressos' | 'portaria'
type AuthMode = 'login' | 'cadastro'

function obterSessao(): AuthSession | null {
  const token = localStorage.getItem('cine_token')
  const papel = localStorage.getItem('cine_papel') as Papel | null
  if (!token || !papel) return null

  return { token, papel, nome: localStorage.getItem('cine_nome') ?? '' }
}

function App() {
  const [sessaoAuth, setSessaoAuth] = useState<AuthSession | null>(obterSessao)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [tela, setTela] = useState<Tela>('inicio')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null)
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(null)
  const [assentoSelecionado, setAssentoSelecionado] = useState<Assento | null>(null)
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroAuth, setErroAuth] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (sessaoAuth?.papel !== 'CLIENTE') return

    let ativo = true
    async function carregar() {
      try {
        const lista = await listarEventos()
        if (ativo) setEventos(lista)
      } catch (erroApi) {
        if (ativo) setMensagem((erroApi as Error).message)
      }
    }

    void carregar()
    return () => { ativo = false }
  }, [sessaoAuth])

  function salvarSessao(auth: AuthSession) {
    localStorage.setItem('cine_token', auth.token)
    localStorage.setItem('cine_nome', auth.nome)
    localStorage.setItem('cine_papel', auth.papel)
    setSessaoAuth(auth)
    setTela(auth.papel === 'PORTARIA' ? 'portaria' : 'inicio')
  }

  async function entrar(email: string, senha: string) {
    try {
      setCarregando(true)
      setErroAuth('')
      salvarSessao(await login(email, senha))
    } catch (erroApi) {
      setErroAuth((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  async function criarConta(nome: string, email: string, senha: string) {
    try {
      setCarregando(true)
      setErroAuth('')
      salvarSessao(await cadastrar(nome, email, senha))
    } catch (erroApi) {
      setErroAuth((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  async function abrirEvento(eventoId: string) {
    try {
      setCarregando(true)
      setEventoSelecionado(await detalharEvento(eventoId))
      setSessaoSelecionada(null)
      setAssentoSelecionado(null)
      setTela('evento')
    } catch (erroApi) {
      setMensagem((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  async function selecionarSessao(sessao: Sessao) {
    if (!eventoSelecionado) return

    try {
      setCarregando(true)
      const eventoAtualizado = await detalharEvento(eventoSelecionado.id)
      const sessaoAtualizada = eventoAtualizado.sessoes.find((item) => item.id === sessao.id)

      if (!sessaoAtualizada) {
        setMensagem('Esta sessão não está mais disponível.')
        return
      }

      setEventoSelecionado(eventoAtualizado)
      setSessaoSelecionada(sessaoAtualizada)
      setAssentoSelecionado(null)
    } catch (erroApi) {
      setMensagem((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  async function abrirIngressos() {
    if (!sessaoAuth || sessaoAuth.papel !== 'CLIENTE') return

    try {
      setCarregando(true)
      setIngressos(await listarMeusIngressos(sessaoAuth.token))
      setTela('ingressos')
    } catch (erroApi) {
      setMensagem((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  async function concluirPagamento(aprovado: boolean) {
    if (!sessaoAuth || !sessaoSelecionada || !assentoSelecionado) return

    try {
      setCarregando(true)
      const reserva = await criarReserva(sessaoAuth.token, sessaoSelecionada.id, assentoSelecionado.id)
      await pagarReserva(sessaoAuth.token, reserva.id, aprovado)
      setMensagem(aprovado ? 'Pagamento aprovado. Seu ingresso está em Meus ingressos.' : 'Pagamento recusado. Seu assento foi liberado.')
      if (aprovado) await abrirIngressos()
    } catch (erroApi) {
      setMensagem((erroApi as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  function sair() {
    localStorage.removeItem('cine_token')
    localStorage.removeItem('cine_nome')
    localStorage.removeItem('cine_papel')
    setSessaoAuth(null)
    setAuthMode('login')
    setTela('inicio')
  }

  if (!sessaoAuth) {
    return authMode === 'login'
      ? <LoginPage onLogin={entrar} onCreateAccount={() => { setErroAuth(''); setAuthMode('cadastro') }} erro={erroAuth} carregando={carregando} />
      : <RegisterPage onRegister={criarConta} onLogin={() => { setErroAuth(''); setAuthMode('login') }} erro={erroAuth} carregando={carregando} />
  }

  const conteudo = sessaoAuth.papel === 'CLIENTE' ? (
    <>
      {tela === 'inicio' && <CustomerHomePage eventos={eventos} onSelectEvento={(id) => void abrirEvento(id)} />}
      {tela === 'evento' && eventoSelecionado && <EventDetailsPage evento={eventoSelecionado} sessao={sessaoSelecionada} assento={assentoSelecionado} carregando={carregando} onBack={() => setTela('inicio')} onSession={(item) => void selecionarSessao(item)} onSeat={setAssentoSelecionado} onPay={(aprovado) => void concluirPagamento(aprovado)} />}
      {tela === 'ingressos' && <TicketsPage ingressos={ingressos} />}
    </>
  ) : sessaoAuth.papel === 'PORTARIA' && tela === 'portaria' ? <GatePage token={sessaoAuth.token} onMessage={setMensagem} /> : <StaffHomePage papel={sessaoAuth.papel} />

  return <AppShell nome={sessaoAuth.nome} papel={sessaoAuth.papel} onHome={() => setTela('inicio')} onTickets={() => void abrirIngressos()} onLogout={sair}>{mensagem && <div className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-4 rounded-xl bg-orange-400 px-4 py-3 text-sm font-medium text-zinc-950 shadow-xl shadow-black/30"><span>{mensagem}</span><button className="text-lg leading-none" onClick={() => setMensagem('')}>×</button></div>}{carregando && <div className="fixed left-0 top-0 z-50 h-1 w-1/2 animate-pulse bg-orange-400" />}{conteudo}</AppShell>
}

export default App
