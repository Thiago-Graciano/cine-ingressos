import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'
type Evento = { id: string; titulo: string; sinopse?: string | null; posterUrl?: string | null; sessoes: Sessao[] }
type Sessao = { id: string; dataHora: string; local: string; preco: string; assentos?: Assento[] }
type Assento = { id: string; codigo: string; status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' }
type Ingresso = { id: string; qrToken: string; shareToken: string; status: string; reserva: { assento: Assento; sessao: Sessao & { evento: Evento } } }

function App() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [evento, setEvento] = useState<Evento | null>(null)
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [assento, setAssento] = useState<Assento | null>(null)
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [tela, setTela] = useState<'catalogo' | 'evento' | 'login' | 'ingressos' | 'portaria'>('catalogo')
  const [token, setToken] = useState(() => localStorage.getItem('cine_token') ?? '')
  const [nome, setNome] = useState(() => localStorage.getItem('cine_nome') ?? '')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => { void carregarEventos() }, [])
  async function carregarEventos() { const r = await fetch(`${API_URL}/eventos`); if (r.ok) setEventos(await r.json() as Evento[]) }
  async function abrirEvento(id: string) { const r = await fetch(`${API_URL}/eventos/${id}`); if (!r.ok) return setMensagem('Não foi possível carregar este filme.'); setEvento(await r.json() as Evento); setSessao(null); setAssento(null); setTela('evento') }
  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const dados = new FormData(event.currentTarget); setCarregando(true)
    const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: dados.get('email'), senha: dados.get('senha') }) })
    const corpo = await r.json() as { token?: string; nome?: string; erro?: string }; setCarregando(false)
    if (!r.ok || !corpo.token) return setMensagem(corpo.erro ?? 'Não foi possível entrar.')
    localStorage.setItem('cine_token', corpo.token); localStorage.setItem('cine_nome', corpo.nome ?? ''); setToken(corpo.token); setNome(corpo.nome ?? ''); setTela('catalogo')
  }
  async function escolherSessao(item: Sessao) {
    setCarregando(true); const r = await fetch(`${API_URL}/eventos/${evento!.id}`); const atualizado = await r.json() as Evento
    setEvento(atualizado); setSessao(atualizado.sessoes.find((s) => s.id === item.id) ?? item); setAssento(null); setCarregando(false)
  }
  async function reservarEPagar(aprovado: boolean) {
    if (!token) return setTela('login'); if (!sessao || !assento) return setMensagem('Escolha um assento disponível.'); setCarregando(true)
    const r = await fetch(`${API_URL}/reservas`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ sessaoId: sessao.id, assentoId: assento.id }) })
    const reserva = await r.json() as { id?: string; erro?: string }
    if (!r.ok || !reserva.id) { setCarregando(false); return setMensagem(reserva.erro ?? 'Não foi possível reservar o assento.') }
    const p = await fetch(`${API_URL}/reservas/${reserva.id}/pagar`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ aprovado }) })
    const corpo = await p.json() as { erro?: string }; setCarregando(false)
    if (!p.ok) return setMensagem(corpo.erro ?? 'Pagamento recusado.')
    setMensagem('Pagamento aprovado! Seu ingresso está em Meus ingressos.'); await carregarIngressos()
  }
  async function carregarIngressos() { if (!token) return setTela('login'); const r = await fetch(`${API_URL}/reservas/minhas`, { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setIngressos(await r.json() as Ingresso[]); setTela('ingressos') }
  function sair() { localStorage.removeItem('cine_token'); localStorage.removeItem('cine_nome'); setToken(''); setNome(''); setTela('catalogo') }

  return <div className="app-shell"><header className="topbar"><button className="brand" onClick={() => setTela('catalogo')}><span>◉</span> CINE<span className="brand-muted">PASS</span></button><nav><button onClick={() => setTela('catalogo')}>Filmes</button>{token && <button onClick={() => void carregarIngressos()}>Meus ingressos</button>}<button onClick={() => token ? setTela('portaria') : setTela('login')}>Portaria</button>{token ? <button className="user-link" onClick={sair}>{nome || 'Sair'}</button> : <button className="outline-button" onClick={() => setTela('login')}>Entrar</button>}</nav></header>{mensagem && <div className="toast">{mensagem}<button onClick={() => setMensagem('')}>×</button></div>}<main>
    {tela === 'catalogo' && <section className="catalog-page"><div className="hero-copy"><p className="eyebrow">PROGRAMAÇÃO DA SEMANA</p><h1>Escolha sua<br /><em>próxima sessão.</em></h1><p>Filmes, horários e lugares escolhidos por você.</p></div><div className="poster-wall">{eventos.map((item) => <button className="movie-card" key={item.id} onClick={() => void abrirEvento(item.id)}>{item.posterUrl ? <img src={item.posterUrl} alt={`Pôster de ${item.titulo}`} /> : <div className="poster-fallback">{item.titulo}</div>}<div className="movie-info"><strong>{item.titulo}</strong><span>{item.sessoes.length} sessão(ões)</span></div></button>)}</div>{!eventos.length && <div className="empty-state">Nenhum filme publicado ainda.</div>}</section>}
    {tela === 'evento' && evento && <section className="detail-page"><button className="back-button" onClick={() => setTela('catalogo')}>← voltar para filmes</button><div className="detail-layout"><img className="detail-poster" src={evento.posterUrl ?? ''} alt="" /><div><p className="eyebrow">EM CARTAZ</p><h1>{evento.titulo}</h1><p className="synopsis">{evento.sinopse || 'Uma experiência cinematográfica para viver na sala.'}</p><h2>Escolha uma sessão</h2><div className="session-list">{evento.sessoes.map((item) => <button className={`session-card ${sessao?.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => void escolherSessao(item)}><strong>{new Date(item.dataHora).toLocaleDateString('pt-BR')}</strong><span>{new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {item.local}</span><b>R$ {Number(item.preco).toFixed(2)}</b></button>)}</div>{sessao && <SeatPicker sessao={sessao} selected={assento} onSelect={setAssento} onPay={() => void reservarEPagar(true)} onDecline={() => void reservarEPagar(false)} loading={carregando} />}</div></div></section>}
    {tela === 'login' && <section className="center-page"><form className="auth-card" onSubmit={entrar}><p className="eyebrow">ACESSO AO CINEPASS</p><h1>Bem-vindo de volta.</h1><label>E-mail<input name="email" type="email" required placeholder="cliente@cinepass.com" /></label><label>Senha<input name="senha" type="password" required placeholder="••••••••" /></label><button className="primary-button" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button><p className="hint">Use um cliente semeado no banco para testar a compra.</p></form></section>}
    {tela === 'ingressos' && <section className="content-page"><p className="eyebrow">SUA ESTANTE</p><h1>Meus ingressos.</h1><div className="ticket-list">{ingressos.map((item) => <article className="ticket" key={item.id}><div><span className="ticket-status">{item.status}</span><h2>{item.reserva.sessao.evento.titulo}</h2><p>{item.reserva.assento.codigo} · {new Date(item.reserva.sessao.dataHora).toLocaleString('pt-BR')}</p><small>Link: /ingressos/{item.shareToken}</small></div><div className="qr-placeholder"><img src={`https://quickchart.io/qr?text=${encodeURIComponent(item.qrToken)}&size=120`} alt="QR Code do ingresso" /><small>Apresente este código</small></div></article>)}{!ingressos.length && <div className="empty-state">Você ainda não possui ingressos.</div>}</div></section>}
    {tela === 'portaria' && <GatePage token={token} onMessage={setMensagem} />}
  </main></div>
}

function SeatPicker({ sessao, selected, onSelect, onPay, onDecline, loading }: { sessao: Sessao; selected: Assento | null; onSelect: (assento: Assento) => void; onPay: () => void; onDecline: () => void; loading: boolean }) { const assentos = sessao.assentos ?? []; return <div className="seat-section"><div className="screen">TELA</div><div className="seat-grid">{assentos.map((item) => <button key={item.id} disabled={item.status !== 'DISPONIVEL'} className={`seat ${item.status.toLowerCase()} ${selected?.id === item.id ? 'chosen' : ''}`} onClick={() => onSelect(item)}>{item.codigo}</button>)}</div><div className="legend"><span><i className="available" /> disponível</span><span><i className="sold" /> ocupado</span></div><div className="payment-actions"><span>{selected ? `Lugar ${selected.codigo} · R$ ${Number(sessao.preco).toFixed(2)}` : 'Selecione seu lugar'}</span><button className="primary-button" disabled={!selected || loading} onClick={onPay}>{loading ? 'Processando...' : 'Pagar aprovado'}</button><button className="decline-button" disabled={!selected || loading} onClick={onDecline}>Simular recusa</button></div></div> }
function GatePage({ token, onMessage }: { token: string; onMessage: (message: string) => void }) { const [codigo, setCodigo] = useState(''); const [status, setStatus] = useState(''); async function validar(event: FormEvent) { event.preventDefault(); const r = await fetch(`${API_URL}/reservas/validar`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ qrToken: codigo }) }); const corpo = await r.json() as { status?: string; erro?: string }; setStatus(corpo.status ?? 'INVALIDO'); onMessage(corpo.erro ?? `Ingresso ${corpo.status?.toLowerCase() ?? 'inválido'}.`) } return <section className="center-page"><form className="gate-card" onSubmit={validar}><p className="eyebrow">CONTROLE DE ENTRADA</p><h1>Portaria.</h1><p>Escaneie o QR Code ou cole o código do ingresso.</p><CameraScanner onCode={setCodigo} /><input value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder="Cole o código aqui" /><button className="primary-button">Validar ingresso</button>{status && <div className={`validation ${status.toLowerCase()}`}>{status}</div>}<small>A digitação continua disponível como fallback.</small></form></section> }
function CameraScanner({ onCode }: { onCode: (code: string) => void }) { const videoRef = useRef<HTMLVideoElement>(null); const [ativo, setAtivo] = useState(false); const [aviso, setAviso] = useState('Câmera desativada'); useEffect(() => { let stream: MediaStream | undefined; let timer: number | undefined; let ativoLocal = true; async function iniciar() { const Detector = (window as unknown as { BarcodeDetector?: new () => { detect(video: HTMLVideoElement): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector; if (!Detector) return setAviso('Seu navegador não oferece leitura automática; use a digitação.'); try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); if (!ativoLocal || !videoRef.current) return; videoRef.current.srcObject = stream; await videoRef.current.play(); setAtivo(true); const detector = new Detector(); timer = window.setInterval(async () => { if (!videoRef.current) return; const codes = await detector.detect(videoRef.current); if (codes[0]?.rawValue) onCode(codes[0].rawValue); }, 700); } catch { setAviso('Permita o acesso à câmera ou use a digitação.'); } } void iniciar(); return () => { ativoLocal = false; if (timer) window.clearInterval(timer); stream?.getTracks().forEach((track) => track.stop()); } }, [onCode]); return <div className="camera-box"><video ref={videoRef} muted playsInline /><span>{ativo ? 'Aponte para o QR Code' : aviso}</span></div> }
export default App
