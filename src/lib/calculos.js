// ============================================
// LÓGICA DE CÁLCULO - RNS PVC (v2 data-driven)
// ============================================
// La placa tiene su propia función (optimización compleja con empalmes).
// El resto de categorías se calcula con el dispatcher de métodos.
// ============================================

import { calcularPorMetodo } from './metodos-calculo.js';

const DEFAULTS = {
  anchoPlaca: 0.25,
};

/**
 * Cálculo de placas y unión H (optimización de cortes).
 * Devuelve: totalPlacas, requiereUnionH, empalmesPorFila, infoCorte, filas.
 */
export function calcularPlacas(W, L, L_plate, orientacion, cfg = {}) {
  const c = { ...DEFAULTS, ...cfg };
  const anchoPlaca = Number(c.anchoPlaca);

  const D_plates = orientacion === 'L' ? Number(L) : Number(W);
  const D_perp   = orientacion === 'L' ? Number(W) : Number(L);

  const filas = Math.ceil(D_perp / anchoPlaca);
  const placasPorFila = Math.ceil(D_plates / L_plate);
  const empalmesPorFila = placasPorFila - 1;

  let totalPlacas;
  let requiereUnionH;
  let infoCorte = '';

  if (placasPorFila <= 1) {
    requiereUnionH = false;
    totalPlacas = filas;
    infoCorte = `Cobertura completa: ${D_plates.toFixed(2)} m ≤ ${L_plate} m de placa`;
  } else {
    requiereUnionH = true;
    const retazo = D_plates - (placasPorFila - 1) * L_plate;

    if (retazo >= L_plate - 0.0001) {
      totalPlacas = filas * placasPorFila;
      infoCorte = `${placasPorFila} placa(s) por fila × ${filas} filas = ${totalPlacas} placas (corte exacto)`;
    } else {
      const cortesPorPlaca = Math.floor(L_plate / retazo);
      if (cortesPorPlaca >= 1) {
        const placasParaRetazos = Math.ceil(filas / cortesPorPlaca);
        const placasEnterasPorFila = placasPorFila - 1;
        totalPlacas = filas * placasEnterasPorFila + placasParaRetazos;
        infoCorte = `${placasEnterasPorFila} entera(s) + retazos de ${retazo.toFixed(2)} m por fila · ${cortesPorPlaca} retazo(s) por placa → ${totalPlacas} placas`;
      } else {
        totalPlacas = filas * placasPorFila;
        infoCorte = `${placasPorFila} placa(s) por fila × ${filas} filas = ${totalPlacas} placas`;
      }
    }
  }

  return {
    totalPlacas,
    requiereUnionH,
    empalmesPorFila,
    filas,
    placasPorFila,
    infoCorte,
    D_plates,
    D_perp,
  };
}

/**
 * Cálculo principal: recibe las categorías y calcula todo.
 *
 * @param {number} W
 * @param {number} L
 * @param {number} L_plate
 * @param {'L'|'W'} orientacion
 * @param {Array} categorias  Lista de categorías activas (con metodo/parametros)
 * @param {object} cfg         Config global { anchoPlaca, areaMinima }
 */
export function calcularCotizacion(W, L, L_plate, orientacion, categorias = [], cfg = {}) {
  W = Number(W);
  L = Number(L);
  L_plate = Number(L_plate);

  const c = { ...DEFAULTS, ...cfg };
  const areaMinima = Number(c.areaMinima) || 9;
  const areaFacturable = Math.max(W * L, areaMinima);

  // Geometría base para todos los métodos
  const D_plates = orientacion === 'L' ? L : W;
  const D_perp   = orientacion === 'L' ? W : L;
  const perimetro = 2 * (W + L);
  const area = W * L;

  // 1. Calcular placas primero (necesitamos saber si requiere unión H)
  const catPlaca = categorias.find((cat) => cat.rol === 'placa');
  const calcPlaca = catPlaca
    ? calcularPlacas(W, L, L_plate, orientacion, cfg)
    : { totalPlacas: 0, requiereUnionH: false, empalmesPorFila: 0, filas: 0, placasPorFila: 0, infoCorte: '', D_plates, D_perp };

  const geom = {
    W, L, D_plates, D_perp, perimetro, area, L_plate,
    requiereUnionH: calcPlaca.requiereUnionH,
    empalmesPorFila: calcPlaca.empalmesPorFila,
    areaFacturable,
    areaMinima,
  };

  // 2. Calcular cada categoría por su método
  // cantidades: { [categoriaId]: { cantidad, metadata } }
  const cantidades = {};
  for (const cat of categorias) {
    if (cat.rol === 'placa') {
      cantidades[cat.id] = { cantidad: calcPlaca.totalPlacas, metadata: { esPlaca: true, nota: calcPlaca.infoCorte } };
    } else {
      cantidades[cat.id] = calcularPorMetodo(cat, geom);
    }
  }

  return {
    W, L, L_plate, orientacion,
    D_plates, D_perp, perimetro, area, areaFacturable,
    cantidades,
    // Metadata de placa para el gráfico
    filas: calcPlaca.filas,
    placasPorFila: calcPlaca.placasPorFila,
    empalmesPorFila: calcPlaca.empalmesPorFila,
    requiereUnionH: calcPlaca.requiereUnionH,
    infoCorte: calcPlaca.infoCorte,
    totalPlacas: calcPlaca.totalPlacas,
    L_plate,
  };
}
