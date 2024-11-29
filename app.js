const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

const mysql = require('mysql2');

// Configura la conexión
const connection = mysql.createConnection({
    host: 'localhost',     // Dirección del servidor MySQL (local en este caso)
    user: 'root',    // Usuario de la base de datos
    password: '', // Contraseña del usuario
    database: 'bdportafolio' // Nombre de la base de datos
});

// Probar la conexión
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});


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

