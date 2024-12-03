const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Asegúrate de crear un archivo de configuración para la base de datos

// Ruta principal
router.get("/", async (req, res) => {
  try {
    const [miembros] = await pool.query("SELECT * FROM miembros");
    res.render("home", {
      title: "Equipo Jorge-Samuel",
      data: miembros,
    });
  } catch (error) {
    console.error("Error obteniendo los datos:", error.message);
    res.status(500).send("Error al obtener datos de la base de datos");
  }
});

// Ruta detalle
router.get("/detalle/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta del miembro
    const [miembro] = await pool.query(
      "SELECT * FROM miembros WHERE idMiembro = ?",
      [id]
    );
    if (miembro.length === 0) {
      return res.status(404).send("Miembro no encontrado");
    }

    // Consultas de proyectos, idiomas y tecnologías
    const [proyectos] = await pool.query(
      "SELECT * FROM proyectospersonales WHERE idMiembro = ?",
      [id]
    );
    const [idiomas] = await pool.query(
      `SELECT i.nombreIdioma FROM miembro_idiomas mi JOIN idiomas i ON mi.idIdioma = i.idIdioma WHERE mi.idMiembro = ?`,
      [id]
    );
    const [tecnologias] = await pool.query(
      `SELECT t.* FROM miembro_tecnologias mt JOIN tecnologias t ON mt.idTecnologia = t.idTecnologia WHERE mt.idMiembro = ?`,
      [id]
    );

    // Renderizar la vista con los datos obtenidos
    res.render("detalle", {
      title: "Detalles del Miembro",
      miembro: miembro[0],
      proyectos: proyectos,
      idiomas: idiomas,
      tecnologias: tecnologias,
    });
  } catch (error) {
    console.error("Error obteniendo los datos del miembro:", error.message);
    res.status(500).send("Error al obtener los datos del miembro");
  }
});

module.exports = router;
