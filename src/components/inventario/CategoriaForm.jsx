// Modal para crear/editar una categoría.
// Campos dinámicos según el método de cálculo elegido.

import { useState, useEffect } from 'react';
import { METODOS, ROLES, DONDE_APARECE } from '../../lib/metodos-calculo.js';
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '../../lib/inventario.js';

const VACIO = {
  nombre: '',
  slug: '',
  rol: 'perfil',
  metodo: 'perimetral',
  parametros: {},
  donde_aparece: 'tabla',
  unidad_default: 'pza',
  requiere_dimensiones: false,
  requiere_color: false,
  orden: 0,
  activo: true,
};

// Genera un slug a partir del nombre
function slugizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function CategoriaForm({
  categoria,  // null = crear; objeto = editar
  onCerrado,
  onGuardado,
  mostrarToast,
  siguienteOrden,
}) {
  const esEditar = Boolean(categoria);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [slugAuto, setSlugAuto] = useState(true);

  useEffect(() => {
    if (categoria) {
      setForm({
        ...VACIO,
        ...categoria,
        parametros: { ...(categoria.parametros || {}) },
      });
      setSlugAuto(false);
    }
  }, [categoria]);

  const set = (campo, val) => setForm((f) => ({ ...f, [campo]: val }));

  const setParam = (key, val) => {
    setForm((f) => ({
      ...f,
      parametros: { ...f.parametros, [key]: val },
    }));
  };

  // Auto-generar slug cuando cambia el nombre
  const onNombreChange = (val) => {
    set('nombre', val);
    if (slugAuto) {
      set('slug', slugizar(val));
    }
  };

  const metodoInfo = METODOS[form.metodo];

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre) {
      mostrarToast('error', 'El nombre es obligatorio');
      return;
    }
    if (!form.slug) {
      set('slug', slugizar(form.nombre));
    }
    setGuardando(true);

    // Convertir parámetros a números donde corresponda
    const paramsLimpios = {};
    for (const p of (metodoInfo?.parametros || [])) {
      const val = form.parametros[p.key];
      if (p.tipo === 'bool') {
        paramsLimpios[p.key] = Boolean(val);
      } else {
        paramsLimpios[p.key] = val !== undefined && val !== '' ? Number(val) : p.default;
      }
    }

    const payload = {
      nombre: form.nombre,
      slug: form.slug || slugizar(form.nombre),
      rol: form.rol,
      metodo: form.metodo,
      parametros: paramsLimpios,
      donde_aparece: form.donde_aparece,
      unidad_default: form.unidad_default,
      requiere_dimensiones: form.requiere_dimensiones,
      requiere_color: form.requiere_color,
      orden: Number(form.orden) || 0,
      activo: form.activo,
    };

    let error;
    if (esEditar) {
      const res = await actualizarCategoria(categoria.id, payload);
      error = res.error;
    } else {
      const res = await crearCategoria(payload);
      error = res.error;
    }

    setGuardando(false);
    if (error) {
      mostrarToast('error', error.message?.includes('duplicate') ? 'Ya existe una categoría con ese slug' : 'Error al guardar');
      return;
    }
    mostrarToast('ok', esEditar ? 'Categoría actualizada' : 'Categoría creada');
    onGuardado();
  };

  const borrar = async () => {
    if (!confirm(`¿Eliminar "${categoria.nombre}" y todos sus productos?`)) return;
    setGuardando(true);
    const { error } = await eliminarCategoria(categoria.id);
    setGuardando(false);
    if (error) { mostrarToast('error', 'No se pudo eliminar'); return; }
    mostrarToast('ok', 'Categoría eliminada');
    onGuardado();
  };

  return (
    <div className="modal-overlay" onClick={onCerrado}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2>{esEditar ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button type="button" className="modal__close" onClick={onCerrado}>✕</button>
        </div>

        <form onSubmit={guardar} className="modal__form">
          <div className="campo">
            <label>Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => onNombreChange(e.target.value)} required autoFocus />
          </div>

          <div className="campos-row campos-row--2">
            <div className="campo">
              <label>Slug (clave interna)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugAuto(false); set('slug', e.target.value); }}
                placeholder="auto"
              />
            </div>
            <div className="campo">
              <label>Orden</label>
              <input type="number" value={form.orden} onChange={(e) => set('orden', e.target.value)} />
            </div>
          </div>

          <div className="campo">
            <label>Rol *</label>
            <select value={form.rol} onChange={(e) => set('rol', e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Método de cálculo *</label>
            <select
              value={form.metodo}
              onChange={(e) => { set('metodo', e.target.value); set('parametros', {}); }}
            >
              {Object.entries(METODOS).map(([key, m]) => (
                <option key={key} value={key}>{m.label}</option>
              ))}
            </select>
            {metodoInfo?.descripcion && (
              <small className="campo__help">{metodoInfo.descripcion}</small>
            )}
          </div>

          {/* Parámetros dinámicos según el método */}
          {metodoInfo?.parametros?.length > 0 && (
            <div className="parametros">
              <strong className="parametros__title">Parámetros del cálculo</strong>
              {metodoInfo.parametros.map((p) => (
                <div className="campo" key={p.key}>
                  <label>{p.label}</label>
                  {p.tipo === 'bool' ? (
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={Boolean(form.parametros[p.key] ?? p.default)}
                        onChange={(e) => setParam(p.key, e.target.checked)}
                      />
                      <span>Sí</span>
                    </label>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      value={form.parametros[p.key] ?? ''}
                      onChange={(e) => setParam(p.key, e.target.value)}
                      placeholder={String(p.default)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="campo">
            <label>Dónde aparece</label>
            <select value={form.donde_aparece} onChange={(e) => set('donde_aparece', e.target.value)}>
              {Object.entries(DONDE_APARECE).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="campos-row campos-row--2">
            <div className="campo">
              <label>Unidad</label>
              <input type="text" value={form.unidad_default} onChange={(e) => set('unidad_default', e.target.value)} placeholder="pza" />
            </div>
          </div>

          <div className="checks-row">
            <label className="check">
              <input type="checkbox" checked={form.requiere_dimensiones} onChange={(e) => set('requiere_dimensiones', e.target.checked)} />
              <span>Requiere dimensiones</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={form.requiere_color} onChange={(e) => set('requiere_color', e.target.checked)} />
              <span>Requiere color</span>
            </label>
            <label className="check">
              <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
              <span>Activo</span>
            </label>
          </div>

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
