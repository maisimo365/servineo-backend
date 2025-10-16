import { enviarNotificacionService, obtenerHistorialService } from './service.js';

export const obtenerHistorial = async (req, res) => {
  try {
    const historial = await obtenerHistorialService();
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};

export const enviarNotificacion = async (req, res) => {
  try {
    const { number, text, logData } = req.body;
    const resultado = await enviarNotificacionService({ number, text, logData });
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error enviando notificación' });
  }
};