// Número que cicla valores aleatorios (slot machine) y asienta en el valor final.
import { useEffect, useRef, useState } from 'react';

export default function NumeroAnimado({ valor, duracion = 700, formato }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const inicioRef = useRef(0);
  const desdeRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    desdeRef.current = Number(display) || 0;
    inicioRef.current = performance.now();
    const objetivo = Number(valor) || 0;

    const tick = (ahora) => {
      const transcurrido = ahora - inicioRef.current;
      const progreso = Math.min(transcurrido / duracion, 1);
      // easeOutCubic para que empiece rápido y frene
      const eased = 1 - Math.pow(1 - progreso, 3);
      const actual = desdeRef.current + (objetivo - desdeRef.current) * eased;

      if (progreso < 1) {
        // Mientras menos avanzado, más "caótico" (slot machine)
        const caos = (1 - progreso) * (objetivo - desdeRef.current) * 0.25;
        const ruido = (Math.random() - 0.5) * Math.abs(caos);
        setDisplay(Math.round(actual + ruido));
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(objetivo);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, duracion]);

  const texto = formato ? formato(display) : display.toLocaleString('es-BO');
  return <span className="num-animado">{texto}</span>;
}
