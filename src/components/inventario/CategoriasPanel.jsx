// Panel de gestión de categorías (tabla + CRUD).
// Lista las categorías y permite crear/editar/eliminar/activar.

import { useState } from 'react';
import { useInventario } from '../../context/InventarioContext.jsx';
import CategoriaForm from './CategoriaForm.jsx';
import Toast from './Toast.jsx';
import { actualizarCategoria, eliminarCategoria } from '../../lib/inventario.js';
import { METODOS } from '../../lib/metodos-calculo.js';

export default function CategoriasPanel() {
  const { categorias, recargar, usandoFallback } = useInventario();
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensaje) => setToast({ tipo, mensaje });

  const onGuardado = async () => {
    setModal(null);
    await recargar();
  };

  const toggleActivo = async (c) => {
    const { error } = await actualizarCategoria(c.id, { activo: !c.activo });
    if (error) { mostrarToast('error', 'No se pudo actualizar'); return; }
    mostrarToast('ok', c.activo ? 'Desactivada' : 'Activada');
    recargar();
  };

  const borrar = async (c) => {
    if (!confirm(`¿Eliminar "${c.nombre}" y todos sus productos?`)) return;
    const { error } = await eliminarCategoria(c.id);
    if (error) { mostrarToast('error', 'No se pudo eliminar'); return; }
    mostrarToast('ok', 'Categoría eliminada');
    recargar();
  };

  const ordenMax = categorias.reduce((max, c) => Math.max(max, c.orden || 0), 0);

  return (
    <div className="inv">
      {usandoFallback && (
        <div className="inv-banner inv-banner--warn">
          ⚠ Sin conexión a la base de datos. Los cambios no se guardarán.
          <button onClick={recargar}>Reintentar</button>
        </div>
      )}

      <div className="inv-toolbar">
        <span className="inv-count">{categorias.length} categoría{categorias.length !== 1 ? 's' : ''}</span>
        <button
          className="btn-primary inv-new"
          onClick={() => setModal('nueva')}
        >
          + Nueva categoría
        </button>
      </div>

      <div className="inv-tabla-wrap">
        <table className="inv-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Método</th>
              <th>Parámetros</th>
              <th>Aparece</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 && (
              <tr><td colSpan="7" className="inv-vacio">
                No hay categorías. Creá la primera con "+ Nueva categoría".
              </td></tr>
            )}
            {[...categorias].sort((a, b) => (a.orden || 0) - (b.orden || 0)).map((c) => (
              <tr key={c.id} className={!c.activo ? 'fila-off' : ''}>
                <td className="inv-nombre">
                  <strong>{c.nombre}</strong>
                  <span className="inv-muted">{c.slug}</span>
                </td>
                <td>
                  <span className={`badge-cat badge-cat--${c.rol}`}>{c.rol}</span>
                </td>
                <td className="inv-dim">
                  {c.metodo ? (METODOS[c.metodo]?.label || c.metodo) : <span className="inv-muted">—</span>}
                </td>
                <td className="inv-params">
                  {c.parametros && Object.keys(c.parametros).length > 0 ? (
                    Object.entries(c.parametros).map(([k, v]) => (
                      <span key={k} className="param-chip">{k}: {String(v)}</span>
                    ))
                  ) : (
                    <span className="inv-muted">—</span>
                  )}
                </td>
                <td className="inv-dim">{c.donde_aparece}</td>
                <td>
                  <span className={`estado ${c.activo ? 'estado--on' : 'estado--off'}`}>
                    {c.activo ? 'Activo' : 'Off'}
                  </span>
                </td>
                <td className="inv-acciones">
                  <button className="btn-icon" onClick={() => setModal(c)} title="Editar">✎</button>
                  <button className="btn-icon" onClick={() => toggleActivo(c)} title={c.activo ? 'Desactivar' : 'Activar'}>
                    {c.activo ? '◐' : '○'}
                  </button>
                  <button className="btn-icon btn-icon--del" onClick={() => borrar(c)} title="Eliminar">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CategoriaForm
          categoria={modal === 'nueva' ? null : modal}
          onCerrado={() => setModal(null)}
          onGuardado={onGuardado}
          mostrarToast={mostrarToast}
          siguienteOrden={ordenMax + 1}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
