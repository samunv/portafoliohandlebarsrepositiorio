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
  console.log("Conexión exitosa a la base de datos MySQL");
});

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
      title: "Mi Proyecto Express-Handlebars",
      message: "¡Hola, estos son los datos obtenidos!",
      data: results, // Pasar los resultados a la vista Handlebars
    });
  });
});

// Ruta a la pantalla de contacto
app.get("/contacto", (req, res) => {
  res.render("contacto", {
    title: "Contáctanos",
    message: "Esta es la página de contacto",
  });
});

// Ruta a la pantalla de detalles
app.get("/detalle", (req, res) => {
    res.render("detalle", {
      title: "Contáctanos",
      message: "Esta es la página de contacto",
    });
  });


// Ruta a la pantalla de trabajos
app.get("/trabajos", (req, res) => {
    res.render("trabajos", {
      title: "Contáctanos",
      message: "Esta es la página de contacto",
    });
  });
 
const PUERTO = 3100;

// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
