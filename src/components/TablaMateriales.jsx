// Tabla de materiales. Columnas: Detalle · Cant (editable) · PU (editable) · Subtotal.
// Solo Cant y PU son editables. Unión H aparece solo si requiere.
// Los servicios (Mano de Obra, Obra Vendida) van FUERA de la tabla.

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
  subtotalMateriales,
  totalFinal,
  conManoObra,
  montoManoObra,
  conObraVendida,
  area,
  areaFacturable,
  esAreaMinima,
}) {
  return (
    <div className={`tabla-wrap ${conObraVendida ? 'tabla-wrap--disabled' : ''}`}>
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
              <tr key={f.clave} className={f.modificado ? 'fila-mod' : ''}>
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

      {/* Footer de totales */}
      <div className="tabla-footer">
        {!conObraVendida ? (
          <div className="totales">
            <div className="linea-sub">
              <span>Subtotal materiales</span>
              <span><NumeroAnimado valor={subtotalMateriales} duracion={300} /> Bs</span>
            </div>
            {conManoObra && (
              <div className="linea-sub">
                <span>
                  Mano de Obra
                  {esAreaMinima && <span className="nota-area-min"> · mín 9 m²</span>}
                </span>
                <span><NumeroAnimado valor={montoManoObra} duracion={300} /> Bs</span>
              </div>
            )}
            <div className="linea-total">
              <span>Total</span>
              <span><NumeroAnimado valor={totalFinal} duracion={350} /> Bs</span>
            </div>
          </div>
        ) : (
          <div className="totales">
            <div className="linea-obra-vendida">
              <span>
                Obra Vendida ({Math.ceil(areaFacturable)} m² × 140)
                {esAreaMinima && <span className="nota-area-min"> · mín 9 m²</span>}
              </span>
            </div>
            <div className="linea-total">
              <span>Total</span>
              <span><NumeroAnimado valor={totalFinal} duracion={350} /> Bs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
