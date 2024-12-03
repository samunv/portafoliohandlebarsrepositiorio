const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");

const app = express();

// Importar las rutas
const miembrosRoutes = require("./rutas/miembros");
const trabajosRoutes = require("./rutas/trabajos");

// Configuración de la carpeta estática y vistas
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Usar las rutas importadas
app.use("/", miembrosRoutes);  // Las rutas relacionadas con los miembros
app.use("/trabajos", trabajosRoutes);  // Las rutas relacionadas con los trabajos

// Ruta para política
app.get("/politica", (req, res) => {
  res.render("politica");
});

// Iniciar el servidor
const PUERTO = 3100;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
