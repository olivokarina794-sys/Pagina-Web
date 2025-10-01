import React from 'react';
import '../inventario.css';
// Importar las imágenes en este componente también
import htmlImage from '../html.jpg';
import cssImage from '../css.jpg';

function Inventario() {
  return (
    <div className="inventario">
      <h1>Gestión de Inventario</h1>
      
      {/* Formulario de ALTA */}
      <form className="formulario-alta">
        <h2>Agregar Producto</h2>
        <input type="text" placeholder="Nombre" required />
        <input type="number" placeholder="Precio" required />
        <select required>
          <option value="">Categoría</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
        </select>
        <button type="submit">Agregar</button>
      </form>

      {/* Formulario de MODIFICACIÓN */}
      <form className="formulario-modificacion">
        <h2>Modificar Producto</h2>
        <select required>
          <option value="">Selecciona producto</option>
        </select>
        <input type="text" placeholder="Nuevo nombre" />
        <input type="number" placeholder="Nuevo precio" />
        <button type="submit">Actualizar</button>
      </form>

      {/* Formulario de ELIMINACIÓN */}
      <form className="formulario-eliminacion">
        <h2>Eliminar Producto</h2>
        <select required>
          <option value="">Selecciona producto</option>
        </select>
        <button type="submit">Eliminar</button>
      </form>
      
      <div className="footer-section">
        <h3>Validaciones</h3>
        <div className="tech-images">
          {/* IMAGEN 1 en el footer - HTML */}
          <img 
            src={htmlImage} 
            alt="HTML5 - Lenguaje de marcado web" 
            className="tech-image"
          />
          {/* IMAGEN 2 en el footer - CSS */}
          <img 
            src={cssImage} 
            alt="CSS3 - Hojas de estilo en cascada" 
            className="tech-image"
          />
        </div>
      </div>
    </div>
  );
}

// ESTA LÍNEA ES IMPORTANTE - DEBE ESTAR AL FINAL
export default Inventario;