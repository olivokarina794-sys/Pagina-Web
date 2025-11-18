import React, { useState, useEffect } from 'react';
import './carrito.css';

function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito(prev => prev.map(item =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const vaciarCarrito = () => {
    if (window.confirm("¿Seguro que deseas vaciar tu carrito?")) {
      setCarrito([]);
    }
  };

  const calcularTotal = () =>
    carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

  const calcularTotalProductos = () =>
    carrito.reduce((t, i) => t + i.cantidad, 0);

  if (cargando) {
    return (
      <div className="carrito-cargando">
        <div className="spinner"></div>
        <p>Cargando carrito...</p>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <div className="carrito-vacio-icono">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega algunos productos para comenzar</p>
        <button className="btn-seguir-comprando" onClick={() => window.history.back()}>
          🏃‍♂️ Seguir Comprando
        </button>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <div className="carrito-contenedor">
        <div className="carrito-header">
          <h1>🛒 Tu carrito</h1>
          <div className="carrito-stats">
            <div className="total-items">
              {calcularTotalProductos()} artículos
            </div>
            <div className="total-precio">
              Total: ${calcularTotal().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="carrito-layout">
          {/* LISTA DE PRODUCTOS */}
          <div className="carrito-items">
            {carrito.map(item => (
              <div className="carrito-item" key={item.id}>
                <div className="item-imagen">
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} />
                  ) : (
                    <div className="image-placeholder">📦</div>
                  )}
                </div>

                <div className="item-info">
                  <h4 className="item-nombre">{item.nombre}</h4>
                  <p className="item-categoria">{item.categoria}</p>
                  <p className="item-precio">${item.precio}</p>
                </div>

                <div className="item-controles">
                  <div className="contador-cantidad">
                    <button
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      disabled={item.cantidad === 1}
                    >
                      -
                    </button>

                    <span className="cantidad">{item.cantidad}</span>

                    <button
                      className="btn-cantidad"
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-subtotal">
                    ${ (item.precio * item.cantidad).toFixed(2) }
                  </div>

                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarDelCarrito(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="carrito-sidebar">
            <div className="resumen-carrito">
              <div className="resumen-header">
                <h3>Resumen de Compra</h3>
                <div className="total-productos">
                  {calcularTotalProductos()} producto
                  {calcularTotalProductos() !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="resumen-detalles">
                <div className="resumen-fila">
                  <span>Subtotal:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>

                <div className="resumen-fila">
                  <span>Envío:</span>
                  <span className="envio-gratis">¡Gratis!</span>
                </div>

                <div className="resumen-fila total">
                  <span>Total:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              <button className="btn-realizar-compra" onClick={() => alert("Compra realizada")}>
                💳 Realizar Compra
              </button>

              <button className="btn-vaciar-carrito" onClick={vaciarCarrito}>
                🗑 Vaciar Carrito
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Carrito;