// ============================================
// OPTIMIZACIÓN DE COMBINACIÓN - RNS PVC
// Recibe las placas (ya desde la DB, no del módulo) y config.
// ============================================

import { calcularCotizacion } from './calculos.js';

// Mapeo de claves de categoría → cómo se referencia en cantidades
const CLAVES_CANT = ['placa', 'montante', 'omega', 'angulo', 'cornisa', 'unionH', 'tornilloT1', 'tornilloTarugo'];

/**
 * Costo total de materiales para una cotización + placa dadas.
 * Los precios vienen del mapa `precios` (que en runtime arma el hook).
 */
function costoMateriales(cot, placa, precios) {
  let total = cot.cantidades.placa * (precios[`placa:${placa.id}`] ?? placa.precioDefault ?? 0);
  for (const clave of CLAVES_CANT) {
    if (clave === 'placa') continue;
    total += cot.cantidades[clave] * (precios[clave] ?? 0);
  }
  return total;
}

/**
 * Elige la mejor combinación material + orientación.
 * @param {number} W
 * @param {number} L
 * @param {Array}  placas   Lista de placas (objetos con id, largo, precioDefault)
 * @param {object} precios  Mapa de precios
 * @param {object} cfg      Configuración
 */
export function elegirMejorCombinacion(W, L, placas = [], precios = {}, cfg = {}) {
  const candidatos = [];
  for (const placa of placas) {
    for (const ori of ['L', 'W']) {
      const cot = calcularCotizacion(W, L, placa.largo, ori, cfg);
      const costo = costoMateriales(cot, placa, precios);
      candidatos.push({ placa, orientacion: ori, cot, costo, requiereUnionH: cot.requiereUnionH });
    }
  }

  candidatos.sort((a, b) => {
    if (a.requiereUnionH !== b.requiereUnionH) return a.requiereUnionH ? 1 : -1;
    return a.costo - b.costo;
  });

  const mejor = candidatos[0];
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
export function elegirMejorOrientacion(W, L, L_plate, placaId, precios = {}, cfg = {}, placas = []) {
  const placa = placas.find((p) => p.id === placaId);
  if (!placa) return { orientacion: 'L', requiereUnionH: false, razon: '', detalle: {} };
  const resultado = elegirMejorCombinacion(W, L, [placa], precios, cfg);
  const cotL = resultado.detalle.find((d) => d.orientacion === 'L');
  const cotW = resultado.detalle.find((d) => d.orientacion === 'W');
  return {
    orientacion: resultado.orientacion,
    requiereUnionH: resultado.requiereUnionH,
    razon: '',
    detalle: { L: cotL?.cot, W: cotW?.cot },
  };
}
