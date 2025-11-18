const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'clave_secreta_tienda_2025';

const pool = mariadb.createPool({
  host: '127.0.0.1', 
  user: 'root',
  password: 'karina21',
  database: 'tienda', 
  connectionLimit: 5
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para administrador
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol de administrador' });
  }
  next();
};

// =============================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// =============================================

// Login de usuario - RUTA PÚBLICA
app.post('/login', async (req, res) => {
  let conn;
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    conn = await pool.getConnection();
    
    const query = `SELECT id, direccion, nombre, correo, password_hash, rol FROM usuarios WHERE correo = ?`;
    const users = await conn.query(query, [correo]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    
    let passwordMatch = false;
    
    if (user.password_hash) {
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
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
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    if (conn) conn.release();
  }
});

// =============================================
// RUTAS DE PRODUCTOS (CON AUTENTICACIÓN)
// =============================================

// Obtener productos - ACCESO PÚBLICO (para la tienda)
app.get('/productos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM productos");
    res.json(rows);
  } catch (err) {
    console.log('Error de conexión o consulta:', err);
    res.status(500).json({ error: "Error al consultar productos" });
  } finally {
    if (conn) conn.release();
  }
});

// Crear producto - SOLO ADMIN
app.post('/productos', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { nombre, precio, categoria, imagen_url } = req.body;
    
    console.log('=== DEBUG POST /productos ===');
    console.log('Datos recibidos:', { nombre, precio, categoria, imagen_url });
    console.log('Usuario que hace la petición:', req.user);

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ error: 'La categoría es requerida' });
    }

    conn = await pool.getConnection();
    console.log('Conexión a BD establecida');

    const result = await conn.query(
      "INSERT INTO productos (nombre, precio, categoria, imagen_url) VALUES (?, ?, ?, ?)",
      [nombre.trim(), parseFloat(precio), categoria.trim(), imagen_url || null]
    );
    
    console.log('Producto insertado con ID:', result.insertId);
    
    // CONVERTIR BigInt a String para evitar error de serialización
    res.json({ 
      success: true, 
      id: Number(result.insertId), // ← ESTA ES LA SOLUCIÓN
      message: 'Producto agregado correctamente'
    });
    
  } catch (err) {
    console.log('=== ERROR DETALLADO ===');
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
    console.log('Error stack:', err.stack);
    
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  } finally {
    if (conn) conn.release();
    console.log('Conexión liberada');
  }
});

// Actualizar producto - SOLO ADMIN
// En PUT /productos/:id
app.put('/productos/:id', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { nombre, precio, categoria, imagen_url } = req.body;
    
    console.log('Datos recibidos en PUT /productos:', { id, nombre, precio, categoria, imagen_url });
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ error: 'La categoría es requerida' });
    }

    conn = await pool.getConnection();
    
    const result = await conn.query(
      "UPDATE productos SET nombre = ?, precio = ?, categoria = ?, imagen_url = ? WHERE id = ?",
      [nombre.trim(), parseFloat(precio), categoria.trim(), imagen_url || null, id]
    );
    
    console.log('Producto actualizado, filas afectadas:', Number(result.affectedRows));
    
    res.json({ 
      success: true,
      message: 'Producto actualizado correctamente'
    });
    
  } catch (err) {
    console.log('Error al actualizar producto:', err);
    res.status(500).json({ error: "Error al actualizar producto" });
  } finally {
    if (conn) conn.release();
  }
});

// En DELETE /productos/:id
app.delete('/productos/:id', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    
    console.log('Eliminando producto ID:', id);
    
    conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM productos WHERE id = ?", [id]);
    
    console.log('Producto eliminado, filas afectadas:', Number(result.affectedRows));
    
    res.json({ 
      success: true,
      message: 'Producto eliminado correctamente'
    });
    
  } catch (err) {
    console.log('Error al eliminar producto:', err);
    res.status(500).json({ error: "Error al eliminar producto" });
  } finally {
    if (conn) conn.release();
  }
});

// =============================================
// RUTAS DE USUARIOS (SOLO ADMIN)
// =============================================

// Obtener todos los usuarios - SOLO ADMIN
app.get('/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      `SELECT id, direccion, nombre, correo, rol 
       FROM usuarios`
    );
    res.json(rows);
  } catch (err) {
    console.log('Error al obtener usuarios:', err);
    res.status(500).json({ error: "Error al consultar usuarios" });
  } finally {
    if (conn) conn.release();
  }
});

// Crear nuevo usuario - SOLO ADMIN
app.post('/usuarios', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { direccion, nombre, correo, password, rol } = req.body;
    
    if (!direccion || !nombre || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    conn = await pool.getConnection();
    
    // Verificar si el correo ya existe
    const existingUser = await conn.query(
      "SELECT id FROM usuarios WHERE correo = ?",
      [correo]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Cifrar contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario
    const result = await conn.query(
      "INSERT INTO usuarios (direccion, nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?, ?)",
      [direccion, nombre, correo, password_hash, rol]
    );

    res.json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      userId: result.insertId 
    });
  } catch (err) {
    console.log('Error al crear usuario:', err);
    res.status(500).json({ error: "Error al crear usuario" });
  } finally {
    if (conn) conn.release();
  }
});

// Actualizar usuario - SOLO ADMIN
app.put('/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const { direccion, nombre, correo, rol } = req.body;
    
    if (!direccion || !nombre || !correo || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    conn = await pool.getConnection();
    await conn.query(
      "UPDATE usuarios SET direccion = ?, nombre = ?, correo = ?, rol = ? WHERE id = ?",
      [direccion, nombre, correo, rol, id]
    );
    
    res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) {
    console.log('Error al actualizar usuario:', err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  } finally {
    if (conn) conn.release();
  }
});

// Eliminar usuario - SOLO ADMIN
app.delete('/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    conn = await pool.getConnection();
    await conn.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    console.log('Error al eliminar usuario:', err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  } finally {
    if (conn) conn.release();
  }
});

// =============================================
// RUTAS DE DEBUG
// =============================================

app.get('/test', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("SELECT 1 as test");
    res.json({ success: true, message: 'Conexión a la base de datos exitosa', data: result });
  } catch (err) {
    console.log('Error de conexión a la base de datos:', err);
    res.status(500).json({ error: "Error de conexión a la base de datos" });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/debug-productos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Verificar si la tabla existe
    const tables = await conn.query("SHOW TABLES LIKE 'productos'");
    
    // Verificar estructura de la tabla
    const structure = await conn.query("DESCRIBE productos");
    
    // Contar productos
    const count = await conn.query("SELECT COUNT(*) as total FROM productos");
    
    // Obtener algunos productos de ejemplo
    const productos = await conn.query("SELECT * FROM productos LIMIT 5");
    
    res.json({
      tablaExiste: tables.length > 0,
      estructura: structure,
      totalProductos: count[0].total,
      productosEjemplo: productos
    });
    
  } catch (err) {
    console.log('Error en debug:', err);
    res.status(500).json({ error: "Error de conexión a la base de datos: " + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Ruta de búsqueda con AJAX
app.get('/productos/buscar', async (req, res) => {
  let conn;
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM productos WHERE nombre LIKE ? OR categoria LIKE ?",
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.log('Error en búsqueda:', err);
    res.status(500).json({ error: "Error en búsqueda" });
  } finally {
    if (conn) conn.release();
  }
});
app.listen(3001, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://0.0.0.0:3001');
  console.log('Accesible desde otras dispositivos en la red');
  console.log('Ruta de prueba: http://localhost:3001/test');
  console.log('Ruta de debug productos: http://localhost:3001/debug-productos');
});