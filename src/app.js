const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const loginRoutes = require('./routes/login');

// Configuración de las opciones para HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
  passphrase: 'julian'
};

// Middleware de redirección de HTTP a HTTPS
const redirectHttp = (req, res, next) => {
  if (req.protocol === 'http') {
    res.redirect('https://' + req.headers.host + req.url);
  } else {
    next();
  }
};

// Configuración de Express
app.set('port', 443);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'monorail.proxy.rlwy.net',
  database: 'railway',
  password: '-g2cG5d64c524c*dd6fAB1A*a25F63ac',
  port: 52508,
});

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Redirigir las solicitudes de HTTP al servidor HTTPS
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
});

httpServer.listen(80, () => {
  console.log('HTTP server is listening on port 80');
});

// Rutas
app.use(redirectHttp);
app.use('/', loginRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

// Crear el servidor HTTPS
https.createServer(options, app).listen(app.get('port'), () => {
  console.log('Listening on port ', app.get('port'));
});
