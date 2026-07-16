// Formulario modal para crear/editar un producto + sus variantes.
// Campos dinámicos según el rol de la categoría.

import { useState, useEffect } from 'react';
import {
  crearProducto, actualizarProducto, eliminarProducto,
  crearVariante, actualizarVariante, eliminarVariante,
} from '../../lib/inventario.js';

const VACIO = {
  categoria_id: '',
  nombre: '',
  largo: '',
  ancho: '',
  espesor: '',
  descripcion: '',
  activo: true,
};

export default function ProductoForm({
  producto,    // null = crear; objeto = editar
  categorias,
  onCerrado,
  onGuardado,
  mostrarToast,
}) {
  const esEditar = Boolean(producto);
  const [form, setForm] = useState(VACIO);
  const [variantes, setVariantes] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({
        categoria_id: producto.categoria_id,
        nombre: producto.nombre,
        largo: producto.largo ?? '',
        ancho: producto.ancho ?? '',
        espesor: producto.espesor ?? '',
        descripcion: producto.descripcion ?? '',
        activo: producto.activo,
      });
      setVariantes(producto.variantes || []);
    }
  }, [producto]);

  const categoria = categorias.find((c) => c.id === form.categoria_id);
  const requiereDim = categoria?.requiere_dimensiones;
  const requiereColor = categoria?.requiere_color;

  const set = (campo, val) => setForm((f) => ({ ...f, [campo]: val }));

  // ---------- Variantes ----------
  const addVariante = () => {
    setVariantes((v) => [...v, { codigo: '', color: '', precio: '', _nuevo: true }]);
  };
  const setVariante = (idx, campo, val) => {
    setVariantes((v) => v.map((x, i) => i === idx ? { ...x, [campo]: val } : x));
  };
  const delVariante = async (idx) => {
    const v = variantes[idx];
    if (v.id && !v._nuevo) {
      const { error } = await eliminarVariante(v.id);
      if (error) { mostrarToast('error', 'No se pudo eliminar la variante'); return; }
    }
    setVariantes((vs) => vs.filter((_, i) => i !== idx));
  };

  // ---------- Guardar ----------
  const guardar = async (e) => {
    e.preventDefault();
    if (!form.categoria_id || !form.nombre) {
      mostrarToast('error', 'Categoría y nombre son obligatorios');
      return;
    }
    setGuardando(true);

    const payload = {
      categoria_id: form.categoria_id,
      nombre: form.nombre,
      largo: requiereDim ? Number(form.largo) || null : null,
      ancho: requiereDim ? Number(form.ancho) || null : null,
      espesor: requiereDim ? form.espesor || null : null,
      descripcion: form.descripcion || null,
      activo: form.activo,
    };

    let productoId = producto?.id;
    let error;

    if (esEditar) {
      const res = await actualizarProducto(productoId, payload);
      error = res.error;
    } else {
      const res = await crearProducto(payload);
      if (res.error) { error = res.error; }
      else { productoId = res.data.id; }
    }

    if (error) {
      mostrarToast('error', 'Error al guardar el producto');
      setGuardando(false);
      return;
    }

    // Guardar variantes
    for (const v of variantes) {
      if (!v.codigo) continue;
      const vPayload = {
        producto_id: productoId,
        codigo: v.codigo,
        color: requiereColor ? v.color || null : null,
        precio: Number(v.precio) || 0,
        activo: v.activo !== false,
      };
      if (v.id && !v._nuevo) {
        const r = await actualizarVariante(v.id, vPayload);
        if (r.error) console.error(r.error);
      } else {
        const r = await crearVariante(vPayload);
        if (r.error) console.error(r.error);
      }
    }

    mostrarToast('ok', esEditar ? 'Producto actualizado' : 'Producto creado');
    setGuardando(false);
    onGuardado();
  };

  const borrar = async () => {
    if (!productoIdActual()) return;
    if (!confirm(`¿Eliminar "${producto.nombre}" y todas sus variantes?`)) return;
    setGuardando(true);
    const { error } = await eliminarProducto(producto.id);
    setGuardando(false);
    if (error) { mostrarToast('error', 'No se pudo eliminar'); return; }
    mostrarToast('ok', 'Producto eliminado');
    onGuardado();
  };
  function productoIdActual() { return producto?.id; }

  return (
    <div className="modal-overlay" onClick={onCerrado}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2>{esEditar ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" className="modal__close" onClick={onCerrado}>✕</button>
        </div>

        <form onSubmit={guardar} className="modal__form">
          {/* Categoría */}
          <div className="campo">
            <label>Categoría *</label>
            <select
              value={form.categoria_id}
              onChange={(e) => set('categoria_id', e.target.value)}
              disabled={esEditar}
              required
            >
              <option value="">Seleccionar...</option>
              {categorias.filter((c) => c.activo).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div className="campo">
            <label>Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
          </div>

          {/* Dimensiones (si la categoría lo requiere) */}
          {requiereDim && (
            <div className="campos-row">
              <div className="campo">
                <label>Largo (m)</label>
                <input type="number" step="0.01" value={form.largo} onChange={(e) => set('largo', e.target.value)} />
              </div>
              <div className="campo">
                <label>Ancho (m)</label>
                <input type="number" step="0.01" value={form.ancho} onChange={(e) => set('ancho', e.target.value)} />
              </div>
              <div className="campo">
                <label>Espesor</label>
                <input type="text" value={form.espesor} onChange={(e) => set('espesor', e.target.value)} placeholder="0.7 mm" />
              </div>
            </div>
          )}

          {/* Estado */}
          <label className="check">
            <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
            <span>Activo</span>
          </label>

          {/* Variantes */}
          <div className="variantes">
            <div className="variantes__head">
              <strong>Variantes (códigos de tienda)</strong>
              <button type="button" className="btn-mini" onClick={addVariante}>+ Agregar</button>
            </div>
            {variantes.length === 0 && (
              <p className="variantes__vacío">Sin variantes. Agregá al menos una con su código y precio.</p>
            )}
            {variantes.map((v, i) => (
              <div className="variante-row" key={v.id ?? i}>
                <input
                  type="text"
                  value={v.codigo}
                  onChange={(e) => setVariante(i, 'codigo', e.target.value)}
                  placeholder="Código"
                  className="variante-row__cod"
                />
                {requiereColor && (
                  <input
                    type="text"
                    value={v.color ?? ''}
                    onChange={(e) => setVariante(i, 'color', e.target.value)}
                    placeholder="Color"
                    className="variante-row__color"
                  />
                )}
                <input
                  type="number"
                  value={v.precio}
                  onChange={(e) => setVariante(i, 'precio', e.target.value)}
                  placeholder="Precio"
                  className="variante-row__precio"
                />
                <button type="button" className="btn-mini btn-mini--del" onClick={() => delVariante(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="modal__acciones">
            {esEditar && (
              <button type="button" className="btn-danger" onClick={borrar} disabled={guardando}>
                Eliminar
              </button>
            )}
            <div className="modal__acciones-right">
              <button type="button" className="btn-ghost" onClick={onCerrado} disabled={guardando}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
