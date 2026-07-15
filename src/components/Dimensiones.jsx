// Inputs simples para Ancho y Largo. Sin sliders ni rangos.

export default function Dimensiones({ W, L, setW, setL }) {
  return (
    <div className="inputs-row">
      <div className="input-group">
        <label htmlFor="input-W">Ancho (m)</label>
        <input
          id="input-W"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={W}
          onChange={(e) => setW(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="input-L">Largo (m)</label>
        <input
          id="input-L"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={L}
          onChange={(e) => setL(e.target.value)}
        />
      </div>
    </div>
  );
}
