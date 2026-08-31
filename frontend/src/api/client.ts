import type { AuthSession, Evento, Ingresso } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = await response.json() as T & { erro?: string }
  if (!response.ok) throw new Error(body.erro ?? 'Não foi possível concluir a operação.')
  return body
}

export function login(email: string, senha: string) {
  return request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export function cadastrar(nome: string, email: string, senha: string) {
  return request<AuthSession>('/auth/cadastro', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  })
}

export function listarEventos() {
  return request<Evento[]>('/eventos')
}

export function detalharEvento(eventoId: string) {
  return request<Evento>(`/eventos/${eventoId}`)
}

export function criarReserva(token: string, sessaoId: string, assentoId: string) {
  return request<{ id: string }>('/reservas', {
    method: 'POST',
    body: JSON.stringify({ sessaoId, assentoId }),
  }, token)
}

export function pagarReserva(token: string, reservaId: string, aprovado: boolean) {
  return request<Ingresso>(`/reservas/${reservaId}/pagar`, {
    method: 'POST',
    body: JSON.stringify({ aprovado }),
  }, token)
}

export function listarMeusIngressos(token: string) {
  return request<Ingresso[]>('/reservas/minhas', {}, token)
}

export function validarIngresso(token: string, qrToken: string) {
  return request<{ status: string }>('/reservas/validar', {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  }, token)
}
