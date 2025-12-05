// ===============================
// IMPORTS
// ===============================
const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const path = require('path');
const jwt = require('jsonwebtoken');

// ===============================
// CONFIGURACIÓN
// ===============================
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'clave_secreta_tienda_2025';

// ===============================
// CONEXIÓN A LA BASE DE DATOS
// ===============================
const pool = mariadb.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'karina21',
  database: 'tienda',
  connectionLimit: 5
});

// ===============================
// MIDDLEWARE: VALIDAR TOKEN
// ===============================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    req.user = user;
    next();
  });
};

// ===============================
// MIDDLEWARE: SOLO ADMIN
// ===============================
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol de administrador' });
  }
  next();
};

// ===============================
// LOGIN (TEXTO PLANO)
// ===============================
app.post('/login', async (req, res) => {
  let conn;

  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    conn = await pool.getConnection();

    const query = `
      SELECT id, direccion, nombre, correo, password, rol 
      FROM usuarios 
      WHERE correo = ?
    `;

    const users = await conn.query(query, [correo]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Comparación directa (texto plano)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        direccion: user.direccion
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        direccion: user.direccion
      }
    });

  } catch (err) {
    console.log('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// ===============================
// PRODUCTOS
// ===============================

// Obtener productos (público)
app.get('/productos', async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM productos");
    res.json(rows);

  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Error al obtener productos' });

  } finally {
    if (conn) conn.release();
  }
});

// Crear producto (solo admin)
app.post('/productos', authenticateToken, requireAdmin, async (req, res) => {
  let conn;

  try {
    const { nombre, precio, categoria, imagen_url } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO productos (nombre, precio, categoria, imagen_url) VALUES (?, ?, ?, ?)",
      [nombre, precio, categoria, imagen_url]
    );

    res.json({ success: true, id: result.insertId });

  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Error al crear producto' });

  } finally {
    if (conn) conn.release();
  }
});

// ===============================
// USUARIOS (SOLO ADMIN)
// ===============================

// Obtener todos los usuarios
app.get('/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, direccion, nombre, correo, rol FROM usuarios");
    res.json(rows);

  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });

  } finally {
    if (conn) conn.release();
  }
});

// Crear usuario SIN bcrypt (contraseña texto plano)
app.post('/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  let conn;

  try {
    const { direccion, nombre, correo, password, rol } = req.body;

    if (!direccion || !nombre || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    conn = await pool.getConnection();

    const existing = await conn.query("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    const result = await conn.query(
      "INSERT INTO usuarios (direccion, nombre, correo, password, rol) VALUES (?, ?, ?, ?, ?)",
      [direccion, nombre, correo, password, rol]
    );

    res.json({ success: true, message: 'Usuario creado', userId: result.insertId });

  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Error al crear usuario' });

  } finally {
    if (conn) conn.release();
  }
});

// ===============================
// INICIAR SERVIDOR
// ===============================
app.listen(3001, '0.0.0.0', () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
