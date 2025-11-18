import React, { useState, useEffect } from 'react';


function App() {
  // Estado para productos que vendrán del backend
  const [productos, setProductos] = useState([]);

  // Categorías de ejemplo
  const categorias = ["Hombre", "Mujer", "Niño", "Running", "Básquetbol", "Fútbol"];

  // Llamada al backend para obtener productos
  useEffect(() => {
    fetch("http://localhost:3000/productos") // Cambia la IP si es otra PC
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
        </div>
      </header>

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

      {/* Pie de página con Misión, Visión y Contacto */}
      <footer className="footer">
        <div className="footer-sections">
          {/* Sección Misión */}
          <div className="footer-section">
            <h3>Misión</h3>
            <p>Ofrecer calzado y ropa deportiva de la más alta calidad, brindando a nuestros clientes estilo, comodidad y rendimiento en cada paso de su vida activa.</p>
          </div>

          {/* Sección Visión */}
          <div className="footer-section">
            <h3>Visión</h3>
            <p>Ser la tienda líder en moda deportiva en México, reconocida por nuestra innovación, servicio excepcional y compromiso con el deporte y estilo de vida saludable.</p>
          </div>

          {/* Sección Contacto */}
          <div className="footer-section">
            <h3>Contacto</h3>
            <p> info@tiendatenis.com</p>
            <p> Av. Principal 123, CDMX</p>
            <p> Lunes a Sábado: 9:00 AM - 8:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Contamos con envío gratis y devolución segura. Marcas oficiales.</p>
          <p>© 2025 dportenis.mx - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default App;