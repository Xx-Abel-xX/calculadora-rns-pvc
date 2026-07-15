// Tabla de materiales. Columnas: Detalle · Cant (editable) · PU (editable) · Subtotal.
// Solo Cant y PU son editables. Unión H aparece solo si requiere.
// Mano de Obra y Obra Vendida como filas (toggles, off por defecto).

import NumeroAnimado from './NumeroAnimado.jsx';

function Spinner({ value, onChange, step = 1, min = 0 }) {
  const inc = () => onChange(Number(value) + step);
  const dec = () => onChange(Math.max(min, Number(value) - step));
  return (
    <div className="spinner">
      <button type="button" className="spinner__step" onClick={dec} aria-label="Restar">−</button>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="spinner__input"
      />
      <button type="button" className="spinner__step" onClick={inc} aria-label="Sumar">+</button>
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
     <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Detalle</th>
            <th className="col-num">Cant.</th>
            <th className="col-num">PU</th>
            <th className="col-num">Subtotal</th>
            <th className="col-rest"></th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.clave} className={f.esServicio ? 'fila-servicio' : (f.modificado ? 'fila-mod' : '')}>
              <td className="col-nombre">
                {f.detalle}
                {f.nota && !f.modificado && <span className="nota"> · {f.nota}</span>}
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
              <td className="col-num col-subtotal"><NumeroAnimado valor={f.subtotal} duracion={250} /></td>
              <td className="col-rest">
                {f.modificado && (
                  <button
                    type="button"
                    className="btn-reset"
                    onClick={() => restablecerFila(f.clave)}
                    aria-label="Restablecer"
                  >↺</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
     </div>

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
            <span><NumeroAnimado valor={subtotalMateriales} duracion={300} /> Bs</span>
          </div>
          <div className="linea-total">
            <span>Total</span>
            <span><NumeroAnimado valor={totalFinal} duracion={350} /> Bs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
