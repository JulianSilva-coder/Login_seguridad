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

        // Verificar si el usuario está bloqueado
        if (storedUser.locked_until && storedUser.locked_until > new Date()) {
            const remainingTime = Math.ceil((storedUser.locked_until - new Date()) / 1000 / 60);
            return res.render('login/index', { error: `Usuario bloqueado. Intente nuevamente después de ${remainingTime} minutos` });
        }

        // Verificar si el usuario ha superado el límite de intentos de inicio de sesión.
        if (storedUser.login_attemps >= 3) {
            const lockTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
            await pool.query('UPDATE users SET login_attemps = 0, locked_until = $2 WHERE email = $1', [data.email1, lockTime]);
            return res.render('login/index', { error: 'La contraseña es incorrecta. Usuario bloqueado por 5 minutos' });
        }

        if (hashedPassword === storedUser.password) {
            console.log('Hola');
            // Reiniciar el contador de intentos de inicio de sesión si la autenticación es exitosa.
            await pool.query('UPDATE users SET login_attemps = 0 WHERE email = $1', [data.email1]);
            // Aquí puedes manejar la lógica correspondiente si la autenticación es exitosa.
            return res.redirect("./cifrado");
        } else {
            // Incrementar el contador de intentos de inicio de sesión si la contraseña es incorrecta.
            await pool.query('UPDATE users SET login_attemps = login_attemps + 1 WHERE email = $1', [data.email1]);
            // Obtener el número actual de intentos fallidos.
            const { rows: attemptsRows } = await pool.query(
                'SELECT login_attemps FROM users WHERE email = $1',
                [data.email1]
            );
            const attempts = attemptsRows[0].login_attemps;
            if (attempts >= 3) {
                const lockTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
                await pool.query('UPDATE users SET locked_until = $2 WHERE email = $1', [data.email1, lockTime]);
                return res.render('login/index', { error: 'La contraseña es incorrecta. Usuario bloqueado por 5 minutos' });
            }
            return res.render('login/index', { error: 'Error: La contraseña es incorrecta' });
        }
    });
}

async function register(req, res) {
    res.render('login/register');
}

async function storeUser(req, res) {
    const data = {
        correo: req.body.correo,
        contrasena: req.body.contrasena,
        login_attempts: 0  
    };

    console.log(data);

    const pool = req.pool;

    // Verificar si el usuario ya existe en la base de datos
    pool.query('SELECT * FROM users WHERE email = $1', [data.correo], async (err, result) => {
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
                'INSERT INTO users (email, password, login_attemps) VALUES ($1, $2, $3)',
                [data.correo, data.contrasena, data.login_attempts],
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
