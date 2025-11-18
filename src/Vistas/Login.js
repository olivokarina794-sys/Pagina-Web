import React, { useState } from 'react';
import './login.css';

function Login({ onLoginSuccess }) {  // Cambiado de onLogin a onLoginSuccess
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  // Validación del formulario
  const validarFormulario = (datos) => {
    const nuevosErrores = {};

    if (!datos.correo || datos.correo.trim() === '') {
      nuevosErrores.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(datos.correo)) {
      nuevosErrores.correo = 'El correo no es válido';
    }

    if (!datos.password || datos.password === '') {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (datos.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
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

    setCargando(true);
    setMensaje('');

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        setMensaje('✅ ¡Inicio de sesión exitoso!');
        
        // Llamar al callback de login exitoso con los datos del usuario
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.user); // Pasar los datos del usuario al componente padre
          }
        }, 1000);
      } else {
        setMensaje(`❌ ${data.error || 'Error en el inicio de sesión'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('❌ Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Limpiar error específico
  const limpiarError = (campo) => {
    setErrores(prev => ({ ...prev, [campo]: '' }));
  };

  // Manejar cambio en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    limpiarError(name);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta para gestionar la tienda</p>
        </div>

        {mensaje && (
          <div className={`mensaje ${mensaje.includes('✅') ? 'mensaje-exito' : 'mensaje-error'}`}>
            {mensaje}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="campo-contenedor">
            <input 
              type="email" 
              name="correo" 
              placeholder="Correo electrónico" 
              value={formData.correo}
              onChange={handleChange}
              className={errores.correo ? 'campo-error' : ''}
              disabled={cargando}
            />
            {errores.correo && <span className="error-texto">{errores.correo}</span>}
          </div>

          <div className="campo-contenedor">
            <input 
              type="password" 
              name="password" 
              placeholder="Contraseña" 
              value={formData.password}
              onChange={handleChange}
              className={errores.password ? 'campo-error' : ''}
              disabled={cargando}
            />
            {errores.password && <span className="error-texto">{errores.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              '🚀 Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes una cuenta? Contacta al administrador</p>
          <div className="demo-credentials">
            <p><strong>Credenciales demo:</strong> admin@tienda.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;