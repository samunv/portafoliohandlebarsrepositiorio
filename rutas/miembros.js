const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Asegúrate de crear un archivo de configuración para la base de datos

// Ruta principal
router.get("/", async (req, res) => {
  try {
    const [miembros] = await obtenerMiembros();
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
    // Consulta del miembro y del resto de detalles mediante id.
    const [miembro] = await obtenerMiembroPorId(id);
    const [proyectos] = await obtenerProyectosPorMiembro(id);
    const [idiomas] = await obtenerIdiomasPorMiembro(id);
    const [tecnologias] = await obtenerTecnologiasPorMiembro(id);
    const [titulaciones] = await obtenerTitulacionesPorMiembro(id);
    
    // Renderizar la vista con los datos obtenidos
    res.render("detalle", {
      title: "Detalles del Miembro",
      miembro: miembro[0],
      proyectos: proyectos,
      idiomas: idiomas,
      tecnologias: tecnologias,
      titulaciones: titulaciones, // Agregar las titulaciones a los datos enviados a la vista
    });
  } catch (error) {
    console.error("Error obteniendo los datos del miembro:", error.message);
    res.status(500).send("Error al obtener los datos del miembro");
  }
});

async function obtenerMiembros() {
  const [miembros] = await pool.query("SELECT * FROM miembros");
  return [miembros];
}

async function obtenerMiembroPorId(id) {
  // Consulta del miembro
  const [miembro] = await pool.query(
    "SELECT * FROM miembros WHERE idMiembro = ?",
    [id]
  );
  if (miembro.length === 0) {
    return res.status(404).send("Miembro no encontrado");
  }

  return [miembro];
}

async function obtenerProyectosPorMiembro(id) {
  const [proyectos] = await pool.query(
    "SELECT * FROM proyectospersonales WHERE idMiembro = ?",
    [id]
  );
  return [proyectos];
}

async function obtenerIdiomasPorMiembro(id) {
  const [idiomas] = await pool.query(
    `SELECT i.nombreIdioma 
     FROM miembro_idiomas mi 
     JOIN idiomas i ON mi.idIdioma = i.idIdioma 
     WHERE mi.idMiembro = ?`,
    [id]
  );
  return [idiomas];
}

async function obtenerTecnologiasPorMiembro(id) {
  const [tecnologias] = await pool.query(
    `SELECT t.* 
     FROM miembro_tecnologias mt 
     JOIN tecnologias t ON mt.idTecnologia = t.idTecnologia 
     WHERE mt.idMiembro = ?`,
    [id]
  );
  return [tecnologias];
}

async function obtenerTitulacionesPorMiembro(id) {
  const [titulaciones] = await pool.query(
    `SELECT t.nombre AS nombreTitulacion 
    FROM miembro_titulaciones mt JOIN titulaciones t ON mt.idTitulacion = t.idTitulacion 
    WHERE mt.idMiembro = 1;`,
    [id]
  );
  return [titulaciones];
}

module.exports = router;
