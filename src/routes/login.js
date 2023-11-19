const express = require('express');
const LoginController = require('../controllers/LoginController');
const path = require('path');

const router = express.Router();

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);

// Agregar ruta para servir el HTML 'cifrado'
router.get('/cifrado', (req, res) => {
    const filePath = path.join(__dirname, '../views/login/cifrado.html');
    res.sendFile(filePath);
});

module.exports = router;