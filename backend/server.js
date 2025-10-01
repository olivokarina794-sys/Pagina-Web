const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
  host: '127.0.0.1', // 'localhost' si es local
  user: 'root',
  password: 'karina21',
  database: 'tienda',  // SIN espacios
  connectionLimit: 5
});

// Ruta para obtener productos
app.get('/productos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM productos");
    res.json(rows); // JSON válido
  } catch (err) {
    console.log('Error de conexión o consulta:', err);
    res.status(500).json({ error: "Error al consultar productos" });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://0.0.0.0:3001');
  console.log('Accesible desde otras dispositivos en la red');
});