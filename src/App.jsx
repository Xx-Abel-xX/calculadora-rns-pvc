import { useCotizacion } from './hooks/useCotizacion.js';
import Dimensiones from './components/Dimensiones.jsx';
import TablaMateriales from './components/TablaMateriales.jsx';
import Visualizador from './components/Visualizador.jsx';
import NumeroAnimado from './components/NumeroAnimado.jsx';
import { PLACAS } from './data/inventario.js';

export default function App() {
  const cot = useCotizacion();

  return (
    <>
      <header className="header no-print">
        <div className="header__brand">
          <span className="header__logo">RNS</span>
          <span className="header__name">Cotizador PVC</span>
        </div>
      </header>

      <main className="main">
        {/* Panel de entradas */}
        <section className="panel no-print">
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
            {/* Controles arriba del gráfico */}
            <div className="resultado__controles">
              <div className="ctrl-group">
                <label>Material</label>
                <select
                  value={cot.placaIdManual ?? ''}
                  onChange={(e) => cot.setMaterial(e.target.value || null)}
                >
                  <option value="">{cot.placa.codigo} {cot.placa.largo}m (óptimo)</option>
                  {PLACAS.map((p) => (
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
                  title="Presioná para cambiar la orientación"
                >
                  {cot.orientacion === 'L' ? 'Largo' : 'Ancho'}
                </button>
              </div>
            </div>

            {/* Gráfico centrado y grande */}
            <div className="resultado__grafico">
              <Visualizador
                W={Number(cot.W)}
                L={Number(cot.L)}
                orientacion={cot.orientacion}
                cot={cot.cot}
              />
            </div>

            {/* Selector de variante/color antes de la tabla */}
            <div className="variante-selector">
              <label htmlFor="select-variante">Color / Código</label>
              <select
                id="select-variante"
                value={cot.varianteIdx[cot.placa.id] ?? 0}
                onChange={(e) => cot.setVarianteIdx((prev) => ({ ...prev, [cot.placa.id]: Number(e.target.value) }))}
              >
                {cot.placa.variantes.map((v, i) => (
                  <option key={v.codigo} value={i}>
                    {v.codigo} · {v.color}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles de servicios FUERA de la tabla (con precio editable) */}
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
                {cot.conManoObra && !cot.conObraVendida && (
                  <div className="servicio-precio">
                    <input
                      type="number"
                      min="0"
                      value={cot.precios.manoObra}
                      onChange={(e) => cot.setPrecioServicio('manoObra', e.target.value)}
                      className="servicio-precio__input"
                    />
                    <span className="servicio-precio__unidad">Bs/m²</span>
                  </div>
                )}
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
                      value={cot.precios.obraVendida}
                      onChange={(e) => cot.setPrecioServicio('obraVendida', e.target.value)}
                      className="servicio-precio__input"
                    />
                    <span className="servicio-precio__unidad">Bs/m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla debajo */}
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
          </section>
        ) : (
          <section className="placeholder no-print">
            <p>Ingresá las dimensiones y presioná <strong>Calcular</strong>.</p>
          </section>
        )}
      </main>

      <footer className="footer no-print">
        <p>Cantidades y precios referenciales.</p>
      </footer>
    </>
  );
}
