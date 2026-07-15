// Cero animado: al montarse muestra números random (1-9) cambiando rápido
// y en 0.5s termina en 0. Cada instancia es independiente (random propio).

import { useEffect, useRef, useState } from 'react';

export default function CeroAnimado({ duracion = 500 }) {
  const [n, setN] = useState(Math.floor(Math.random() * 9) + 1);
  const raf = useRef(null);

  useEffect(() => {
    const inicio = performance.now();
    const tick = (ahora) => {
      const t = (ahora - inicio) / duracion;
      if (t < 1) {
        setN(Math.floor(Math.random() * 9) + 1); // 1-9
        // cuanto más cerca del final, más lento cambia
        const delay = 30 + t * t * 120;
        raf.current = setTimeout(() => requestAnimationFrame(tick), delay);
      } else {
        setN(0);
      }
    };
    raf.current = setTimeout(() => requestAnimationFrame(tick), 30);
    return () => clearTimeout(raf.current);
  }, [duracion]);

  return <span className="cero-anim">{n}</span>;
}
