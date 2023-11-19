const express = require('express');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);

// Agregar ruta para servir el HTML 'cifrado'
router.get('/cifrado', (req, res) => {
    res.sendFile('C:\\Users\\Jsilv\\OneDrive\\Escritorio\\Login_seguridad\\src\\views\\login\\cifrado.html');
});

module.exports = router;
