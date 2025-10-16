const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { asegurarCarpetaLogs, enviarMensaje } = require("./envio.js"); // ajusta la ruta

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

// Crear carpeta logs si no existe
asegurarCarpetaLogs();

// Endpoint para recibir solicitudes del frontend       
app.post("/api/enviar", async (req, res) => {
  try {
    const solicitud = req.body;
    console.log("📩 Solicitud recibida:", solicitud);   

    await enviarMensaje(solicitud);

    res.json({
      success: true,
      mensaje: "✅ Mensaje procesado y enviado correctamente",
    });
  } catch (error) {
    console.error("❌ Error en /api/enviar:", error.message);
    res.status(500).json({
      success: false,
      mensaje: "❌ Error al procesar la solicitud: " + error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Servidor backend corriendo en http://localhost:${PORT}');
});