// Inputs simples para Ancho y Largo. Sin sliders ni rangos.
// Cuando están vacíos muestran un "0" animado (slot machine 1-9 -> 0).

import CeroAnimado from './CeroAnimado.jsx';

export default function Dimensiones({ W, L, setW, setL }) {
  const Placeholder = () => (
    <span className="placeholder-anim"><CeroAnimado />.00</span>
  );

  return (
    <div className="inputs-row">
      <div className="input-group">
        <label htmlFor="input-W">Ancho (m)</label>
        <div className="input-wrap">
          <input
            id="input-W"
            type="number"
            min="0"
            step="0.01"
            placeholder=""
            value={W}
            onChange={(e) => setW(e.target.value)}
          />
          {!W && <span className="input-placeholder"><Placeholder /></span>}
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="input-L">Largo (m)</label>
        <div className="input-wrap">
          <input
            id="input-L"
            type="number"
            min="0"
            step="0.01"
            placeholder=""
            value={L}
            onChange={(e) => setL(e.target.value)}
          />
          {!L && <span className="input-placeholder"><Placeholder /></span>}
        </div>
      </div>
    </div>
  );
}
