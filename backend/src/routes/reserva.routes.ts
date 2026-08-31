import { Router } from 'express';
import {
  criarReserva,
  listarMinhasReservas,
  obterIngressoCompartilhado,
  pagarReserva,
  validarIngresso,
} from '../controllers/reserva.controller';
import { autenticar, autorizar } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', autenticar, autorizar('CLIENTE'), criarReserva);
router.get('/minhas', autenticar, autorizar('CLIENTE'), listarMinhasReservas);
router.post('/:reservaId/pagar', autenticar, autorizar('CLIENTE'), pagarReserva);
router.get('/compartilhado/:shareToken', obterIngressoCompartilhado);
router.post('/validar', autenticar, autorizar('PORTARIA'), validarIngresso);

export default router;
