import React, { useState, useEffect } from 'react';
import './gestionUsuarios.css';

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioAutorizado, setUsuarioAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Datos del formulario
  const [formData, setFormData] = useState({
    direccion: '',
    nombre: '',
    correo: '',
    password: '',
    rol: 'cliente'
  });

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

  // Cargar usuarios (solo si es admin)
  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else if (response.status === 403) {
        setMensaje('❌ No tienes permisos para ver usuarios');
        setUsuarioAutorizado(false);
      } else {
        setMensaje('❌ Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error de conexión');
    }
  };

  // Validación del formulario
  const validarFormulario = (datos) => {
    const nuevosErrores = {};

    if (!datos.direccion || datos.direccion.trim() === '') {
      nuevosErrores.direccion = 'La dirección es requerida';
    } else if (datos.direccion.length > 100) {
      nuevosErrores.direccion = 'La dirección no puede tener más de 100 caracteres';
    }

    if (!datos.nombre || datos.nombre.trim() === '') {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (datos.nombre.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 100 caracteres';
    }

    if (!datos.correo || datos.correo.trim() === '') {
      nuevosErrores.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(datos.correo)) {
      nuevosErrores.correo = 'El correo no es válido';
    }

    if (!usuarioEditando && (!datos.password || datos.password === '')) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (datos.password && datos.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!datos.rol) {
      nuevosErrores.rol = 'El rol es requerido';
    }

    return nuevosErrores;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const erroresValidacion = validarFormulario(formData);
    setErrores(erroresValidacion);

    if (Object.keys(erroresValidacion).length > 0) {
      setMensaje('❌ Por favor corrige los errores del formulario');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let response;

      if (usuarioEditando) {
        // Actualizar usuario existente
        response = await fetch(`http://localhost:3001/usuarios/${usuarioEditando.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            direccion: formData.direccion,
            nombre: formData.nombre,
            correo: formData.correo,
            rol: formData.rol
          })
        });
      } else {
        // Crear nuevo usuario
        response = await fetch('http://localhost:3001/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        setMensaje(`✅ Usuario ${usuarioEditando ? 'actualizado' : 'creado'} correctamente`);
        resetFormulario();
        cargarUsuarios();
        setTimeout(() => setMensaje(''), 3000);
      } else if (response.status === 403) {
        setMensaje('❌ No tienes permisos para realizar esta acción');
      } else {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
    }
  };

  // Eliminar usuario
  const handleEliminar = async (usuarioId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/usuarios/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMensaje('✅ Usuario eliminado correctamente');
        cargarUsuarios();
        setTimeout(() => setMensaje(''), 3000);
      } else if (response.status === 403) {
        setMensaje('❌ No tienes permisos para eliminar usuarios');
      } else {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
    }
  };

  // Editar usuario
  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      direccion: usuario.direccion,
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '', // No mostramos la contraseña actual
      rol: usuario.rol
    });
    setMostrarFormulario(true);
  };

  // Resetear formulario
  const resetFormulario = () => {
    setFormData({
      direccion: '',
      nombre: '',
      correo: '',
      password: '',
      rol: 'cliente'
    });
    setUsuarioEditando(null);
    setMostrarFormulario(false);
    setErrores({});
  };

  // Limpiar error específico
  const limpiarError = (campo) => {
    setErrores(prev => ({ ...prev, [campo]: '' }));
  };

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (usuarioAutorizado) {
      cargarUsuarios();
    }
  }, [usuarioAutorizado]);

  // Si está cargando, mostrar mensaje de carga
  if (cargando) {
    return (
      <div className="gestion-usuarios">
        <div className="cargando">Verificando permisos...</div>
      </div>
    );
  }

  // Si no está autorizado, mostrar mensaje de acceso denegado
  if (!usuarioAutorizado) {
    return (
      <div className="gestion-usuarios">
        <div className="acceso-denegado">
          <h2>🔒 Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder a esta sección.</p>
          <p>Por favor, inicia sesión con una cuenta de administrador.</p>
        </div>
      </div>
    );
  }

  // Si está autorizado, mostrar la interfaz normal
  return (
    <div className="gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      
      {mensaje && (
        <div className={`mensaje ${mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}`}>
          {mensaje}
        </div>
      )}

      <div className="header-actions">
        <button 
          className="btn-agregar"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? 'Cancelar' : '➕ Agregar Usuario'}
        </button>
      </div>

      {mostrarFormulario && (
        <form className="formulario-usuario" onSubmit={handleSubmit}>
          <h2>{usuarioEditando ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
          
          <div className="campo-contenedor">
            <input 
              type="text" 
              name="direccion" 
              placeholder="Dirección completa" 
              value={formData.direccion}
              onChange={(e) => {
                setFormData({...formData, direccion: e.target.value});
                limpiarError('direccion');
              }}
              required 
              maxLength={100}
              className={errores.direccion ? 'campo-error' : ''}
            />
            {errores.direccion && <span className="error-texto">{errores.direccion}</span>}
          </div>

          <div className="campo-contenedor">
            <input 
              type="text" 
              name="nombre" 
              placeholder="Nombre completo" 
              value={formData.nombre}
              onChange={(e) => {
                setFormData({...formData, nombre: e.target.value});
                limpiarError('nombre');
              }}
              required 
              maxLength={100}
              className={errores.nombre ? 'campo-error' : ''}
            />
            {errores.nombre && <span className="error-texto">{errores.nombre}</span>}
          </div>

          <div className="campo-contenedor">
            <input 
              type="email" 
              name="correo" 
              placeholder="Correo electrónico" 
              value={formData.correo}
              onChange={(e) => {
                setFormData({...formData, correo: e.target.value});
                limpiarError('correo');
              }}
              required 
              className={errores.correo ? 'campo-error' : ''}
            />
            {errores.correo && <span className="error-texto">{errores.correo}</span>}
          </div>

          {!usuarioEditando && (
            <div className="campo-contenedor">
              <input 
                type="password" 
                name="password" 
                placeholder="Contraseña (mínimo 6 caracteres)" 
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  limpiarError('password');
                }}
                required 
                className={errores.password ? 'campo-error' : ''}
              />
              {errores.password && <span className="error-texto">{errores.password}</span>}
            </div>
          )}

          <div className="campo-contenedor">
            <select 
              name="rol" 
              value={formData.rol}
              onChange={(e) => {
                setFormData({...formData, rol: e.target.value});
                limpiarError('rol');
              }}
              required
              className={errores.rol ? 'campo-error' : ''}
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
            {errores.rol && <span className="error-texto">{errores.rol}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-guardar">
              {usuarioEditando ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
            <button type="button" onClick={resetFormulario} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="usuarios-lista">
        <h2>Lista de Usuarios</h2>
        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.direccion}</td>
                  <td>
                    <span className={`badge-rol ${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-editar"
                      onClick={() => handleEditar(usuario)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleEliminar(usuario.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GestionUsuarios;