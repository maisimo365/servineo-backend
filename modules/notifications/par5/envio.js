const axios = require("axios");
const fs = require("fs");
const path = require("path");

// CONFIGURACIÓN DE EASY PANEL
const API_URL = "https://n8n-evolution-api.oumu0g.easypanel.host/message/sendText/pruebas";
const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";
const AUTH_TOKEN = "B1719736AF1B-4E77-83D0-DC78E7D578A8";

function asegurarCarpetaLogs() {
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log("📁 Carpeta 'logs' creada.");
  }
}

function registrarLog(solicitud, resultado) {
  const fechaHora = new Date().toLocaleString("es-BO");
  const logEntry = `${fechaHora} | Cliente: ${solicitud.client || solicitud.nombreRequester || 'N/A'} | Número: ${solicitud.number || solicitud.numero} | Estado: ${solicitud.estado} | Resultado: ${resultado}\n`;
  
  const logPath = path.join(__dirname, "logs", "log.txt");
  fs.appendFileSync(logPath, logEntry, "utf8");
  console.log("📝 Log registrado:", logEntry.trim());
}

function generarMensaje(solicitud) {
  const fechaHora = new Date().toLocaleString("es-BO");
  
  // Si el mensaje ya viene generado desde el frontend (PAR5), usarlo directamente
  if (solicitud.text) {
    return solicitud.text;
  }
  
  // Si no, generar el mensaje como antes (para compatibilidad con otros sistemas)
  if (solicitud.estado === "aceptada") {
    return `Nueva actualización sobre tu solicitud ✔
¡Tu solicitud ha sido aceptada!
Número de solicitud: ${solicitud.nSolicitud || solicitud.logData?.solicitudId || 'N/A'}
Servicio: ${solicitud.servicio || solicitud.logData?.servicio || 'N/A'}
Fecha y hora de aceptación: ${fechaHora}
El Fixer ${solicitud.nombreFixer || solicitud.logData?.fixer || 'N/A'} ya está listo para ayudarte.
Puedes contactarlo desde la solicitud: ${solicitud.urlSolicitud || solicitud.logData?.urlSolicitud || ''}`;
  } else if (solicitud.estado === "rechazada") {
    return `Actualización sobre tu solicitud ❌
Tu solicitud no pudo ser aceptada.
Número de solicitud: ${solicitud.nSolicitud || solicitud.logData?.solicitudId || 'N/A'}
Motivo: ${solicitud.motivo || solicitud.logData?.motivo || "No especificado"}
Puedes explorar otros fixes aquí: ${solicitud.urlSolicitud || solicitud.logData?.urlSolicitud || ""}`;
  } else {
    return "Estado desconocido";
  }
}

async function enviarMensaje(solicitud) {
  try {
    console.log("📩 Procesando solicitud:", JSON.stringify(solicitud, null, 2));
    
    // Validar campos obligatorios
    if (!solicitud.number && !solicitud.numero) {
      throw new Error("Número de teléfono no proporcionado");
    }
    
    if (!solicitud.text && !solicitud.servicio) {
      throw new Error("Contenido del mensaje no proporcionado");
    }

    // Formatear número de teléfono
    let numeroCompleto = solicitud.number || solicitud.numero;
    
    // Limpiar el número (remover espacios, guiones, etc.)
    numeroCompleto = numeroCompleto.toString().replace(/\D/g, '');
    
    // Asegurar que tenga código de país
    if (!numeroCompleto.startsWith('591')) {
      numeroCompleto = '591' + numeroCompleto;
    }
    
    console.log(`📱 Número formateado: ${numeroCompleto}`);

    // Generar o usar el mensaje
    const mensaje = generarMensaje(solicitud);
    console.log(`💬 Mensaje a enviar: ${mensaje}`);

    const jsonBody = { 
      number: numeroCompleto, 
      text: mensaje 
    };

    console.log("🔄 Enviando a EasyPanel...");
    
    // Enviar mensaje a EasyPanel
    const response = await axios.post(API_URL, jsonBody, {
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Authorization": `Bearer ${AUTH_TOKEN}`
      },
      timeout: 10000 // 10 segundos timeout
    });

    console.log(`✅ Mensaje enviado a ${numeroCompleto}`);
    console.log("📨 Respuesta de EasyPanel:", response.data);
    
    // Registrar en log
    registrarLog(solicitud, "Mensaje enviado correctamente");
    
    return response.data;

  } catch (err) {
    console.error(`❌ Error al enviar mensaje:`, err.message);
    
    // Registrar error en log
    const errorSolicitud = {
      ...solicitud,
      client: solicitud.client || solicitud.nombreRequester || 'N/A',
      number: solicitud.number || solicitud.numero || 'N/A',
      estado: solicitud.estado || solicitud.logData?.estado || 'desconocido'
    };
    
    registrarLog(errorSolicitud, "Error al enviar: " + err.message);
    throw err;
  }
}

// Exportar funciones
module.exports = { asegurarCarpetaLogs, enviarMensaje };
