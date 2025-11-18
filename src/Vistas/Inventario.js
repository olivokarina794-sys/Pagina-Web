import React, { useEffect, useState } from 'react';
import htmlImage from '../html.jpg';
import cssImage from '../css.jpg';
import './inventario.css';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});
  const [usuarioAutorizado, setUsuarioAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Verificar si el usuario es administrador
  const verificarAdmin = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUsuarioAutorizado(false);
        setCargando(false);
        return;
      }

      // Decodificar el token para obtener el rol
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.rol === 'admin') {
        setUsuarioAutorizado(true);
      } else {
        setMensaje('❌ No tienes permisos de administrador');
        setUsuarioAutorizado(false);
      }
      setCargando(false);
    } catch (error) {
      console.error('Error al verificar token:', error);
      setMensaje('❌ Error de autenticación');
      setUsuarioAutorizado(false);
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Agrega esto para debug
    
    const response = await fetch('http://localhost:3001/productos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status); // Agrega esto
    
    if (response.ok) {
      const data = await response.json();
      setProductos(data);
    } else if (response.status === 403) {
      setMensaje('❌ No tienes permisos para ver el inventario');
      setUsuarioAutorizado(false);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText); // Agrega esto
      setMensaje('❌ Error al cargar productos');
    }
  } catch (error) {
    console.error('Error completo al cargar productos:', error);
    setMensaje('❌ Error de conexión');
  }
};

  // FUNCIÓN DE VALIDACIÓN MEJORADA
  const validarFormulario = (datos, tipo) => {
    const nuevosErrores = {};

    // Validar nombre (mínimo 3, máximo 50 caracteres)
    if (!datos.nombre || datos.nombre.trim() === '') {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (datos.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (datos.nombre.length > 50) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 50 caracteres';
    }

    // Validar precio (máximo 10 dígitos, 2 decimales)
    if (!datos.precio || datos.precio === '') {
      nuevosErrores.precio = 'El precio es requerido';
    } else if (isNaN(datos.precio) || parseFloat(datos.precio) <= 0) {
      nuevosErrores.precio = 'El precio debe ser un número positivo';
    } else if (datos.precio.length > 10) {
      nuevosErrores.precio = 'El precio no puede tener más de 10 dígitos';
    } else if (!/^\d+(\.\d{1,2})?$/.test(datos.precio)) {
      nuevosErrores.precio = 'El precio debe tener máximo 2 decimales';
    }

    // Validar categoría
    if (!datos.categoria || datos.categoria === '') {
      nuevosErrores.categoria = 'La categoría es requerida';
    }

    // Validar URL de imagen (máximo 255 caracteres)
    if (datos.imagen_url && datos.imagen_url.trim() !== '') {
      if (datos.imagen_url.length > 255) {
        nuevosErrores.imagen_url = 'La URL no puede tener más de 255 caracteres';
      } else {
        try {
          new URL(datos.imagen_url);
        } catch (e) {
          nuevosErrores.imagen_url = 'La URL de la imagen no es válida';
        }
      }
    }

    // Validación específica para modificación
    if (tipo === 'modificar' && !datos.producto_id) {
      nuevosErrores.producto_id = 'Debes seleccionar un producto';
    }

    return nuevosErrores;
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = {
      nombre: formData.get('nombre'),
      precio: formData.get('precio'),
      categoria: formData.get('categoria'),
      imagen_url: formData.get('imagen_url') || ''
    };

    // VALIDAR
    const erroresValidacion = validarFormulario(datos, 'agregar');
    setErrores(erroresValidacion);

    // Si hay errores, no enviar
    if (Object.keys(erroresValidacion).length > 0) {
      setMensaje('❌ Por favor corrige los errores del formulario');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/productos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...datos,
          precio: parseFloat(datos.precio)
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMensaje('✅ Producto agregado correctamente');
        e.target.reset();
        setErrores({});
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje(`❌ ${responseData.error || 'Error al agregar producto'}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  const handleModificar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const datos = {
      producto_id: formData.get('producto_id'),
      nombre: formData.get('nuevo_nombre'),
      precio: formData.get('nuevo_precio'),
      categoria: formData.get('nueva_categoria'),
      imagen_url: formData.get('nueva_imagen_url') || ''
    };

    // VALIDAR
    const erroresValidacion = validarFormulario(datos, 'modificar');
    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length > 0) {
      setMensaje('❌ Por favor corrige los errores del formulario');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/productos/${datos.producto_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: datos.nombre,
          precio: parseFloat(datos.precio),
          categoria: datos.categoria,
          imagen_url: datos.imagen_url
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMensaje('✅ Producto actualizado correctamente');
        e.target.reset();
        setErrores({});
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje(`❌ ${responseData.error || 'Error al actualizar producto'}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  const handleEliminar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const productoId = formData.get('producto_id');

    if (!productoId) {
      setMensaje('❌ Selecciona un producto para eliminar');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`http://localhost:3001/productos/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();

      if (response.ok) {
        setMensaje('✅ Producto eliminado correctamente');
        e.target.reset();
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      } else {
        setMensaje(`❌ ${responseData.error || 'Error al eliminar producto'}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  // Función para limpiar errores cuando el usuario escribe
  const limpiarError = (campo) => {
    setErrores(prev => ({ ...prev, [campo]: '' }));
  };

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (usuarioAutorizado) {
      cargarProductos();
    }
  }, [usuarioAutorizado]);

  // Si está cargando, mostrar mensaje de carga
  if (cargando) {
    return (
      <div className="inventario">
        <div className="cargando">Verificando permisos...</div>
      </div>
    );
  }

  // Si no está autorizado, mostrar mensaje de acceso denegado
  if (!usuarioAutorizado) {
    return (
      <div className="inventario">
        <div className="acceso-denegado">
          <h2>🔒 Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder al inventario.</p>
          <p>Por favor, inicia sesión con una cuenta de administrador.</p>
        </div>
      </div>
    );
  }

  // Si está autorizado, mostrar la interfaz normal
  return (
    <div className="inventario">
      <h1>Gestión de Inventario</h1>
      
      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}`}>
          {mensaje}
        </div>
      )}

      <form className="formulario-alta" onSubmit={handleAgregar}>
        <h2>Agregar Producto</h2>
        
        <div className="campo-contenedor">
          <input 
            type="text" 
            name="nombre" 
            placeholder="Nombre (3-50 caracteres)" 
            required 
            maxLength={50}
            className={errores.nombre ? 'campo-error' : ''}
            onChange={() => limpiarError('nombre')}
          />
          {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
        </div>

        <div className="campo-contenedor">
          <input 
            type="number" 
            name="precio" 
            placeholder="Precio (máx. 10 dígitos, 2 decimales)" 
            required 
            step="0.01"
            min="0"
            max="9999999.99"
            className={errores.precio ? 'campo-error' : ''}
            onChange={() => limpiarError('precio')}
          />
          {errores.precio && <span className="error-texto">{errores.precio}</span>}
        </div>

        <div className="campo-contenedor">
          <select 
            name="categoria" 
            required
            className={errores.categoria ? 'campo-error' : ''}
            onChange={() => limpiarError('categoria')}
          >
            <option value="">Categoría</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Niño">Niño</option>
            <option value="Running">Running</option>
            <option value="Básquetbol">Básquetbol</option>
            <option value="Fútbol">Fútbol</option>
          </select>
          {errores.categoria && <span className="error-texto">{errores.categoria}</span>}
        </div>

        <div className="campo-contenedor">
          <input 
            type="url" 
            name="imagen_url" 
            placeholder="URL de imagen (opcional, máx. 255 caracteres)"
            maxLength={255}
            className={errores.imagen_url ? 'campo-error' : ''}
            onChange={() => limpiarError('imagen_url')}
          />
          {errores.imagen_url && <span className="error-texto">{errores.imagen_url}</span>}
        </div>

        <button type="submit">Agregar</button>
      </form>

      <form className="formulario-modificacion" onSubmit={handleModificar}>
        <h2>Modificar Producto</h2>
        
        <div className="campo-contenedor">
          <select 
            name="producto_id" 
            required
            className={errores.producto_id ? 'campo-error' : ''}
            onChange={() => limpiarError('producto_id')}
          >
            <option value="">Selecciona producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} - ${producto.precio}
              </option>
            ))}
          </select>
          {errores.producto_id && <span className="error-texto">{errores.producto_id}</span>}
        </div>

        <div className="campo-contenedor">
          <input 
            type="text" 
            name="nuevo_nombre" 
            placeholder="Nuevo nombre (3-50 caracteres)" 
            required 
            maxLength={50}
            className={errores.nombre ? 'campo-error' : ''}
            onChange={() => limpiarError('nombre')}
          />
          {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
        </div>

        <div className="campo-contenedor">
          <input 
            type="number" 
            name="nuevo_precio" 
            placeholder="Nuevo precio (máx. 10 dígitos, 2 decimales)" 
            required 
            step="0.01"
            min="0"
            max="9999999.99"
            className={errores.precio ? 'campo-error' : ''}
            onChange={() => limpiarError('precio')}
          />
          {errores.precio && <span className="error-texto">{errores.precio}</span>}
        </div>

        <div className="campo-contenedor">
          <select 
            name="nueva_categoria" 
            required
            className={errores.categoria ? 'campo-error' : ''}
            onChange={() => limpiarError('categoria')}
          >
            <option value="">Nueva categoría</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Niño">Niño</option>
            <option value="Running">Running</option>
            <option value="Básquetbol">Básquetbol</option>
            <option value="Fútbol">Fútbol</option>
          </select>
          {errores.categoria && <span className="error-texto">{errores.categoria}</span>}
        </div>

        <div className="campo-contenedor">
          <input 
            type="url" 
            name="nueva_imagen_url" 
            placeholder="Nueva URL de imagen (máx. 255 caracteres)"
            maxLength={255}
            className={errores.imagen_url ? 'campo-error' : ''}
            onChange={() => limpiarError('imagen_url')}
          />
          {errores.imagen_url && <span className="error-texto">{errores.imagen_url}</span>}
        </div>

        <button type="submit">Actualizar</button>
      </form>

      <form className="formulario-eliminacion" onSubmit={handleEliminar}>
        <h2>Eliminar Producto</h2>
        <select name="producto_id" required>
          <option value="">Selecciona producto</option>
          {productos.map(producto => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - ${producto.precio}
            </option>
          ))}
        </select>
        <button type="submit">Eliminar</button>
      </form>
      
      <div className="footer-section">
        <h3>Validaciones</h3>
        <div className="tech-images">
          <a href="https://validator.w3.org/" target="_blank" rel="noopener noreferrer">
            <img src={htmlImage} alt="HTML5 Validator" className="tech-image"/>
          </a>
          <a href="https://jigsaw.w3.org/css-validator/" target="_blank" rel="noopener noreferrer">
            <img src={cssImage} alt="CSS3 Validator" className="tech-image"/>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Inventario;