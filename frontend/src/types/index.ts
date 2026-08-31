export type Papel = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA'

export type StatusAssento = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'

export type Assento = {
  id: string
  codigo: string
  status: StatusAssento
}

export type Sessao = {
  id: string
  dataHora: string
  local: string
  preco: string
  assentos?: Assento[]
}

export type Evento = {
  id: string
  titulo: string
  sinopse?: string | null
  posterUrl?: string | null
  sessoes: Sessao[]
}

export type Ingresso = {
  id: string
  qrToken: string
  shareToken: string
  status: 'VALIDO' | 'USADO'
  reserva: {
    assento: Assento
    sessao: Sessao & { evento: Evento }
  }
}

export type AuthSession = {
  token: string
  nome: string
  papel: Papel
}
