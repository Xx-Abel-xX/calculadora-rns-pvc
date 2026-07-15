// ============================================
// INVENTARIO Y PRECIOS DEFAULT - RNS PVC
// Códigos de tienda reales para identificación.
// ============================================

export const ANCHO_PLACA = 0.25; // metros (estándar)
export const LARGO_PERFIL = 3;   // metros (estándar)

// ---- Catálogo de placas de PVC ----
// Cada placa (material) tiene variantes por color, cada una con su código de tienda.
// Se agrupa por familia (QAC-UV, AU-UVU, UVU) y por largo (6m o 4m).
export const PLACAS = [
  {
    id: 'QAC-UV-6',
    familia: 'QAC-UV',
    largo: 6,
    espesor: '0.7 mm',
    precio: 67,
    variantes: [
      { codigo: 'QAC-2543', color: 'Madera Acanelado' },
      { codigo: 'QAC-2541', color: 'Blanco Franja' },
      { codigo: 'QAC-2524', color: 'Madera Nogal' },
      { codigo: 'QAC-2500', color: 'Blanco' },
      { codigo: 'QAC-2532', color: 'Madera' },
    ],
  },
  {
    id: 'AU-UVU-6',
    familia: 'AU-UVU',
    largo: 6,
    espesor: '0.8 mm',
    precio: 72,
    variantes: [
      { codigo: 'AU-2511', color: 'Blanco Cepillado' },
      { codigo: 'AU-2502', color: 'Blanco Madera' },
      { codigo: 'AU-2545', color: 'Blanco Ceja' },
    ],
  },
  {
    id: 'UVU-4',
    familia: 'UVU',
    largo: 4,
    espesor: '0.8 mm',
    precio: 50,
    variantes: [
      { codigo: 'QAC-2500', color: 'Blanco' },
      { codigo: 'QAC-2532', color: 'Madera' },
      { codigo: 'AU-2545', color: 'Blanco Ceja' },
    ],
  },
];

// Compatibilidad hacia atrás (algunas partes usan .codigo)
PLACAS.forEach((p) => { p.codigo = p.familia; });

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
