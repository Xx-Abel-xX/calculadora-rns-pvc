import { useCotizacion } from './hooks/useCotizacion.js';
import Dimensiones from './components/Dimensiones.jsx';
import TablaMateriales from './components/TablaMateriales.jsx';
import Visualizador from './components/Visualizador.jsx';
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

            {/* Tabla debajo */}
            <TablaMateriales
              filas={cot.filas}
              editarCelda={cot.editarCelda}
              restablecerFila={cot.restablecerFila}
              conManoObra={cot.conManoObra}
              setConManoObra={cot.setConManoObra}
              conObraVendida={cot.conObraVendida}
              setConObraVendida={cot.setConObraVendida}
              subtotalMateriales={cot.subtotalMateriales}
              totalFinal={cot.totalFinal}
            />

            <div className="acciones no-print">
              <input
                type="text"
                placeholder="Cliente (opcional)"
                value={cot.cliente}
                onChange={(e) => cot.setCliente(e.target.value)}
                className="input-cliente"
              />
              <button type="button" className="btn-print" onClick={() => window.print()}>
                Imprimir / PDF
              </button>
            </div>

            {/* Bloque de impresión */}
            <div className="print-only">
              <header className="print-header">
                <h1>RNS PVC</h1>
                <p>Cotización de Cielo Falso · Santa Cruz, Bolivia</p>
              </header>
              <section className="print-datos">
                <p><strong>Cliente:</strong> {cot.cliente || '—'}</p>
                <p><strong>Dimensiones:</strong> {cot.W} m × {cot.L} m = {cot.cot.area.toFixed(2)} m²</p>
                <p><strong>Placa:</strong> {cot.placa.codigo} {cot.placa.largo}m ({cot.placa.espesor})</p>
                <p><strong>Orientación:</strong> {cot.orientacion === 'L' ? 'Largo' : 'Ancho'}</p>
              </section>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Detalle</th><th>Cant.</th><th>PU</th><th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cot.filas.map((f) => (
                    <tr key={f.clave}>
                      <td>{f.detalle}</td>
                      <td>{f.cantidad}</td>
                      <td>{f.precio}</td>
                      <td>{f.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="print-total">
                <p>Total: <strong>{cot.totalFinal} Bs</strong></p>
              </div>
            </div>
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
