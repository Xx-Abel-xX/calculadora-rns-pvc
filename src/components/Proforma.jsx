// Proforma en limpio (diseño RNS PVC).
// Replica el formato de la empresa: header, tabla, A Cuenta/Saldo, firmas.
// Se abre con el botón "Compartir" y se puede imprimir / guardar como PDF.

import { useState, useMemo, useEffect, useRef } from 'react';

// El logo está en public/, se referencia con ruta absoluta relativa al base.
const logoUrl = `${import.meta.env.BASE_URL}logo-rns.png`;

// Hook: calcula el scale para que un elemento de ancho fijo entre en el viewport
function useEscalarEnViewport(anchoDoc = 800) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      // Deja 16px de margen total
      const disponible = vw - 16;
      setScale(Math.min(1, disponible / anchoDoc));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [anchoDoc]);
  return scale;
}

// Genera el siguiente número de proforma y lo guarda (localStorage por ahora)
function siguienteNumeroProforma() {
  const actual = Number(localStorage.getItem('rns_proforma_n') || '405');
  const siguiente = actual + 1;
  localStorage.setItem('rns_proforma_n', String(siguiente));
  return String(siguiente).padStart(6, '0');
}

function fechaLarga(d = new Date()) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return {
    dia: String(d.getDate()).padStart(2, '0'),
    mes: meses[d.getMonth()],
    anio: String(d.getFullYear()),
  };
}

export default function Proforma({ cot, onCerrar }) {
  const numero = useMemo(() => siguienteNumeroProforma(), []);
  const fecha = useMemo(() => fechaLarga(), []);
  const scale = useEscalarEnViewport(800);

  // Datos del cliente (editables en la proforma)
  const [cliente, setCliente] = useState({ nombre: '', direccion: '', telefono: '' });
  const [aCuenta, setACuenta] = useState('');

  const total = cot.totalFinal;
  const saldo = aCuenta !== '' ? Math.max(0, total - Number(aCuenta)) : '';

  // Filas a mostrar (omite las que están en 0)
  const filasVisibles = cot.filas.filter((f) => f.cantidad > 0 || f.subtotal > 0);

  return (
    <div className="prof-overlay">
      <div className="prof-toolbar no-print" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <button className="btn-ghost" onClick={onCerrar}>← Volver</button>
        <button className="btn-primary" onClick={() => window.print()}>Imprimir / PDF</button>
      </div>

      <div
        className="prof-scaler"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: 800,
          margin: '0 auto',
        }}
      >
        <div className="prof-doc">
        {/* Header */}
        <div className="prof-head">
          <div className="prof-head__izq">
            <img src={logoUrl} alt="RNS PVC" className="prof-logo" />
            <div className="prof-head__empresa">
              <strong>RNS PVC</strong>
              <span>Olivera</span>
              <span>📞 57417445</span>
              <span>📍 Of. Central: 4to. anillo, radial 13</span>
              <span>Santa Cruz - Bolivia</span>
            </div>
          </div>

          <div className="prof-head__medio">
            <span>Ventas al<br/>por mayor<br/>y menor</span>
          </div>

          <div className="prof-head__der">
            <div className="prof-fecha">
              <div>
                <small>Día</small>
                <span>{fecha.dia}</span>
              </div>
              <div>
                <small>Mes</small>
                <span className="prof-fecha__mes">{fecha.mes}</span>
              </div>
              <div>
                <small>Año</small>
                <span>{fecha.anio}</span>
              </div>
            </div>
            <div className="prof-badge">Material Garantizado</div>
            <div className="prof-titulo">
              <h1>PRO-FORMA</h1>
              <div className="prof-num">Nº {numero}</div>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="prof-cliente">
          <div className="prof-linea">
            <label>Señor(es):</label>
            <input
              type="text"
              value={cliente.nombre}
              onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))}
            />
          </div>
          <div className="prof-linea-row">
            <div className="prof-linea">
              <label>Dirección:</label>
              <input
                type="text"
                value={cliente.direccion}
                onChange={(e) => setCliente((c) => ({ ...c, direccion: e.target.value }))}
              />
            </div>
            <div className="prof-linea prof-linea--chica">
              <label>Telf.:</label>
              <input
                type="text"
                value={cliente.telefono}
                onChange={(e) => setCliente((c) => ({ ...c, telefono: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="prof-tabla">
          <div className="prof-tabla__head">
            <span>Cant.</span>
            <span>Detalle</span>
            <span>P. Unit.</span>
            <span>Total</span>
          </div>
          <div className="prof-tabla__body">
            {filasVisibles.map((f) => (
              <div className="prof-tabla__fila" key={f.clave}>
                <span>{f.esManoObra ? '' : f.cantidad}</span>
                <span>{f.detalle}</span>
                <span>{f.esManoObra ? '' : f.precio}</span>
                <span>{f.subtotal.toLocaleString('es-BO')}</span>
              </div>
            ))}
            {/* Rellenar con filas vacías si hay menos de 12 */}
            {Array.from({ length: Math.max(0, 12 - filasVisibles.length) }).map((_, i) => (
              <div className="prof-tabla__fila prof-tabla__fila--vacia" key={`vacia-${i}`}>
                <span>&nbsp;</span><span></span><span></span><span></span>
              </div>
            ))}
          </div>

          {/* Footer de la tabla: A Cuenta / Saldo / Total */}
          <div className="prof-tabla__foot">
            <div className="prof-ac">
              <label>A Cuenta</label>
              <input
                type="number"
                value={aCuenta}
                onChange={(e) => setACuenta(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="prof-ac">
              <label>Saldo</label>
              <input type="text" value={saldo} readOnly placeholder="0" />
            </div>
            <div className="prof-total-label">TOTAL<br/>Bs.</div>
            <div className="prof-total-val">{total.toLocaleString('es-BO')}</div>
          </div>
        </div>

        {/* Firmas */}
        <div className="prof-firmas">
          <div className="prof-firma">Entregué Conforme</div>
          <div className="prof-firma">Recibí Conforme</div>
        </div>
        </div>
      </div>
    </div>
  );
}
