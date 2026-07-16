// Toast de notificaciones (éxito/error).
import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.tipo}`}>
      <span>{toast.tipo === 'ok' ? '✓' : '✗'}</span>
      <span>{toast.mensaje}</span>
    </div>
  );
}
