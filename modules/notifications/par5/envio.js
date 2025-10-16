const axios = require("axios");
const fs = require("fs");

// CONFIGURACIÓN DE EASY PANEL
const API_URL = "https://n8n-evolution-api.oumu0g.easypanel.host/message/sendText/pruebas";
const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";
const AUTH_TOKEN = "B1719736AF1B-4E77-83D0-DC78E7D578A8";

function asegurarCarpetaLogs() {
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
    console.log(" Carpeta 'logs' creada.");
  }
}

function registrarLog(solicitud, resultado) {
  const fechaHora = new Date().toLocaleString("es-BO");
  const log = `${fechaHora} | ID Solicitud: ${solicitud.nSolicitud} | Requester: ${solicitud.nombreRequester} (${solicitud.numero}) | Estado: ${solicitud.estado} | Resultado: ${resultado}\n`;
  fs.appendFileSync("logs/logs.log", log, "utf8");
  console.log(" Log registrado:", log.trim());
}

function generarMensaje(solicitud) {
  const fechaHora = new Date().toLocaleString("es-BO");
  if (solicitud.estado === "aceptada") {
    return `Nueva actualización sobre tu solicitud ✔
¡Tu solicitud ha sido aceptada!
Número de solicitud: ${solicitud.nSolicitud}
Servicio: ${solicitud.servicio}
Fecha y hora de aceptación: ${fechaHora}
El Fixer ${solicitud.nombreFixer} ya está listo para ayudarte.
Puedes contactarlo desde la solicitud: ${solicitud.urlSolicitud || ""}`;
  } else if (solicitud.estado === "rechazada") {
    return `Actualización sobre tu solicitud ❌
Tu solicitud no pudo ser aceptada.
Número de solicitud: ${solicitud.nSolicitud}
Motivo: ${solicitud.motivo || "No especificado"}
Puedes explorar otros fixes aquí: ${solicitud.urlSolicitud || ""}`;
  } else {
    return "Estado desconocido";
  }
}

async function enviarMensaje(solicitud) {
  const numeroCompleto = solicitud.numero.startsWith("591") ? solicitud.numero : "591" + solicitud.numero;
  const mensaje = generarMensaje(solicitud);
  const jsonBody = { number: numeroCompleto, text: mensaje };

  try {
    await axios.post(API_URL, jsonBody, {
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Authorization": `Bearer ${AUTH_TOKEN}`
      }
    });
    console.log(`✅ Mensaje enviado a ${numeroCompleto}`);
    registrarLog(solicitud, "Mensaje enviado correctamente");
  } catch (err) {
    console.error(`❌ Error al enviar mensaje a ${numeroCompleto}:`, err.message);
    registrarLog(solicitud, "Error al enviar: " + err.message);
  }
}

// Exportar funciones
module.exports = { asegurarCarpetaLogs, enviarMensaje };
