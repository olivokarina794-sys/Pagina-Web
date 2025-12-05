import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import Inventario from './Vistas/Inventario';
import GestionUsuarios from './Vistas/GestionUsuarios';
import Login from './Vistas/Login';
import Carrito from './Vistas/carrito';
import './index.css';
import htmlImage from './html.jpg';
import cssImage from './css.jpg';

// =============================================
// CONSTANTES Y CONFIGURACIÓN
// =============================================

const CATEGORIAS = ["Hombre", "Mujer", "Niño", "Running", "Básquetbol", "Fútbol"];
const API_BASE_URL = 'http://localhost:3001';

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

function Index() {
  // =============================================
  // ESTADOS
  // =============================================
  
  // Estado de productos y búsqueda
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cargandoProductos, setCargandoProductos] = useState(true);
  
  // Estado de navegación y usuario
  const [vistaActual, setVistaActual] = useState('tienda');
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);

  // Estado del carrito
  const [carrito, setCarrito] = useState([]);

  // =============================================
  // EFECTOS PRINCIPALES
  // =============================================

  // Verificar autenticación al cargar
  useEffect(() => {
    verificarAutenticacion();
  }, []);

  // Cargar productos al iniciar
  useEffect(() => {
    cargarProductos();
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProductos(terminoBusqueda);
    }, 300);

    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  // Efectos visuales para la tienda
  useEffect(() => {
    if (vistaActual === 'tienda') {
      return configurarEfectosVisuales();
    }
  }, [vistaActual]);

  // =============================================
  // FUNCIONES DE AUTENTICACIÓN
  // =============================================

  /**
   * Verifica si hay un usuario autenticado
   */
  const verificarAutenticacion = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuarioLogeado(payload);
      } catch (error) {
        console.error('Error al decodificar token:', error);
        localStorage.removeItem('token');
      }
    }
  };

  /**
   * Maneja el cierre de sesión
   */
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setUsuarioLogeado(null);
    setVistaActual('tienda');
    setCarrito([]); // Limpiar carrito al cerrar sesión
  };

  /**
   * Maneja el login exitoso
   */
  const handleLoginSuccess = (userData) => {
    setUsuarioLogeado(userData);
    setVistaActual('tienda');
  };

  // =============================================
  // FUNCIONES DE PRODUCTOS (AJAX)
  // =============================================

  /**
   * Carga todos los productos desde la API
   */
  const cargarProductos = async () => {
    try {
      setCargandoProductos(true);
      const response = await fetch(`${API_BASE_URL}/productos`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Productos cargados:', data);
        setProductos(data);
        setProductosFiltrados(data);
      } else {
        console.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  /**
   * Busca productos por término (AJAX)
   */
  const buscarProductos = async (termino) => {
    try {
      if (termino.trim() === '') {
        setProductosFiltrados(productos);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/productos/buscar?q=${encodeURIComponent(termino)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setProductosFiltrados(data);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  /**
   * Limpia la búsqueda actual
   */
  const limpiarBusqueda = () => {
    setTerminoBusqueda('');
    setProductosFiltrados(productos);
  };

  // =============================================
  // FUNCIONES DEL CARRITO
  // =============================================

  /**
   * Agrega un producto al carrito
   */
  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    
    // Mostrar notificación o feedback visual
    alert(`✅ ${producto.nombre} agregado al carrito`);
  };

  /**
   * Elimina un producto del carrito
   */
  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  /**
   * Calcula el total del carrito
   */
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  /**
   * Calcula la cantidad total de items en el carrito
   */
  const calcularTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // =============================================
  // FUNCIONES DE EFECTOS VISUALES
  // =============================================

  /**
   * Configura efectos visuales para la tienda
   */
  const configurarEfectosVisuales = () => {
    const navbar = document.querySelector('.navbar');
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    crearParticulasBanner();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  };

  /**
   * Crea efecto de partículas en el banner
   */
  const crearParticulasBanner = () => {
    const banner = document.querySelector('.banner');
    if (!banner) return;

    const existingParticles = banner.querySelector('.banner-particles');
    if (existingParticles) {
      existingParticles.remove();
    }
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'banner-particles';
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.background = 'rgba(255,255,255,0.3)';
      particlesContainer.appendChild(particle);
    }
    
    banner.appendChild(particlesContainer);
  };

  // =============================================
  // COMPONENTES DE RENDERIZADO
  // =============================================

  /**
   * Renderiza la vista actual
   */
  const renderVista = () => {
    const vistas = {
      'inventario': <Inventario />,
      'gestion-usuarios': <GestionUsuarios />,
      'login': <Login onLoginSuccess={handleLoginSuccess} />,
      'tienda': renderTienda(),
      'carrito': renderCarrito()
    };

    return vistas[vistaActual] || renderTienda();
  };

  /**
   * Renderiza la vista del carrito
   */
  const renderCarrito = () => {
    const total = calcularTotal();
    const totalItems = calcularTotalItems();

    return (
      <div className="carrito-vista">
        <div className="carrito-header">
          <h2>🛒 Tu Carrito de Compras</h2>
          <button 
            type="button" 
            onClick={() => setVistaActual('tienda')}
            className="btn-seguir-comprando"
          >
            ← Seguir comprando
          </button>
        </div>

        {carrito.length === 0 ? (
          <div className="carrito-vacio">
            <p>😔 Tu carrito está vacío</p>
            <button 
              type="button" 
              onClick={() => setVistaActual('tienda')}
              className="btn-explorar-productos"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="carrito-contenido">
            <div className="carrito-items">
              {carrito.map(item => (
                <div key={item.id} className="carrito-item">
                  <div className="item-info">
                    <div className="item-imagen">
                      {item.imagen_url ? (
                        <img src={item.imagen_url} alt={item.nombre} />
                      ) : (
                        <div className="image-placeholder">🏃‍♂️</div>
                      )}
                    </div>
                    <div className="item-detalles">
                      <h4>{item.nombre}</h4>
                      <p className="item-categoria">{item.categoria}</p>
                      <p className="item-precio">${item.precio} c/u</p>
                    </div>
                  </div>
                  
                  <div className="item-controls">
                    <div className="cantidad-controls">
                      <button 
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="btn-cantidad"
                      >
                        -
                      </button>
                      <span className="cantidad">{item.cantidad}</span>
                      <button 
                        type="button"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        className="btn-cantidad"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-subtotal">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="btn-eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="carrito-resumen">
              <div className="resumen-content">
                <h3>Resumen de compra</h3>
                <div className="resumen-linea">
                  <span>Productos ({totalItems}):</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="resumen-linea">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
                <div className="resumen-linea total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button type="button" className="btn-finalizar-compra">
                  Finalizar compra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza el componente de búsqueda
   */
  const renderBuscador = () => (
    <section className="buscador-section">
      <div className="buscador-container">
        <input 
          type="text" 
          placeholder="🔍 Buscar productos por nombre o categoría..." 
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="buscador-input"
        />
        {terminoBusqueda && (
          <div className="resultados-busqueda">
            Encontrados: {productosFiltrados.length} productos
          </div>
        )}
      </div>
    </section>
  );

  /**
   * Renderiza las categorías
   */
  const renderCategorias = () => (
    <section className="categories-section">
      <h2>Categorías Populares</h2>
      <div className="categories">
        {/* Botón Todos los Productos */}
        <div 
          key="todos" 
          className="category-card" 
          onClick={limpiarBusqueda}
        >
          <h3>🔄 Todos</h3>
        </div>
        
        {CATEGORIAS.map(categoria => (
          <div 
            key={categoria} 
            className="category-card" 
            onClick={() => setTerminoBusqueda(categoria)}
          >
            <h3>{categoria}</h3>
          </div>
        ))}
      </div>
    </section>
  );

  /**
   * Renderiza el estado de carga
   */
  const renderEstadoCarga = () => (
    <div className="cargando-productos">
      <div className="spinner"></div>
      <p>Cargando productos...</p>
    </div>
  );

  /**
   * Renderiza estado sin resultados
   */
  const renderSinResultados = () => (
    <div className="sin-resultados">
      <p>😔 No se encontraron productos</p>
      {terminoBusqueda && (
        <button onClick={limpiarBusqueda} className="btn-limpiar-busqueda">
          Ver todos los productos
        </button>
      )}
    </div>
  );

  /**
   * Renderiza grid de productos
   */
  const renderProductos = () => (
    productosFiltrados.map(producto => (
      <div key={producto.id} className="product-card">
        <div className="product-image">
          {producto.imagen_url ? (
            <img 
              src={producto.imagen_url} 
              alt={producto.nombre}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="image-placeholder" 
            style={{display: producto.imagen_url ? 'none' : 'block'}}
          >
            🏃‍♂️
          </div>
        </div>
        <div className="product-info">
          <h4>{producto.nombre}</h4>
          <p className="product-price">${producto.precio}</p>
          <p className="product-category">{producto.categoria}</p>
        </div>
        <button 
          type="button" 
          className="btn-agregar-carrito"
          onClick={() => agregarAlCarrito(producto)}
        >
          🛒 Agregar al carrito
        </button>
      </div>
    ))
  );

  /**
   * Renderiza la sección de productos
   */
  const renderSeccionProductos = () => (
    <section className="productos-destacados">
      <h2>
        {terminoBusqueda ? `Resultados para "${terminoBusqueda}"` : 'Todos los productos'}
      </h2>
      <div className="products-grid">
        {cargandoProductos 
          ? renderEstadoCarga()
          : productosFiltrados.length === 0 
            ? renderSinResultados()
            : renderProductos()
        }
      </div>
    </section>
  );

  /**
   * Renderiza el banner principal
   */
  const renderBanner = () => (
    <section className="banner">
      <h1>Moda deportiva para cada paso</h1>
      <p>¡Meses sin intereses y envío gratis!</p>
      <button type="button">Comprar ahora</button>
    </section>
  );

  /**
   * Renderiza la vista de tienda completa
   */
  const renderTienda = () => (
    <>
      {renderBanner()}
      {renderBuscador()}
      {renderCategorias()}
      {renderSeccionProductos()}
    </>
  );

  // =============================================
  // COMPONENTE DE NAVEGACIÓN
  // =============================================

  /**
   * Renderiza la información del usuario
   */
  const renderInfoUsuario = () => (
    usuarioLogeado && (
      <div className="usuario-info-container">
        <span className="usuario-info">
          👋 Hola, <strong>{usuarioLogeado.nombre}</strong>
          {usuarioLogeado.rol === 'admin' && (
            <span className="badge-admin">Admin</span>
          )}
        </span>
      </div>
    )
  );

  /**
   * Renderiza botones de navegación condicionales
   */
  const renderBotonesNavegacion = () => {
    const totalItemsCarrito = calcularTotalItems();
    const botones = [
      {
        clave: 'cuenta',
        texto: usuarioLogeado ? 'Cerrar Sesión' : (vistaActual === 'login' ? 'Tienda' : 'Cuenta'),
        accion: () => usuarioLogeado ? cerrarSesion() : setVistaActual(vistaActual === 'login' ? 'tienda' : 'login'),
        activo: vistaActual === 'login'
      },
      {
        clave: 'carrito',
        texto: vistaActual === 'carrito' ? 'Tienda' : `🛒 Carrito ${totalItemsCarrito > 0 ? `(${totalItemsCarrito})` : ''}`,
        accion: () => setVistaActual(vistaActual === 'carrito' ? 'tienda' : 'carrito'),
        activo: vistaActual === 'carrito'
      }
    ];

    // Botones solo para administradores
    if (usuarioLogeado && usuarioLogeado.rol === 'admin') {
      botones.push(
        {
          clave: 'usuarios',
          texto: vistaActual === 'gestion-usuarios' ? 'Tienda' : '👥 Usuarios',
          accion: () => setVistaActual(vistaActual === 'gestion-usuarios' ? 'tienda' : 'gestion-usuarios'),
          activo: vistaActual === 'gestion-usuarios'
        },
        {
          clave: 'inventario',
          texto: vistaActual === 'inventario' ? 'Tienda' : '📦 Inventario',
          accion: () => setVistaActual(vistaActual === 'inventario' ? 'tienda' : 'inventario'),
          activo: vistaActual === 'inventario'
        }
      );
    }

    return botones.map(boton => (
      <button
        key={boton.clave}
        type="button"
        onClick={boton.accion}
        className={boton.activo ? 'active' : ''}
      >
        {boton.texto}
      </button>
    ));
  };

  /**
   * Renderiza el header de navegación
   */
  const renderHeader = () => (
    <header className="navbar">
      <div className="navbar-content">
        <div className="logo">🏃‍♂️ tiendatenis</div>
        
        <div className="nav-right">
          {renderInfoUsuario()}
          <div className="actions">
            {renderBotonesNavegacion()}
          </div>
        </div>
      </div>
    </header>
  );

  // =============================================
  // COMPONENTE DE FOOTER
  // =============================================

  /**
   * Renderiza el footer
   */
  const renderFooter = () => (
    vistaActual === 'tienda' && (
      <footer className="footer">
        <div className="footer-sections">
          <div className="footer-section">
            <h3>🎯 Misión</h3>
            <p>Ofrecer calzado y ropa deportiva de la más alta calidad, brindando a nuestros clientes estilo, comodidad y rendimiento en cada paso de su vida activa.</p>
          </div>

          <div className="footer-section">
            <h3>👁️ Visión</h3>
            <p>Ser la tienda líder en moda deportiva en México, reconocida por nuestra innovación, servicio excepcional y compromiso con el deporte y estilo de vida saludable.</p>
          </div>

          <div className="footer-section">
            <h3>✅ Validaciones</h3>
            <div className="tech-images">
              <a href="https://validator.w3.org/" target="_blank" rel="noopener noreferrer">
                <img src={htmlImage} alt="HTML5 - Lenguaje de marcado web" className="tech-image"/>
              </a>
              <a href="https://jigsaw.w3.org/css-validator/#validate_by_uri" target="_blank" rel="noopener noreferrer">
                <img src={cssImage} alt="CSS3 - Hojas de estilo en cascada" className="tech-image"/>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>📞 Contacto</h3>
            <p>📧 info@tiendatenis.com</p>
            <p>🏢 Av. Principal 123, CDMX</p>
            <p>🕒 Lunes a Sábado: 9:00 AM - 8:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>🚚 Contamos con envío gratis y devolución segura. Marcas oficiales.</p>
          <p>© 2025 dportatenis.mx - Todos los derechos reservados</p>
        </div>
      </footer>
    )
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <div className="app">
      {renderHeader()}
      {renderVista()}
      {renderFooter()}
    </div>
  );
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);

reportWebVitals();