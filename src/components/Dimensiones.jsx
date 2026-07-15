// Dos cajas grandes (Ancho × Largo) con efecto scramble.
// Estilo del wireframe: cajas grandes, números grandes, un × en el medio.

import ScrambleInput from './ScrambleInput.jsx';

export default function Dimensiones({ W, L, setW, setL }) {
  return (
    <div className="scramble-row">
      <ScrambleInput value={W} onChange={setW} label="m" delay={0.1} />
      <span className="scramble-x" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </span>
      <ScrambleInput value={L} onChange={setL} label="m" delay={0.25} />
    </div>
  );
}
