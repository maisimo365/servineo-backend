import { Router } from 'express';
import { obtenerHistorial, enviarNotificacion } from './controller.js';

const router = Router();

router.get('/historial', obtenerHistorial);
router.post('/enviar', enviarNotificacion);

export default router;