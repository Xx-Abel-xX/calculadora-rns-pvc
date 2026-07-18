// ============================================
// OPTIMIZACIÓN DE COMBINACIÓN - RNS PVC (v2)
// Recibe las categorías y placas desde la DB.
// ============================================

import { calcularCotizacion } from './calculos.js';

/**
 * Costo total de materiales para una cotización.
 * Suma cantidad × precio de cada categoría.
 */
function costoMateriales(cot, placas, precios) {
  let total = 0;
  for (const [catId, { cantidad, metadata }] of Object.entries(cot.cantidades)) {
    if (metadata.esPlaca) {
      // La placa usa el precio de la placa seleccionada
      const placa = placas.find((p) => p.categoriaId === catId);
      const precio = placa ? (precios[`placa:${placa.id}`] ?? placa.precioDefault ?? 0) : 0;
      total += cantidad * precio;
    } else if (metadata.esServicio) {
      // Los servicios se suman con su cálculo propio, pero para comparar
      // orientaciones los ignoramos (no dependen de la orientación)
      continue;
    } else {
      // Otras categorías: precio por categoría
      total += cantidad * (precios[catId] ?? 0);
    }
  }
  return total;
}

/**
 * Elige la mejor combinación placa + orientación.
 *
 * @param {number} W
 * @param {number} L
 * @param {Array} placas          Lista de placas normalizadas
 * @param {Array} categorias      Lista de categorías activas
 * @param {object} precios        Mapa de precios
 * @param {object} cfg            Config global
 */
export function elegirMejorCombinacion(W, L, placas = [], categorias = [], precios = {}, cfg = {}) {
  const candidatos = [];
  for (const placa of placas) {
    for (const ori of ['L', 'W']) {
      const cot = calcularCotizacion(W, L, placa.largo, ori, categorias, cfg);
      const costo = costoMateriales(cot, [{ ...placa, categoriaId: placa.categoriaId }], precios);
      candidatos.push({ placa, orientacion: ori, cot, costo, requiereUnionH: cot.requiereUnionH });
    }
  }

  candidatos.sort((a, b) => {
    if (a.requiereUnionH !== b.requiereUnionH) return a.requiereUnionH ? 1 : -1;
    return a.costo - b.costo;
  });

  const mejor = candidatos[0];
  if (!mejor) return null;
  return {
    placa: mejor.placa,
    orientacion: mejor.orientacion,
    cot: mejor.cot,
    costo: mejor.costo,
    requiereUnionH: mejor.requiereUnionH,
    detalle: candidatos,
  };
}

/**
 * Mejor orientación para una placa específica.
 */
export function elegirMejorOrientacion(W, L, placa, categorias = [], precios = {}, cfg = {}) {
  const resultado = elegirMejorCombinacion(W, L, [placa], categorias, precios, cfg);
  if (!resultado) return { orientacion: 'L', requiereUnionH: false, razon: '', detalle: {} };
  const cotL = resultado.detalle.find((d) => d.orientacion === 'L');
  const cotW = resultado.detalle.find((d) => d.orientacion === 'W');
  return {
    orientacion: resultado.orientacion,
    requiereUnionH: resultado.requiereUnionH,
    razon: '',
    detalle: { L: cotL?.cot, W: cotW?.cot },
  };
}
