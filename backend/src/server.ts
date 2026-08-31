import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import eventoRoutes from './routes/evento.routes';
import reservaRoutes from './routes/reserva.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/eventos', eventoRoutes);
app.use('/reservas', reservaRoutes);
const PORTA = process.env.PORTA || 3333;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));

app.use((erro: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});
