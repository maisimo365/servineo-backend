import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import { SERVER_PORT } from './config/env.config';

const app = express();
app.use(cors());
app.use(express.json());

// Utilidad para escribir en el log
function writeLog(message: string) {
  const logPath = path.join(__dirname, '..', 'app.log');
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  fs.appendFileSync(
    logPath,
    `${timestamp} [INFO]: [API_LOG] ${message}\n`,
    { encoding: 'utf8' }
  );
}

// Ruta raíz para evitar "route not found"
app.get('/', (req, res) => {
  res.json({ message: 'Backend Servineo funcionando correctamente.' });
});

// Endpoint para historial
app.get('/api/par3/historial', (req, res) => {
  // Lee el log y devuelve las líneas relevantes
  const logPath = path.join(__dirname, '..', 'app.log');
  let lines: string[] = [];
  try {
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      lines = content
        .split('\n')
        .filter(line => line.includes('[API_LOG]') && line.trim().length > 0);
    }
  } catch {}
  res.json({ parsedLog: lines });
});

// Endpoint para enviar notificación
app.post('/api/par3/enviar', (req, res) => {
  // Loguea la solicitud recibida
  writeLog(
    `Solicitud recibida. Datos a enviar: ${JSON.stringify(req.body)}`
  );
  // Simula llamada a API externa y loguea la respuesta
  const status = 201; // Puedes cambiar a 400 para probar error
  writeLog(`Respuesta de API externa: Status ${status}`);
  res.json({ message: 'Notificación enviada correctamente.' });
});

// Solo una llamada a listen
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});