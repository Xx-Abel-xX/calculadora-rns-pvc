// Splash de presentación: barras + RNS PVC animadas al centro, luego desaparece.
import { useEffect, useState } from 'react';

export default function IntroSplash({ onFinish }) {
  const [fase, setFase] = useState('in'); // 'in' -> 'out'

  useEffect(() => {
    const t1 = setTimeout(() => setFase('out'), 1400);
    const t2 = setTimeout(() => onFinish(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <div className={`splash ${fase === 'out' ? 'splash--out' : ''}`}>
      <div className="splash__logo">
        <div className="splash__bars">
          <span className="splash__bar splash__bar--1" />
          <span className="splash__bar splash__bar--2" />
          <span className="splash__bar splash__bar--3" />
        </div>
        <div className="splash__text">
          <strong>RNS</strong> PVC
        </div>
        <div className="splash__sub">Cotizador</div>
      </div>
    </div>
  );
}
