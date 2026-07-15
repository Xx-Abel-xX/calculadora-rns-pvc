// Tabla de materiales. Columnas: Detalle · Cant (editable) · PU (editable) · Subtotal.
// Solo Cant y PU son editables. Unión H aparece solo si requiere.
// Mano de Obra y Obra Vendida como filas (toggles, off por defecto).

function Spinner({ value, onChange, step = 1, min = 0 }) {
  const inc = () => onChange(Number(value) + step);
  const dec = () => onChange(Math.max(min, Number(value) - step));
  return (
    <div className="spinner">
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="spinner__input"
      />
      <span className="spinner__btns">
        <button type="button" onClick={inc} aria-label="Subir">▴</button>
        <button type="button" onClick={dec} aria-label="Bajar">▾</button>
      </span>
    </div>
  );
}

export default function TablaMateriales({
  filas,
  editarCelda,
  restablecerFila,
  conManoObra,
  setConManoObra,
  conObraVendida,
  setConObraVendida,
  subtotalMateriales,
  totalFinal,
}) {
  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            <th>Detalle</th>
            <th className="col-num">Cant.</th>
            <th className="col-num">PU</th>
            <th className="col-num">Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.clave} className={f.esServicio ? 'fila-servicio' : (f.modificado ? 'fila-mod' : '')}>
              <td className="col-nombre">
                {f.detalle}
                {f.nota && !f.modificado && <span className="nota" title={f.nota}> · {f.nota}</span>}
                {f.modificado && <span className="marca" title="Modificado">●</span>}
              </td>
              <td className="col-num">
                {f.editable ? (
                  <Spinner
                    value={f.cantidad}
                    onChange={(v) => editarCelda(f.clave, 'cantidad', v)}
                    step={1}
                  />
                ) : (
                  <span>{f.cantidad}</span>
                )}
              </td>
              <td className="col-num">
                {f.editable ? (
                  <Spinner
                    value={f.precio}
                    onChange={(v) => editarCelda(f.clave, 'precio', v)}
                    step={1}
                  />
                ) : (
                  <span>{f.precio}</span>
                )}
              </td>
              <td className="col-num col-subtotal">{f.subtotal.toLocaleString('es-BO')}</td>
              <td className="col-accion">
                {f.modificado && (
                  <button
                    type="button"
                    className="btn-reset"
                    onClick={() => restablecerFila(f.clave)}
                    title="Restablecer"
                  >↺</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Toggles de servicios */}
      <div className="tabla-footer">
        <div className="toggles">
          <label className="check">
            <input
              type="checkbox"
              checked={conManoObra}
              onChange={(e) => setConManoObra(e.target.checked)}
            />
            <span>Mano de Obra</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={conObraVendida}
              onChange={(e) => setConObraVendida(e.target.checked)}
            />
            <span>Obra Vendida</span>
          </label>
        </div>

        <div className="totales">
          <div className="linea-sub">
            <span>Subtotal</span>
            <span>{subtotalMateriales.toLocaleString('es-BO')} Bs</span>
          </div>
          <div className="linea-total">
            <span>Total</span>
            <span>{totalFinal.toLocaleString('es-BO')} Bs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
