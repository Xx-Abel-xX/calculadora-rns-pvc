// Visualizador: SOLO placas incrustadas + líneas de Unión H si las hay.
// Convención: Largo (L) = horizontal, Ancho (W) = vertical.
//   orientacion 'L' -> placas HORIZONTALES, Unión H VERTICAL
//   orientacion 'W' -> placas VERTICALES,   Unión H HORIZONTAL

import { useEffect, useRef } from 'react';

export default function Visualizador({ W, L, orientacion, cot }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW === 0 || cssH === 0) return;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cssW, cssH);

      const padding = 32;
      const drawW = cssW - padding * 2;
      const drawH = cssH - padding * 2;
      const escala = Math.min(drawW / L, drawH / W);
      const rectW = L * escala;
      const rectH = W * escala;
      const ox = (cssW - rectW) / 2;
      const oy = (cssH - rectH) / 2;

      // Borde
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox, oy, rectW, rectH);

      const placasHorizontales = orientacion === 'L';
      const D_plates = orientacion === 'L' ? L : W;
      const D_perp   = orientacion === 'L' ? W : L;

      // ---- Placas: separadores cada anchoPlaca (perpendicular a las placas) ----
      ctx.strokeStyle = '#a3a3a3';
      ctx.lineWidth = 1;
      // Derivar anchoPlaca desde cot (más robusto que importar constante)
      const anchoPlaca = cot && cot.filas ? D_perp / cot.filas : 0.25;
      const nFilas = cot?.filas ?? Math.ceil(D_perp / 0.25);
      for (let i = 1; i < nFilas; i++) {
        const offset = i * anchoPlaca * escala;
        ctx.beginPath();
        if (placasHorizontales) {
          const y = oy + offset;
          ctx.moveTo(ox, y);
          ctx.lineTo(ox + rectW, y);
        } else {
          const x = ox + offset;
          ctx.moveTo(x, oy);
          ctx.lineTo(x, oy + rectH);
        }
        ctx.stroke();
      }

      // ---- Unión H: cada empalme ----
      if (cot && cot.requiereUnionH && cot.empalmesPorFila > 0) {
        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        const L_plate = cot.L_plate;
        for (let e = 1; e <= cot.empalmesPorFila; e++) {
          const posEmpalme = e * L_plate * escala;
          if (posEmpalme > D_plates * escala) break;
          ctx.beginPath();
          if (placasHorizontales) {
            const x = ox + posEmpalme;
            ctx.moveTo(x, oy);
            ctx.lineTo(x, oy + rectH);
          } else {
            const y = oy + posEmpalme;
            ctx.moveTo(ox, y);
            ctx.lineTo(ox + rectW, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // ---- Etiquetas de dimensiones ----
      ctx.fillStyle = '#737373';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${L} m`, ox + rectW / 2, oy - 12);
      ctx.save();
      ctx.translate(ox - 14, oy + rectH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${W} m`, 0, 0);
      ctx.restore();
    };

    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [W, L, orientacion, cot]);

  // Leyenda: sigue la dirección de la línea H
  const unionHEsVertical = orientacion === 'L';
  const simboloH = unionHEsVertical ? '┃' : '━';

  return (
    <div className="vis-wrap">
      <span className="vis-area">{(W * L).toFixed(2)} m²</span>
      <canvas ref={canvasRef} className="vis-canvas" />
      {cot && cot.requiereUnionH && (
        <span className="vis-leyenda">
          <span className="vis-leyenda__h">{simboloH}</span> Unión H
        </span>
      )}
    </div>
  );
}
