import { Request, Response } from 'express';
import { buscarFilmes, buscarFilmePorId } from '../services/tmdb.service';
import { prisma } from '../lib/prisma';
import { gerarAssentos } from '../utils/assentos';

export async function buscarCatalogo(req: Request, res: Response) {
  const termo = req.query.busca as string;
  if (!termo) return res.status(400).json({ erro: 'Informe um termo de busca' });

  try {
    const filmes = await buscarFilmes(termo);
    res.json(filmes);
  } catch (erro) {
    res.status(502).json({ erro: (erro as Error).message });
  }
}

export async function criarEvento(req: Request, res: Response) {
  const { tmdbId, dataHora, local, capacidade, preco } = req.body;

  if (!tmdbId || !dataHora || !local || !capacidade || !preco) {
  return res.status(400).json({ erro: 'Campos obrigatórios: tmdbId, dataHora, local, capacidade, preco' });
}

if (!Number.isInteger(capacidade) || capacidade <= 0) {
  return res.status(400).json({ erro: 'Capacidade deve ser um número inteiro positivo' });
}

  try {
    const filme = await buscarFilmePorId(tmdbId);

    const evento = await prisma.evento.upsert({
      where: { tmdbId },
      update: {},
      create: {
        titulo: filme.title,
        sinopse: filme.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${filme.poster_path}`,
        tmdbId,
      },
    });

    const sessao = await prisma.sessao.create({
      data: { eventoId: evento.id, dataHora, local, capacidade, preco },
    });

    await prisma.assento.createMany({
      data: gerarAssentos(sessao.id, capacidade),
    });

    res.status(201).json({ evento, sessao, assentosGerados: capacidade });
  } catch (erro) {
    res.status(400).json({ erro: (erro as Error).message });
  }
}

export async function listarEventos(req: Request, res: Response) {
  const eventos = await prisma.evento.findMany({
    include: { sessoes: true },
    orderBy: { criadoEm: 'desc' },
  });
  res.json(eventos);
}

export async function detalharEvento(req: Request, res: Response) {
  const id = String(req.params.id);

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: { sessoes: { include: { assentos: true } } },
  });

  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' });

  res.json(evento);
}

export async function editarSessao(req: Request, res: Response) {
  const sessaoId = String(req.params.sessaoId);
  const { dataHora, local, preco } = req.body;

  try {
    const sessao = await prisma.sessao.update({
      where: { id: sessaoId },
      data: { dataHora, local, preco },
    });
    res.json(sessao);
  } catch (erro: any) {
    if (erro.code === 'P2025') {
      return res.status(404).json({ erro: 'Sessão não encontrada' });
    }
    res.status(400).json({ erro: erro.message });
  }
}
