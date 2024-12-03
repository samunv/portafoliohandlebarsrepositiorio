const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();

// Configuración de la conexión a la base de datos usando mysql2 con promesas
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "bdportafolio",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Configuración de la carpeta estática y vistas
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Ruta principal
app.get("/", async (req, res) => {
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
app.get("/detalle/:id", async (req, res) => {
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
      `
      SELECT i.nombreIdioma
      FROM miembro_idiomas mi
      JOIN idiomas i ON mi.idIdioma = i.idIdioma
      WHERE mi.idMiembro = ?
    `,
      [id]
    );
    const [tecnologias] = await pool.query(
      `
      SELECT t.*
      FROM miembro_tecnologias mt
      JOIN tecnologias t ON mt.idTecnologia = t.idTecnologia
      WHERE mt.idMiembro = ?
    `,
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

// Ruta a la pantalla de trabajos
app.get("/trabajos", async (req, res) => {
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

// Ruta para política
app.get("/politica", (req, res) => {
  res.render("politica");
});

// Iniciar el servidor
const PUERTO = 3100;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
