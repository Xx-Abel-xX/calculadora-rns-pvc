// ============================================
// LÓGICA MATEMÁTICA Y REGLAS DE NEGOCIO - RNS PVC
// Función pura: cálculo de materiales para una orientación dada.
// Generalizada: maneja cualquier cantidad de empalmes (Unión H).
// ============================================

import { ANCHO_PLACA, LARGO_PERFIL } from '../data/inventario.js';

/**
 * Calcula todas las cantidades de materiales para una habitación
 * dado un ancho W, largo L, largo de placa L_plate y orientación.
 *
 * Convención de orientación:
 *   orientacion === 'L'  -> las placas corren a lo largo del LARGO L (D_plates = L)
 *   orientacion === 'W'  -> las placas corren a lo largo del ANCHO W (D_plates = W)
 *
 * @param {number} W           Ancho de la habitación (m)
 * @param {number} L           Largo de la habitación (m)
 * @param {number} L_plate     Largo de la placa seleccionada (4 o 6 m)
 * @param {'L'|'W'} orientacion
 * @returns {object} Desglose completo de cantidades + metadata de cálculo
 */
export function calcularCotizacion(W, L, L_plate, orientacion) {
  W = Number(W);
  L = Number(L);
  L_plate = Number(L_plate);

  // Dimensiones paralela y perpendicular a las placas
  const D_plates = orientacion === 'L' ? L : W;
  const D_perp   = orientacion === 'L' ? W : L;

  const perimetro = 2 * (W + L);
  const area = W * L;

  // ---------- A. Placas y Unión H (generalizado) ----------
  const filas = Math.ceil(D_perp / ANCHO_PLACA);

  // ¿Cuántas placas por fila se necesitan para cubrir D_plates?
  const placasPorFila = Math.ceil(D_plates / L_plate);
  const empalmesPorFila = placasPorFila - 1; // cantidad de líneas de Unión H por fila

  let totalPlacas;
  let requiereUnionH;
  let unionH_piezas;
  let infoCorte = '';

  if (placasPorFila <= 1) {
    // La placa cubre todo el largo: sin empalmes
    requiereUnionH = false;
    unionH_piezas = 0;
    totalPlacas = filas;
    infoCorte = `Cobertura completa: ${D_plates.toFixed(2)} m ≤ ${L_plate} m de placa`;
  } else {
    // Requiere empalmes (1 o más líneas de Unión H)
    requiereUnionH = true;

    // Piezas de perfil H: cada línea de empalme corre perpendicular a las placas
    // y debe cubrir D_perp metros con perfiles de 3m.
    unionH_piezas = empalmesPorFila * Math.ceil(D_perp / LARGO_PERFIL);

    // ---- Optimización de retazos ----
    // El último segmento de cada fila mide: D_plates - (placasPorFila-1) * L_plate
    // Si ese segmento es exactamente L_plate (múltiplo exacto), no hay retazo.
    const retazo = D_plates - (placasPorFila - 1) * L_plate;

    if (retazo >= L_plate - 0.0001) {
      // Múltiplo exacto: sin retazo, todas las placas son enteras
      totalPlacas = filas * placasPorFila;
      infoCorte = `${placasPorFila} placa(s) por fila × ${filas} filas = ${totalPlacas} placas (corte exacto)`;
    } else {
      // Hay retazo: las primeras (placasPorFila-1) son enteras, la última es un retazo.
      // De una placa nueva de L_plate se pueden cortar varios retazos.
      const cortesPorPlaca = Math.floor(L_plate / retazo);

      if (cortesPorPlaca >= 1) {
        // Se pueden cortar varios retazos de una sola placa
        const placasParaRetazos = Math.ceil(filas / cortesPorPlaca);
        const placasEnterasPorFila = placasPorFila - 1;
        totalPlacas = filas * placasEnterasPorFila + placasParaRetazos;
        infoCorte = `${placasEnterasPorFila} entera(s) + retazos de ${retazo.toFixed(2)} m por fila · ${cortesPorPlaca} retazo(s) por placa → ${totalPlacas} placas`;
      } else {
        // No se puede optimizar (retazo mayor que la placa, caso raro)
        totalPlacas = filas * placasPorFila;
        infoCorte = `${placasPorFila} placa(s) por fila × ${filas} filas = ${totalPlacas} placas`;
      }
    }
  }

  // ---------- B. Estructura de Perfiles ----------
  // Montantes: paralelos a las placas, cada 1.2 m
  const lineasMontantes = Math.ceil(D_perp / 1.2);
  const metrosMontantes = lineasMontantes * D_plates;
  const montantesBase = Math.ceil(metrosMontantes / LARGO_PERFIL);
  // Regla RNS PVC: +1 montante de refuerzo por cada 4x4 m (16 m²) de área.
  // Cubre el "+1" de habitaciones chicas y escala en grandes.
  const refuerzosMontantes = Math.ceil(area / 16);
  const montantes = montantesBase + refuerzosMontantes;

  // Omegas: perpendiculares a las placas, cada 0.6 m
  const lineasOmegas = Math.ceil(D_plates / 0.6);
  const metrosOmegas = lineasOmegas * D_perp;
  const omegas = Math.ceil(metrosOmegas / LARGO_PERFIL);

  // Angulares: perimetral
  const angulares = Math.ceil(perimetro / LARGO_PERFIL);

  // ---------- C. Consumibles y Acabados ----------
  // Las cornisas son de 6 m (no 3 m como los perfiles)
  const cornisas = Math.ceil(perimetro / 6);
  const bolsasT1 = Math.ceil(area / 20);
  const bolsasTarugos = Math.ceil(area / 20);

  // ---------- Cantidades por clave ----------
  const cantidades = {
    placa: totalPlacas,
    montante: montantes,
    omega: omegas,
    angulo: angulares,
    cornisa: cornisas,
    unionH: unionH_piezas,
    tornilloT1: bolsasT1,
    tornilloTarugo: bolsasTarugos,
  };

  return {
    W, L, L_plate, orientacion,
    D_plates, D_perp, perimetro, area,

    cantidades,

    filas,
    placasPorFila,
    empalmesPorFila,
    requiereUnionH,
    unionH_piezas,
    infoCorte,
    totalPlacas,

    montantesBase,
    montantes,
    omegas,
    angulares,

    cornisas,
    bolsasT1,
    bolsasTarugos,
  };
}
