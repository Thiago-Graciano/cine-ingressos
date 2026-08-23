import { Request, Response } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

function gerarQrToken(ingressoId: string, reservaId: string, eventoId: string) {
  return jwt.sign(
    { ingressoId, reservaId, eventoId, tipo: 'INGRESSO' },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' },
  );
}

export async function criarReserva(req: Request, res: Response) {
  const usuarioId = req.usuario!.id;
  const { sessaoId, assentoId } = req.body;

  if (!sessaoId || !assentoId) {
    return res.status(400).json({ erro: 'Informe a sessão e o assento' });
  }

  try {
    const reserva = await prisma.$transaction(async (tx) => {
      const assento = await tx.assento.findFirst({
        where: { id: assentoId, sessaoId, status: 'DISPONIVEL' },
      });

      if (!assento) {
        throw new Error('ASSENTO_INDISPONIVEL');
      }

      const atualizado = await tx.assento.updateMany({
        where: { id: assentoId, sessaoId, status: 'DISPONIVEL' },
        data: { status: 'RESERVADO' },
      });

      if (atualizado.count !== 1) {
        throw new Error('ASSENTO_INDISPONIVEL');
      }

      return tx.reserva.create({
        data: { usuarioId, sessaoId, assentoId },
        include: { assento: true },
      });
    });

    return res.status(201).json(reserva);
  } catch (erro) {
    if ((erro as Error).message === 'ASSENTO_INDISPONIVEL') {
      return res.status(409).json({ erro: 'Assento indisponível' });
    }
    return res.status(400).json({ erro: (erro as Error).message });
  }
}

export async function pagarReserva(req: Request, res: Response) {
  const usuarioId = req.usuario!.id;
  const reservaId = String(req.params.reservaId);
  const { aprovado } = req.body;

  if (typeof aprovado !== 'boolean') {
    return res.status(400).json({ erro: 'Informe se o pagamento foi aprovado' });
  }

  const reserva = await prisma.reserva.findFirst({
    where: { id: reservaId, usuarioId },
    include: { assento: true, sessao: { include: { evento: true } } },
  });

  if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
  const ingressoExistente = await prisma.ingresso.findUnique({ where: { reservaId: reserva.id } });
  if (ingressoExistente) return res.status(409).json({ erro: 'Reserva já paga' });

  if (!aprovado) {
    await prisma.$transaction([
      prisma.reserva.delete({ where: { id: reserva.id } }),
      prisma.assento.update({ where: { id: reserva.assentoId }, data: { status: 'DISPONIVEL' } }),
    ]);
    return res.status(402).json({ erro: 'Pagamento recusado', status: 'RECUSADO' });
  }

  const ingressoId = crypto.randomUUID();
  const ingresso = await prisma.$transaction(async (tx) => {
    await tx.assento.update({
      where: { id: reserva.assentoId },
      data: { status: 'VENDIDO' },
    });

    const qrToken = gerarQrToken(ingressoId, reserva.id, reserva.sessao.evento.id);
    return tx.ingresso.create({
      data: {
        id: ingressoId,
        reservaId: reserva.id,
        qrToken,
        shareToken: crypto.randomUUID(),
      },
      include: { reserva: { include: { assento: true, sessao: { include: { evento: true } } } } },
    });
  });

  return res.status(201).json(ingresso);
}

export async function listarMinhasReservas(req: Request, res: Response) {
  const reservas = await prisma.reserva.findMany({
    where: { usuarioId: req.usuario!.id },
    include: { assento: true, ingresso: true, sessao: { include: { evento: true } } },
    orderBy: { criadoEm: 'desc' },
  });
  return res.json(reservas);
}

export async function obterIngressoCompartilhado(req: Request, res: Response) {
  const ingresso = await prisma.ingresso.findUnique({
    where: { shareToken: String(req.params.shareToken) },
    include: { reserva: { include: { assento: true, sessao: { include: { evento: true } } } } },
  });

  if (!ingresso) return res.status(404).json({ erro: 'Ingresso não encontrado' });
  return res.json(ingresso);
}

export async function validarIngresso(req: Request, res: Response) {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ erro: 'Informe o código do ingresso' });

  let dados: { ingressoId: string; eventoId?: string };
  try {
    dados = jwt.verify(qrToken, process.env.JWT_SECRET!) as { ingressoId: string };
  } catch {
    return res.status(400).json({ status: 'INVALIDO', erro: 'Código inválido' });
  }

  const ingresso = await prisma.ingresso.findUnique({
    where: { id: dados.ingressoId },
    include: { reserva: { include: { assento: true, sessao: { include: { evento: true } } } } },
  });

  if (!ingresso) return res.status(404).json({ status: 'INVALIDO', erro: 'Ingresso não encontrado' });
  if (req.body.eventoId && req.body.eventoId !== ingresso.reserva.sessao.eventoId) {
    return res.status(409).json({ status: 'EVENTO_ERRADO', erro: 'Ingresso pertence a outro evento', ingresso });
  }
  if (ingresso.status === 'USADO') return res.status(409).json({ status: 'USADO', ingresso });

  const atualizado = await prisma.ingresso.updateMany({
    where: { id: ingresso.id, status: 'VALIDO' },
    data: { status: 'USADO', usadoEm: new Date() },
  });

  if (atualizado.count !== 1) return res.status(409).json({ status: 'USADO', ingresso });
  return res.json({ status: 'VALIDO', ingresso: { ...ingresso, status: 'USADO' } });
}
