import React, { useState } from 'react';

function ProductForm({ producto, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || '',
    precio: producto?.precio || '',
    categoria: producto?.categoria || '',
    descripcion: producto?.descripcion || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
      
      <div className="form-group">
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Precio:</label>
        <input
          type="number"
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Categoría:</label>
        <select name="categoria" value={formData.categoria} onChange={handleChange} required>
          <option value="">Seleccionar categoría</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="Niño">Niño</option>
          <option value="Running">Running</option>
          <option value="Básquetbol">Básquetbol</option>
          <option value="Fútbol">Fútbol</option>
        </select>
      </div>

      <div className="form-group">
        <label>Descripción:</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default ProductForm;