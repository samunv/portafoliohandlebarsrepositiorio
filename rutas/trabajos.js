const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Asegúrate de crear un archivo de configuración para la base de datos

// Ruta a la pantalla de trabajos
router.get("/", async (req, res) => {
  try {
    const [trabajos] = await pool.query(`
      SELECT 
        t.*,
        GROUP_CONCAT(te.nombreTecnologia ORDER BY te.nombreTecnologia) AS tecnologias
      FROM trabajosenequipo t
      LEFT JOIN trabajo_tecnologias tt ON t.idTrabajo = tt.idTrabajo
      LEFT JOIN tecnologias te ON tt.idTecnologia = te.idTecnologia
      GROUP BY t.idTrabajo;
    `);
    res.render("trabajos", { trabajos });
  } catch (error) {
    console.error("Error obteniendo los trabajos:", error.message);
    res.status(500).send("Error al obtener trabajos del servidor");
  }
});

module.exports = router;
