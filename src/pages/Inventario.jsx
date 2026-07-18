// Página de Gestión de Inventario.
// Sub-pestañas: Productos | Categorías.

import { useState, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext.jsx';
import ProductoForm from '../components/inventario/ProductoForm.jsx';
import CategoriasPanel from '../components/inventario/CategoriasPanel.jsx';
import Toast from '../components/inventario/Toast.jsx';
import { eliminarProducto, actualizarProducto } from '../lib/inventario.js';

export default function Inventario() {
  const [subTab, setSubTab] = useState('productos');

  // Si la sub-pestaña es Categorías, delegar al panel
  if (subTab === 'categorias') {
    return (
      <div className="inv-page">
        <div className="subtabs">
          <button className={`tab ${subTab === 'productos' ? 'tab--active' : ''}`} onClick={() => setSubTab('productos')}>Productos</button>
          <button className={`tab ${subTab === 'categorias' ? 'tab--active' : ''}`} onClick={() => setSubTab('categorias')}>Categorías</button>
        </div>
        <CategoriasPanel />
      </div>
    );
  }

  return (
    <div className="inv-page">
      <div className="subtabs">
        <button className={`tab ${subTab === 'productos' ? 'tab--active' : ''}`} onClick={() => setSubTab('productos')}>Productos</button>
        <button className={`tab ${subTab === 'categorias' ? 'tab--active' : ''}`} onClick={() => setSubTab('categorias')}>Categorías</button>
      </div>
      <ProductosPanel />
    </div>
  );
}

function ProductosPanel() {
  const { productos, categorias, cargando, usandoFallback, recargar } = useInventario();
  const [filtroCat, setFiltroCat] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const mostrarToast = (tipo, mensaje) => setToast({ tipo, mensaje });

  // Filtrado
  const filtrados = useMemo(() => {
    let lista = productos;
    if (filtroCat) lista = lista.filter((p) => p.categoria_id === filtroCat);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter((p) => {
        const enNombre = p.nombre?.toLowerCase().includes(q);
        const enVariantes = p.variantes?.some((v) => v.codigo?.toLowerCase().includes(q));
        return enNombre || enVariantes;
      });
    }
    return lista;
  }, [productos, filtroCat, busqueda]);

  const onGuardado = async () => {
    setModal(null);
    await recargar();
  };

  const toggleActivo = async (p) => {
    const { error } = await actualizarProducto(p.id, { activo: !p.activo });
    if (error) { mostrarToast('error', 'No se pudo actualizar'); return; }
    mostrarToast('ok', p.activo ? 'Desactivado' : 'Activado');
    recargar();
  };

  const borrar = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}" y todas sus variantes?`)) return;
    const { error } = await eliminarProducto(p.id);
    if (error) { mostrarToast('error', 'No se pudo eliminar'); return; }
    mostrarToast('ok', 'Producto eliminado');
    recargar();
  };

  if (cargando) {
    return <div className="inv-loading">Cargando inventario...</div>;
  }

  return (
    <div className="inv">
      {usandoFallback && (
        <div className="inv-banner inv-banner--warn">
          ⚠ Sin conexión a la base de datos. Mostrando inventario local (los cambios no se guardarán).
          <button onClick={recargar}>Reintentar</button>
        </div>
      )}

      <div className="inv-toolbar">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="inv-search"
        />
        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} className="inv-filtro">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <button className="btn-primary inv-new" onClick={() => setModal('nuevo')}>
          + Nuevo
        </button>
      </div>

      <div className="inv-tabla-wrap">
        <table className="inv-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Variantes</th>
              <th>Dim.</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan="6" className="inv-vacio">No hay productos.</td></tr>
            )}
            {filtrados.map((p) => (
              <tr key={p.id} className={!p.activo ? 'fila-off' : ''}>
                <td className="inv-nombre">
                  <strong>{p.nombre}</strong>
                  {p.espesor && <span className="inv-espesor">{p.espesor}</span>}
                </td>
                <td>
                  <span className={`badge-cat badge-cat--${p.categoria?.rol}`}>{p.categoria?.nombre}</span>
                </td>
                <td className="inv-variantes">
                  {p.variantes?.map((v) => (
                    <div key={v.id} className="inv-var">
                      <span className="inv-var__cod">{v.codigo}</span>
                      {v.color && <span className="inv-var__color">{v.color}</span>}
                      <span className="inv-var__precio">{v.precio} Bs</span>
                    </div>
                  ))}
                  {(!p.variantes || p.variantes.length === 0) && <span className="inv-muted">—</span>}
                </td>
                <td className="inv-dim">
                  {p.largo ? `${p.largo}m` : '—'}
                  {p.ancho ? ` × ${p.ancho}m` : ''}
                </td>
                <td>
                  <span className={`estado ${p.activo ? 'estado--on' : 'estado--off'}`}>
                    {p.activo ? 'Activo' : 'Off'}
                  </span>
                </td>
                <td className="inv-acciones">
                  <button className="btn-icon" onClick={() => setModal(p)} title="Editar">✎</button>
                  <button className="btn-icon" onClick={() => toggleActivo(p)} title={p.activo ? 'Desactivar' : 'Activar'}>
                    {p.activo ? '◐' : '○'}
                  </button>
                  <button className="btn-icon btn-icon--del" onClick={() => borrar(p)} title="Eliminar">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ProductoForm
          producto={modal === 'nuevo' ? null : modal}
          categorias={categorias}
          onCerrado={() => setModal(null)}
          onGuardado={onGuardado}
          mostrarToast={mostrarToast}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
