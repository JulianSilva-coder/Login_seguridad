const Recaptcha = require('express-recaptcha').RecaptchaV2;
const crypto = require('crypto');
const recaptcha = new Recaptcha('6LcFfO4oAAAAAFLYZlXtlAXc6buTuyZklVclIzY9', '6LcFfO4oAAAAADxo_DUsJ79MXIFRksxxa2OxBw82');


async function login(req, res) {
    res.render('login/index');
}

async function auth(req, res) {
    const data = {
        email1: req.body.correo1,
        contrasena1: req.body.contrasena1
    };

    console.log(data);

    const pool = req.pool;

    pool.query('SELECT * FROM users WHERE email = $1', [data.email1], async (err, result) => {
        if (err) {
            console.error('Error al buscar usuario en la base de datos', err);
            return res.status(500).send('Error de base de datos');
        }
    
        if (result.rows.length === 0) {
            return res.render('login/index', { error: 'Error: El usuario no existe' });
        }
    
        const storedUser = result.rows[0];
        const hashedPassword = crypto.createHash('sha256').update(data.contrasena1).digest('hex');
        if (hashedPassword === storedUser.password) {
            console.log('Hola');
            // Aquí puedes manejar la lógica correspondiente si la autenticación es exitosa
            return res.send('Autenticación exitosa');
        } else {
            return res.render('login/index', { error: 'Error: La contraseña es incorrecta' });
        }
    });
}


async function register(req, res) {
    res.render('login/register');
}

async function storeUser(req, res) {
    const data = {
        email: req.body.correo,
        contrasena: req.body.contrasena
    };

    console.log(data);

    const pool = req.pool;

    // Verificar si el usuario ya existe en la base de datos
    pool.query('SELECT * FROM users WHERE email = $1', [data.email], async (err, result) => {
        if (err) {
            console.error('Error al buscar usuario en la base de datos', err);
            return res.status(500).send('Error de base de datos');
        }

        if (result.rows.length > 0) {
           res.render('login/register', {error: '¡El usuario ya existe!'});
        }
        try {
            const hashedPassword = crypto.createHash('sha256').update(data.contrasena).digest('hex');
            data.contrasena = hashedPassword;

            pool.query(
                'INSERT INTO users (email, password) VALUES ($1, $2)',
                [data.email, data.contrasena],
                (err, result) => {
                    if (err) {
                        console.error('Error al ejecutar consulta de inserción', err);
                        return res.status(500).send('Error de base de datos');
                    }
                    console.log('Usuario registrado correctamente');
                    res.redirect('/');
                }
            );
        } catch (error) {
            console.error('Error al hashear la contraseña', error);
            return res.status(500).send('Error al procesar la contraseña');
        }
    });
}
module.exports = {
    login,
    register,
    storeUser,
    auth,
};
