// Página del Cotizador (la app original, ahora movida a su propia página).

import { useState } from 'react';
import { useCotizacion } from '../hooks/useCotizacion.js';
import Dimensiones from '../components/Dimensiones.jsx';
import TablaMateriales from '../components/TablaMateriales.jsx';
import Visualizador from '../components/Visualizador.jsx';
import Proforma from '../components/Proforma.jsx';

export default function Cotizador() {
  const cot = useCotizacion();
  const [verProforma, setVerProforma] = useState(false);

  if (cot.placasDisponibles.length === 0) {
    return (
      <div className="placeholder">
        <p>No hay placas cargadas en el inventario.</p>
        <p>Agregá placas desde la sección <strong>Inventario</strong>.</p>
      </div>
    );
  }

  return (
    <>
      {/* Panel de entradas */}
      <section className="panel">
        <h2 className="panel__title">Datos</h2>
        <Dimensiones
          W={cot.W}
          L={cot.L}
          setW={cot.setW}
          setL={cot.setL}
        />
        <button
          type="button"
          className="btn-calc"
          onClick={cot.calcular}
          disabled={!Number(cot.W) || !Number(cot.L)}
        >
          Calcular
        </button>
      </section>

      {/* Resultado */}
      {cot.calculado && cot.cot ? (
        <section className="resultado">
          {/* Controles */}
          <div className="resultado__controles">
            <div className="ctrl-group">
              <label>Material</label>
              <select
                value={cot.placaIdManual ?? ''}
                onChange={(e) => cot.setMaterial(e.target.value || null)}
              >
                <option value="">{cot.placa.codigo} {cot.placa.largo}m (óptimo)</option>
                {cot.placasDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} · {p.largo}m · {p.espesor}
                  </option>
                ))}
              </select>
            </div>
            <div className="ctrl-group ctrl-group--btn">
              <label>Orientación</label>
              <button
                type="button"
                className={`ori-toggle ${cot.esOptima ? 'ori-toggle--optima' : ''}`}
                onClick={cot.toggleOrientacion}
              >
                {cot.orientacion === 'L' ? 'Largo' : 'Ancho'}
              </button>
            </div>
          </div>

          {/* Gráfico */}
          <div className="resultado__grafico">
            <Visualizador
              W={Number(cot.W)}
              L={Number(cot.L)}
              orientacion={cot.orientacion}
              cot={cot.cot}
            />
          </div>

          {/* Selector de variante/color */}
          {cot.placa.variantes.length > 1 && (
            <div className="variante-selector">
              <label htmlFor="select-variante">Color / Código</label>
              <select
                id="select-variante"
                value={cot.varianteIdx[cot.placa.id] ?? 0}
                onChange={(e) => cot.setVarianteIdx((prev) => ({ ...prev, [cot.placa.id]: Number(e.target.value) }))}
              >
                {cot.placa.variantes.map((v, i) => (
                  <option key={v.id ?? i} value={i}>
                    {v.codigo} · {v.color}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggles de servicios */}
          <div className="servicios-toggle">
            <div className={`servicio-item ${cot.conObraVendida ? 'servicio-item--disabled' : ''}`}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={cot.conManoObra}
                  onChange={(e) => cot.setConManoObra(e.target.checked)}
                  disabled={cot.conObraVendida}
                />
                <span>Mano de Obra</span>
              </label>
            </div>
            <div className="servicio-item">
              <label className="check">
                <input
                  type="checkbox"
                  checked={cot.conObraVendida}
                  onChange={(e) => cot.setConObraVendida(e.target.checked)}
                />
                <span>Obra Vendida</span>
              </label>
              {cot.conObraVendida && (
                <div className="servicio-precio">
                  <input
                    type="number"
                    min="0"
                    value={cot.precios.obraVendida ?? 140}
                    onChange={(e) => cot.setPrecioServicio('obraVendida', e.target.value)}
                    className="servicio-precio__input"
                  />
                  <span className="servicio-precio__unidad">Bs/m²</span>
                </div>
              )}
            </div>
          </div>

          <TablaMateriales
            filas={cot.filas}
            editarCelda={cot.editarCelda}
            restablecerFila={cot.restablecerFila}
            subtotalMateriales={cot.subtotalMateriales}
            totalFinal={cot.totalFinal}
            conManoObra={cot.conManoObra}
            montoManoObra={cot.montoManoObra}
            conObraVendida={cot.conObraVendida}
            area={cot.cot.area}
            areaFacturable={cot.areaFacturable}
            esAreaMinima={cot.areaFacturable > cot.cot.area}
          />

          {/* Botón Compartir */}
          <div className="compartir-wrap">
            <button className="btn-compartir" onClick={() => setVerProforma(true)}>
              Compartir
            </button>
          </div>

          {/* Proforma en limpio */}
          {verProforma && (
            <Proforma cot={cot} onCerrar={() => setVerProforma(false)} />
          )}
        </section>
      ) : (
        <section className="placeholder">
          <p>Ingresá las dimensiones y presioná <strong>Calcular</strong>.</p>
        </section>
      )}
    </>
  );
}
