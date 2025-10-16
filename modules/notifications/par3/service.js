import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // ✅ Importar fetch para Node.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tu lógica original de enviar a la API externa
const enviarAAPIExterna = async (cuerpo) => {
  const API_URL = "https://n8n-evolution-api.oumu0g.easypanel.host/message/sendText/pruebas";
  const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";
  const AUTH_TOKEN = "Bearer B1719736AF1B-4E77-83D0-DC78E7D578A8";

  console.log("📤 Enviando a API externa:", API_URL);
  console.log("📝 Datos:", cuerpo);

  const respuestaAPI = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": API_KEY,
      "Authorization": AUTH_TOKEN,
    },
    body: JSON.stringify(cuerpo),
  });

  console.log("📨 Respuesta API - Status:", respuestaAPI.status);

  if (!respuestaAPI.ok) {
    const errorText = await respuestaAPI.text();
    console.log("❌ Error API:", errorText);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || 'Error desconocido' };
    }
    throw new Error(`Error ${respuestaAPI.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await respuestaAPI.json();
  console.log("✅ Éxito API:", data);
  return data;
};

export const obtenerHistorialService = async () => {
  const logPath = path.join(process.cwd(), 'par3.log');
  
  if (!fs.existsSync(logPath)) {
    return { parsedLog: [] };
  }

  const logContent = fs.readFileSync(logPath, 'utf-8');
  const lines = logContent.split('\n').filter(line => line.trim());
  
  const historial = lines.map((line, index) => ({
    id: index,
    contenido: line,
    timestamp: new Date().toISOString()
  }));

  return { 
    parsedLog: historial,
    total: historial.length 
  };
};

export const enviarNotificacionService = async (datos) => {
  const { number, text, logData } = datos;

  if (!number || !text) {
    throw new Error("Número y texto son obligatorios");
  }

  try {
    console.log("🟡 Iniciando envío de notificación...");
    
    // Log de solicitud recibida
    const logEntrySolicitud = `${new Date().toISOString()} [INFO]: [API_LOG] Solicitud recibida. Datos a enviar: ${JSON.stringify(datos)}\n`;
    fs.appendFileSync(path.join(process.cwd(), 'par3.log'), logEntrySolicitud);

    // Enviar a API externa
    const resultado = await enviarAAPIExterna({ number, text });
    
    // Log de respuesta exitosa
    const logEntryRespuesta = `${new Date().toISOString()} [INFO]: [API_LOG] Respuesta de API externa: Status 200\n`;
    fs.appendFileSync(path.join(process.cwd(), 'par3.log'), logEntryRespuesta);

    console.log("✅ Notificación enviada exitosamente");

    return { 
      success: true, 
      message: "Notificación enviada correctamente",
      destino: number,
      data: resultado
    };

  } catch (error) {
    console.log("❌ Error en enviarNotificacionService:", error.message);
    
    // Log de error
    const logEntryError = `${new Date().toISOString()} [ERROR]: [API_LOG] Fallo interno: ${error.message}\n`;
    fs.appendFileSync(path.join(process.cwd(), 'par3.log'), logEntryError);
    
    throw new Error(`Error al enviar notificación: ${error.message}`);
  }
};