// Input grande tipo "caja" con efecto scramble: números random 1-9 por 500ms,
// luego se asienta en 0. Cada caja es independiente.

import { useEffect, useRef, useState } from 'react';

export default function ScrambleInput({ value, onChange, label = 'm', delay = 0 }) {
  const [display, setDisplay] = useState(' ');
  const [animando, setAnimando] = useState(true);
  const intervalo = useRef(null);
  const timeout1 = useRef(null);
  const timeout2 = useRef(null);

  useEffect(() => {
    const iniciar = () => {
      intervalo.current = setInterval(() => {
        setDisplay(String(Math.floor(Math.random() * 9) + 1));
      }, 50);

      timeout2.current = setTimeout(() => {
        clearInterval(intervalo.current);
        setDisplay('0');
        setAnimando(false);
        onChange('0');
      }, 500);
    };

    timeout1.current = setTimeout(iniciar, delay * 1000);

    return () => {
      clearInterval(intervalo.current);
      clearTimeout(timeout1.current);
      clearTimeout(timeout2.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="scramble">
      {label && <span className="scramble__label">{label}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={animando ? display : value}
        onChange={(e) => {
          if (!animando) {
            onChange(e.target.value.replace(/[^0-9.]/g, ''));
          }
        }}
        onFocus={(e) => {
          if (value === '0' && !animando) {
            onChange('');
          } else {
            e.target.select();
          }
        }}
        onBlur={(e) => {
          if (e.target.value === '' && !animando) {
            onChange('0');
          }
        }}
        readOnly={animando}
        className="scramble__input"
      />
    </div>
  );
}
