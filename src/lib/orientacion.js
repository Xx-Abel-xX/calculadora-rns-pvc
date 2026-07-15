// ============================================
// OPTIMIZACIÓN DE COMBINACIÓN - RNS PVC
// Evalúa TODOS los materiales × ambas orientaciones y elige la mejor.
//
// Criterio (acordado con el usuario):
//   1) Evitar Unión H primero.
//   2) Si hay varios que cubren sin empalme (o todos requieren H),
//      elegir el de menor costo total de materiales.
//   Esto favorece naturalmente el material de 4m cuando alcanza,
//   porque la placa de 4m es más barata.
// ============================================

import { calcularCotizacion } from './calculos.js';
import { PLACAS } from '../data/inventario.js';

/**
 * Costo total de materiales para una cotización + placa dadas.
 */
function costoMateriales(cot, placa, precios) {
  const p = precios;
  let total = 0;
  total += cot.cantidades.placa * (p[`placa:${placa.id}`] ?? placa.precio);
  total += cot.cantidades.montante * (p.montante ?? 0);
  total += cot.cantidades.omega * (p.omega ?? 0);
  total += cot.cantidades.angulo * (p.angulo ?? 0);
  total += cot.cantidades.cornisa * (p.cornisa ?? 0);
  total += cot.cantidades.unionH * (p.unionH ?? 0);
  total += cot.cantidades.tornilloT1 * (p.tornilloT1 ?? 0);
  total += cot.cantidades.tornilloTarugo * (p.tornilloTarugo ?? 0);
  return total;
}

/**
 * Elige la mejor combinación de material + orientación.
 *
 * @param {number} W       Ancho (m)
 * @param {number} L       Largo (m)
 * @param {Array}  placas  Lista de placas candidatas (default: todas)
 * @param {object} precios Precios actuales
 * @returns {{
 *   placa: object, orientacion: 'L'|'W', cot: object, costo: number,
 *   requiereUnionH: boolean,
 *   detalle: Array<{placa, orientacion, cot, costo, requiereUnionH}>
 * }}
 */
export function elegirMejorCombinacion(W, L, placas = PLACAS, precios = {}) {
  const candidatos = [];
  for (const placa of placas) {
    for (const ori of ['L', 'W']) {
      const cot = calcularCotizacion(W, L, placa.largo, ori);
      const costo = costoMateriales(cot, placa, precios);
      candidatos.push({ placa, orientacion: ori, cot, costo, requiereUnionH: cot.requiereUnionH });
    }
  }

  // Ordenar: primero los que NO requieren Unión H, luego por menor costo.
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
 * Elige la mejor orientación para UN material específico.
 * (Se usa cuando el usuario overridea el material manualmente.)
 *
 * Criterio: evitar Unión H primero, luego menor costo.
 */
export function elegirMejorOrientacion(W, L, L_plate, placaId, precios = {}) {
  const placa = PLACAS.find((p) => p.id === placaId);
  const resultado = elegirMejorCombinacion(W, L, [placa].filter(Boolean), precios);
  const mejorOri = resultado.orientacion;
  const cotL = resultado.detalle.find((d) => d.orientacion === 'L');
  const cotW = resultado.detalle.find((d) => d.orientacion === 'W');
  return {
    orientacion: mejorOri,
    requiereUnionH: resultado.requiereUnionH,
    razon: '',
    detalle: { L: cotL?.cot, W: cotW?.cot },
  };
}
