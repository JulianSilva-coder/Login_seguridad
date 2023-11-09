const https = require('https');
const fs = require('fs');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const loginRoutes = require('./routes/login');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
  passphrase: 'julian'
};

const app = express();
app.set('port', 443);

app.set('views', __dirname + '/views');
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

https.createServer(options, app).listen(app.get('port'), () => {
  console.log('Listening on port ', app.get('port'));
});

app.use('/', loginRoutes);

app.get('/', (req, res) => {
  res.render('home');
});