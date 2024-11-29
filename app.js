const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

// Establecer la carpeta de vistas (views)
app.set('views', path.join(__dirname, 'views'));

// Configurar express-handlebars como motor de plantillas
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Ruta principal
app.get('/', (req, res) => {
    res.render('home', { title: 'Mi Proyecto Express-Handlebars', message: '¡Hola, Express y Handlebars!' });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});

