import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

async function criarUsuario(nome: string, email: string, papel: 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA') {
  const senhaHash = await bcrypt.hash('123456', 10);
  return prisma.usuario.upsert({ where: { email }, update: { nome, papel, senhaHash }, create: { nome, email, papel, senhaHash } });
}

async function main() {
  await criarUsuario('Organizador Demo', 'organizador@cinepass.com', 'ORGANIZADOR');
  await criarUsuario('Cliente Demo 1', 'cliente@cinepass.com', 'CLIENTE');
  await criarUsuario('Cliente Demo 2', 'cliente2@cinepass.com', 'CLIENTE');
  await criarUsuario('Portaria Demo', 'portaria@cinepass.com', 'PORTARIA');
  const evento = await prisma.evento.upsert({ where: { tmdbId: 999001 }, update: {}, create: { tmdbId: 999001, titulo: 'Sessão CinePass', sinopse: 'Uma sessão de demonstração para percorrer o fluxo completo do desafio.', posterUrl: 'https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQwNYXEGot6bH.jpg' } });
  const sessaoExistente = await prisma.sessao.findFirst({ where: { eventoId: evento.id } });
  const sessao = sessaoExistente ?? await prisma.sessao.create({ data: { eventoId: evento.id, dataHora: new Date(Date.now() + 86400000), local: 'Sala 01', capacidade: 50, preco: 32.9 } });
  if (!await prisma.assento.count({ where: { sessaoId: sessao.id } })) {
    const dados = Array.from({ length: 50 }, (_, index) => ({ sessaoId: sessao.id, codigo: `${String.fromCharCode(65 + Math.floor(index / 10))}${(index % 10) + 1}` }));
    await prisma.assento.createMany({ data: dados });
  }
  console.log('Seed concluído. Senha dos usuários demo: 123456');
}

main().catch((erro) => { console.error(erro); process.exit(1); }).finally(() => prisma.$disconnect());
