// ============================================
// INVENTARIO Y PRECIOS DEFAULT - RNS PVC
// Hardcoded. Los precios son editables en sesión
// pero NO persisten (al recargar vuelven a estos).
// ============================================

export const ANCHO_PLACA = 0.25; // metros (estándar)
export const LARGO_PERFIL = 3;   // metros (estándar)

// ---- Catálogo de placas de PVC ----
export const PLACAS = [
  {
    id: 'QAC-UV-6',
    codigo: 'QAC-UV',
    largo: 6,
    espesor: '0.7 mm',
    precio: 67,
  },
  {
    id: 'AU-UVU-6',
    codigo: 'AU-UVU',
    largo: 6,
    espesor: '0.8 mm',
    precio: 72,
  },
  {
    id: 'UVU-4',
    codigo: 'UVU',
    largo: 4,
    espesor: '0.8 mm',
    precio: 50,
  },
];

// ---- Items no-placa del inventario ----
export const ITEMS = {
  montante:      { nombre: 'Montante',           precioDefault: 23 },
  omega:         { nombre: 'Omega',              precioDefault: 22 },
  angulo:        { nombre: 'Angulo',             precioDefault: 13 },
  cornisa:       { nombre: 'Cornisa',            precioDefault: 30 },
  unionH:        { nombre: 'Unión H',            precioDefault: 30 },
  tornilloT1:    { nombre: 'Tornillo T1',        precioDefault: 40 },
  tornilloTarugo:{ nombre: 'Tornillo y Tarugo',  precioDefault: 25 },
};

// ---- Servicios ----
export const SERVICIOS = {
  manoObra:   { nombre: 'Mano de Obra',     precioDefault: 30,  unidad: 'Bs/m²' },
  obraVendida:{ nombre: 'Obra Vendida',     precioDefault: 140, unidad: 'Bs/m²' },
};

// Helper: genera el objeto de precios por defecto (clave -> precio)
export function preciosPorDefecto() {
  const precios = {};
  for (const p of PLACAS) {
    precios[`placa:${p.id}`] = p.precio;
  }
  for (const [clave, item] of Object.entries(ITEMS)) {
    precios[clave] = item.precioDefault;
  }
  precios.manoObra = SERVICIOS.manoObra.precioDefault;
  precios.obraVendida = SERVICIOS.obraVendida.precioDefault;
  return precios;
}
