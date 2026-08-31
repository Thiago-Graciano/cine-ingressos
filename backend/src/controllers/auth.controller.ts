import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export async function cadastrar(req: Request, res: Response) {
  const { nome, email, senha } = req.body;

  if (!nome?.trim() || !email?.trim() || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const emailNormalizado = email.trim().toLowerCase();

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome: nome.trim(), email: emailNormalizado, senhaHash, papel: 'CLIENTE' },
    });

    const token = jwt.sign(
      { id: usuario.id, papel: usuario.papel },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return res.status(201).json({ token, nome: usuario.nome, papel: usuario.papel });
  } catch (erro: unknown) {
    if ((erro as { code?: string }).code === 'P2002') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' });
    }
    return res.status(500).json({ erro: 'Não foi possível criar sua conta' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha' });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaCorreta) return res.status(401).json({ erro: 'Credenciais inválidas' });

  const token = jwt.sign(
    { id: usuario.id, papel: usuario.papel },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.json({ token, papel: usuario.papel, nome: usuario.nome });
}
