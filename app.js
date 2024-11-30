const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");

const app = express();

const mysql = require("mysql2");

// Configura la conexión
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bdportafolio",
});

// Probar la conexión
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
    return;
  }
  console.log("Conexión exitosa a la base de datos.");
});

// Establecer la carpeta public
app.use(express.static(path.join(__dirname, "public")));
// Establecer la carpeta de vistas (views)
app.set("views", path.join(__dirname, "views"));

// Configurar express-handlebars como motor de plantillas
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Ruta principal
app.get("/", (req, res) => {
  const selectMiembros = "SELECT * FROM miembros";

  connection.query(selectMiembros, (err, results) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err.message);
      res.status(500).send("Error al obtener datos de la base de datos");
      return;
    }

    console.log("Resultados de la consulta:", results); // Muestra los datos en la consola

    res.render("home", {
      title: "Equipo Jorge-Samuel",
      data: results, // Pasar los resultados a la vista Handlebars
    });
  });
});

app.get("/detalle/:id", (req, res) => {
  const { id } = req.params;

  const selectMiembro = `
    SELECT m.*, 
           GROUP_CONCAT(DISTINCT i.nombre ORDER BY i.nombre) AS idiomas, 
           GROUP_CONCAT(DISTINCT t.nombre ORDER BY t.nombre) AS tecnologias,
           p.*  
    FROM miembros m
    LEFT JOIN miembro_idiomas mi ON m.idMiembro = mi.idMiembro
    LEFT JOIN idiomas i ON mi.idIdioma = i.idIdioma
    LEFT JOIN miembro_tecnologias mt ON m.idMiembro = mt.idMiembro
    LEFT JOIN tecnologias t ON mt.idTecnologia = t.idTecnologia
    LEFT JOIN proyectospersonales p ON m.idMiembro = p.idMiembro
    WHERE m.idMiembro = ?
    GROUP BY m.idMiembro;
  `;

  connection.query(selectMiembro, [id], (err, result) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err.message);
      res.status(500).send("Error al obtener datos del miembro");
      return;
    }

    if (result.length === 0) {
      res.status(404).send("Miembro no encontrado");
      return;
    }

    const miembro = result[0]; // El miembro seleccionado

    // Separamos los proyectos para pasarlos de forma adecuada
    const proyectos = result.map((row) => {
      return {
        idProyecto: row.idProyecto,
        nombre: row.nombre,  // Asegúrate de que estos son los campos correctos
        descripcion: row.descripcion,  // Dependiendo de lo que tenga tu tabla
        fecha: row.fecha,  // Otros campos que puedas tener
      };
    }).filter((row) => row.idProyecto);  // Filtra para evitar proyectos vacíos si los hay

    res.render("detalle", {
      title: `Detalles de ${miembro.nombre} ${miembro.apellidos}`,
      miembro,
      proyectos,  // Pasa los proyectos a la vista
    });
  });
});

// Ruta a la pantalla de trabajos
app.get("/trabajos", (req, res) => {
  res.render("trabajos", {});
});

const PUERTO = 3100;

// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
