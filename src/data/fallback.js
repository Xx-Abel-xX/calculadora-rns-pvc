// ============================================
// INVENTARIO FALLBACK
// Se usa si Supabase no está configurado o no responde.
// Es un snapshot mínimo para que la app no se rompa.
// Tiene la MISMA forma que lo que devuelve Supabase.
// ============================================

// IDs estables (strings en fallback para diferenciar)
const CATS = {
  placa:          { id: 'cat-placa',          nombre: 'Placa PVC',         slug: 'placa',          rol: 'placa',      unidad_default: 'pza',       requiere_dimensiones: true,  requiere_color: true,  orden: 1,  activo: true },
  montante:       { id: 'cat-montante',       nombre: 'Montante',          slug: 'montante',       rol: 'perfil',     unidad_default: 'pza (3 m)', requiere_dimensiones: true,  requiere_color: false, orden: 2,  activo: true },
  omega:          { id: 'cat-omega',          nombre: 'Omega',             slug: 'omega',          rol: 'perfil',     unidad_default: 'pza (3 m)', requiere_dimensiones: true,  requiere_color: false, orden: 3,  activo: true },
  angulo:         { id: 'cat-angulo',         nombre: 'Angulo',            slug: 'angulo',         rol: 'perfil',     unidad_default: 'pza (3 m)', requiere_dimensiones: true,  requiere_color: false, orden: 4,  activo: true },
  cornisa:        { id: 'cat-cornisa',        nombre: 'Cornisa',           slug: 'cornisa',        rol: 'cornisa',    unidad_default: 'pza (6 m)', requiere_dimensiones: true,  requiere_color: true,  orden: 5,  activo: true },
  union_h:        { id: 'cat-union_h',        nombre: 'Union H',           slug: 'union_h',        rol: 'union',      unidad_default: 'pza (6 m)', requiere_dimensiones: true,  requiere_color: false, orden: 6,  activo: true },
  tornillo_t1:    { id: 'cat-tornillo_t1',    nombre: 'Tornillo T1',       slug: 'tornillo_t1',    rol: 'consumible', unidad_default: 'bolsa',     requiere_dimensiones: false, requiere_color: false, orden: 7,  activo: true },
  tornillo_tarugo:{ id: 'cat-tornillo_tarugo',nombre: 'Tornillo y Tarugo', slug: 'tornillo_tarugo',rol: 'consumible', unidad_default: 'bolsa',     requiere_dimensiones: false, requiere_color: false, orden: 8,  activo: true },
  mano_obra:      { id: 'cat-mano_obra',      nombre: 'Mano de Obra',      slug: 'mano_obra',      rol: 'servicio',   unidad_default: 'Bs/m²',     requiere_dimensiones: false, requiere_color: false, orden: 9,  activo: true },
  obra_vendida:   { id: 'cat-obra_vendida',   nombre: 'Obra Vendida',      slug: 'obra_vendida',   rol: 'servicio',   unidad_default: 'Bs/m²',     requiere_dimensiones: false, requiere_color: false, orden: 10, activo: true },
};

const variantes = (codigo, color, precio) => ({
  id: `var-${codigo}`,
  codigo,
  color: color ?? null,
  precio,
  activo: true,
});

export const INVENTARIO_FALLBACK = {
  categorias: Object.values(CATS),
  productos: [
    // Placas
    { id: 'p-qac', categoria_id: CATS.placa.id, categoria: CATS.placa, nombre: 'QAC-UV', largo: 6, ancho: 0.25, espesor: '0.7 mm', activo: true, variantes: [
      variantes('QAC-2543', 'Madera Acanelado', 67),
      variantes('QAC-2541', 'Blanco Franja', 67),
      variantes('QAC-2524', 'Madera Nogal', 67),
      variantes('QAC-2500', 'Blanco', 67),
      variantes('QAC-2532', 'Madera', 67),
    ]},
    { id: 'p-au', categoria_id: CATS.placa.id, categoria: CATS.placa, nombre: 'AU-UVU', largo: 6, ancho: 0.25, espesor: '0.8 mm', activo: true, variantes: [
      variantes('AU-2511', 'Blanco Cepillado', 72),
      variantes('AU-2502', 'Blanco Madera', 72),
      variantes('AU-2545', 'Blanco Ceja', 72),
    ]},
    { id: 'p-uvu', categoria_id: CATS.placa.id, categoria: CATS.placa, nombre: 'UVU', largo: 4, ancho: 0.25, espesor: '0.8 mm', activo: true, variantes: [
      variantes('QAC-2500-4', 'Blanco', 50),
      variantes('QAC-2532-4', 'Madera', 50),
      variantes('AU-2545-4', 'Blanco Ceja', 50),
    ]},
    // Perfiles
    { id: 'p-montante', categoria_id: CATS.montante.id, categoria: CATS.montante, nombre: 'Montante', largo: 3, activo: true, variantes: [variantes('MONT-3', null, 23)] },
    { id: 'p-omega',    categoria_id: CATS.omega.id,    categoria: CATS.omega,    nombre: 'Omega',    largo: 3, activo: true, variantes: [variantes('OMG-3', null, 22)] },
    { id: 'p-angulo',   categoria_id: CATS.angulo.id,   categoria: CATS.angulo,   nombre: 'Angulo',   largo: 3, activo: true, variantes: [variantes('ANG-3', null, 13)] },
    // Cornisa
    { id: 'p-cornisa', categoria_id: CATS.cornisa.id, categoria: CATS.cornisa, nombre: 'Cornisa BJX', largo: 6, activo: true, variantes: [variantes('BJX-6', 'Blanco', 30)] },
    // Union H
    { id: 'p-union', categoria_id: CATS.union_h.id, categoria: CATS.union_h, nombre: 'Union H', largo: 6, activo: true, variantes: [variantes('UNH-6', null, 30)] },
    // Consumibles
    { id: 'p-t1', categoria_id: CATS.tornillo_t1.id, categoria: CATS.tornillo_t1, nombre: 'Tornillo T1', activo: true, variantes: [variantes('T1-100', null, 40)] },
    { id: 'p-tt', categoria_id: CATS.tornillo_tarugo.id, categoria: CATS.tornillo_tarugo, nombre: 'Tornillo y Tarugo', activo: true, variantes: [variantes('TT-100', null, 25)] },
    // Servicios
    { id: 'p-mo', categoria_id: CATS.mano_obra.id, categoria: CATS.mano_obra, nombre: 'Mano de Obra', activo: true, variantes: [variantes('MO', null, 30)] },
    { id: 'p-ov', categoria_id: CATS.obra_vendida.id, categoria: CATS.obra_vendida, nombre: 'Obra Vendida', activo: true, variantes: [variantes('OV', null, 140)] },
  ],
  config: {
    area_minima: 9,
    monto_minimo_mano_obra: 450,
    espaciado_montantes: 1.2,
    espaciado_omegas: 0.6,
    largo_cornisa: 6,
    largo_perfil: 3,
    ancho_placa: 0.25,
    rendimiento_tornillos: 20,
    umbral_refuerzo_montantes: 16,
  },
};
