const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { asegurarCarpetaLogs, enviarMensaje } = require("./envio.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Crear carpeta logs si no existe
asegurarCarpetaLogs();

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Backend ServiNeo PAR5 funcionando",
    rutas: {
      par5: {
        enviar: "POST /api/par5/enviar"
      }
    }
  });
});

// Endpoint específico para PAR5
app.post("/api/par5/enviar", async (req, res) => {
  try {
    const solicitud = req.body;
    console.log("📩 Solicitud PAR5 recibida:", solicitud);   

    await enviarMensaje(solicitud);

    res.json({
      success: true,
      mensaje: "✅ Mensaje PAR5 procesado y enviado correctamente",
    });
  } catch (error) {
    console.error("❌ Error en /api/par5/enviar:", error.message);
    res.status(500).json({
      success: false,
      mensaje: "❌ Error al procesar la solicitud PAR5: " + error.message,
    });
  }
});

// Endpoint general para compatibilidad
app.post("/api/enviar", async (req, res) => {
  try {
    const solicitud = req.body;
    console.log("📩 Solicitud general recibida:", solicitud);   

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

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    mensaje: `❌ Ruta no encontrada: ${req.method} ${req.path}`,
    rutasDisponibles: {
      "GET /": "Información del API",
      "POST /api/par5/enviar": "Enviar mensaje desde PAR5",
      "POST /api/enviar": "Enviar mensaje general"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend PAR5 corriendo en puerto ${PORT}`);
});
