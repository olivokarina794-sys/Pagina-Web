import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// MODIFICACIÓN 1: Importar el componente Inventario
import Inventario from './Vistas/Inventario';

// Tu componente principal - ahora dentro de index.js
function Index() {
  // Estado para productos que vendrán del backend
  const [productos, setProductos] = useState([]);
  // MODIFICACIÓN 2: Estado para controlar qué vista mostrar (tienda o inventario)
  const [mostrarInventario, setMostrarInventario] = useState(false);

  // Categorías de ejemplo
  const categorias = ["Hombre", "Mujer", "Niño", "Running", "Básquetbol", "Fútbol"];

  // Llamada al backend para obtener productos
  useEffect(() => {
    fetch("http://localhost:3001/productos") 
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.log("Error al cargar productos:", err));
  }, []);

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">tiendatenis</div>
        <nav>
          <a href="#hombre">Hombre</a>
          <a href="#mujer">Mujer</a>
          <a href="#niño">Niño</a>
          <a href="#promociones">Promociones</a>
        </nav>
        <div className="actions">
          <button>Cuenta</button>
          <button>Carrito</button>
          {/* MODIFICACIÓN 3: Botón para cambiar entre tienda e inventario */}
          <button onClick={() => setMostrarInventario(!mostrarInventario)}>
            {mostrarInventario ? 'Volver a Tienda' : 'Inventario'}
          </button>
        </div>
      </header>

      {/* MODIFICACIÓN 4: Mostrar Inventario o Tienda según el estado - CORREGIDO */}
      {mostrarInventario ? (
        // SOLO muestra el inventario sin footer
        <Inventario />
      ) : (
        // SOLO muestra la tienda sin footer  
        <>
          {/* Banner principal */}
          <section className="banner">
            <h1>Moda deportiva para cada paso</h1>
            <p>¡Meses sin intereses y envío gratis!</p>
            <button>Comprar ahora</button>
          </section>

          {/* Categorías populares */}
          <section className="categories">
            {categorias.map(cat => (
              <div key={cat} className="category-card">
                <h3>{cat}</h3>
              </div>
            ))}
          </section>

          {/* Productos destacados */}
          <section className="productos-destacados">
            <h2>Productos destacados</h2>
            <div className="products-grid">
              {productos.length === 0 ? (
                <p>Cargando productos...</p>
              ) : (
                productos.map(p => (
                  <div key={p.id} className="product-card">
                    <div className="product-image">Imagen</div>
                    <h4>{p.nombre}</h4>
                    <p>${p.precio}</p>
                    <button>Agregar al carrito</button>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* MODIFICACIÓN 5: Footer SOLO en la vista de tienda */}
      {!mostrarInventario && (
        <footer className="footer">
          <div className="footer-sections">
            <div className="footer-section">
              <h3>Misión</h3>
              <p>Ofrecer calzado y ropa deportiva de la más alta calidad, brindando a nuestros clientes estilo, comodidad y rendimiento en cada paso de su vida activa.</p>
            </div>

            <div className="footer-section">
              <h3>Visión</h3>
              <p>Ser la tienda líder en moda deportiva en México, reconocida por nuestra innovación, servicio excepcional y compromiso con el deporte y estilo de vida saludable.</p>
            </div>

            <div className="footer-section">
              <h3>Contacto</h3>
              <p>info@tiendatenis.com</p>
              <p>Av. Principal 123, CDMX</p>
              <p>Lunes a Sábado: 9:00 AM - 8:00 PM</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Contamos con envío gratis y devolución segura. Marcas oficiales.</p>
            <p>© 2025 dportenis.mx - Todos los derechos reservados</p>
          </div>
        </footer>
      )}
    </div>
  );
}

// El punto de entrada de React - también en el mismo archivo
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);

reportWebVitals();