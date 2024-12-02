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
  console.log(`ID recibido: ${id}`); // Verifica el ID recibido

  // Consulta SQL para obtener los datos del miembro
  const selectMiembro = `SELECT * FROM miembros WHERE idMiembro = ?`;

  connection.query(selectMiembro, [id], (err, results) => {
    if (err) {
      console.error("Error ejecutando la consulta:", err.message);
      res.status(500).send("Error al obtener datos del miembro");
      return;
    }

    if (results.length === 0) {
      console.log("No se encontró el miembro con ID:", id);
      res.status(404).send("Miembro no encontrado");
      return;
    }

    console.log("Resultados de la consulta del miembro:", results[0]);

    // Consulta SQL para obtener los proyectos personales del miembro
    const selectProyectos = `SELECT * FROM proyectospersonales WHERE idMiembro = ?`;

    connection.query(selectProyectos, [id], (err, proyectos) => {
      if (err) {
        console.error("Error ejecutando la consulta de proyectos:", err.message);
        res.status(500).send("Error al obtener proyectos del miembro");
        return;
      }

      console.log("Proyectos del miembro:", proyectos); // Verifica el contenido de los proyectos
    
      // Consulta SQL para obtener los idiomas del miembro
      const selectIdiomas = `
        SELECT i.nombreIdioma
        FROM miembro_idiomas mi
        JOIN idiomas i ON mi.idIdioma = i.idIdioma
        WHERE mi.idMiembro = ?
      `;

      connection.query(selectIdiomas, [id], (err, idiomas) => {
        if (err) {
          console.error("Error ejecutando la consulta de idiomas:", err.message);
          res.status(500).send("Error al obtener idiomas del miembro");
          return;
        }

        console.log("Idiomas del miembro:", idiomas);

        // Consulta SQL para obtener las tecnologías del miembro
        const selectTecnologias = `
          SELECT t.*
          FROM miembro_tecnologias mt
          JOIN tecnologias t ON mt.idTecnologia = t.idTecnologia
          WHERE mt.idMiembro = ?
        `;

        connection.query(selectTecnologias, [id], (err, tecnologias) => {
          if (err) {
            console.error("Error ejecutando la consulta de tecnologías:", err.message);
            res.status(500).send("Error al obtener tecnologías del miembro");
            return;
          }

          console.log("Tecnologías del miembro:", tecnologias);

          // Pasar los resultados del miembro, proyectos, idiomas y tecnologías a la vista Handlebars
          res.render("detalle", {
            title: "Detalles del Miembro",
            miembro: results[0],
            proyectos: proyectos,
            idiomas: idiomas,
            tecnologias: tecnologias // Pasar las tecnologías obtenidas
          });
        });
      });
    });
  });
});

// Ruta a la pantalla de trabajos
app.get("/trabajos", (req, res) => {
   // Consulta para obtener los trabajos
   const queryTrabajos = `
  SELECT 
    t.idTrabajo, 
    t.titulo, 
    t.empresa, 
    t.descripcion, 
    t.foto,
    GROUP_CONCAT(te.nombreTecnologia ORDER BY te.nombreTecnologia) AS tecnologias
FROM trabajosenequipo t
LEFT JOIN trabajo_tecnologias tt ON t.idTrabajo = tt.idTrabajo
LEFT JOIN tecnologias te ON tt.idTecnologia = te.idTecnologia
GROUP BY t.idTrabajo;

 `;

 connection.query(queryTrabajos, (err, resultados) => {
   if (err) {
     console.error("Error al obtener los trabajos:", err);
     res.status(500).send("Error en el servidor");
   } else {
     res.render("trabajos", { trabajos: resultados });
   }
 });
});


const PUERTO = 3100;

// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
