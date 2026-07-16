// Logo de RNS PVC: casa con techo rojo sobre olas azules.
// SVG vectorial, escalable, sin dependencias de imágenes externas.

export default function LogoRNS({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RNS PVC"
    >
      {/* Ondas / olas (base azul) */}
      <path d="M0 70 Q15 60 30 70 T60 70 T90 70 T120 70 V90 H0 Z" fill="#1e6fb8" />
      <path d="M0 75 Q15 67 30 75 T60 75 T90 75 T120 75 V90 H0 Z" fill="#2d8fd1" opacity="0.7" />

      {/* Cuerpo de la casa (blanco/crema) */}
      <rect x="38" y="42" width="44" height="30" fill="#ffffff" stroke="#0a0a0a" strokeWidth="1.5" />

      {/* Techo (rojo) */}
      <path d="M30 44 L60 20 L90 44 Z" fill="#d63d2e" stroke="#0a0a0a" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Puerta */}
      <rect x="54" y="54" width="12" height="18" fill="#0a0a0a" />

      {/* Ventanas */}
      <rect x="42" y="48" width="8" height="8" fill="#2d8fd1" stroke="#0a0a0a" strokeWidth="1" />
      <rect x="70" y="48" width="8" height="8" fill="#2d8fd1" stroke="#0a0a0a" strokeWidth="1" />
    </svg>
  );
}
