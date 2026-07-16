// ============================================
// LÓGICA MATEMÁTICA Y REGLAS DE NEGOCIO - RNS PVC
// Generalizada: maneja cualquier cantidad de empalmes (Unión H).
// Las constantes vienen de config (DB) con defaults para no romper.
// ============================================

// Defaults si no se pasa config (mantienen la app funcionando)
const DEFAULTS = {
  anchoPlaca: 0.25,
  largoPerfil: 3,
  espaciadoMontantes: 1.2,
  espaciadoOmegas: 0.6,
  largoCornisa: 6,
  rendimientoTornillos: 20,
  umbralRefuerzoMontantes: 16,
};

/**
 * Calcula todas las cantidades de materiales.
 *
 * @param {number} W           Ancho (m)
 * @param {number} L           Largo (m)
 * @param {number} L_plate     Largo de placa (4 o 6)
 * @param {'L'|'W'} orientacion
 * @param {object} cfg         Configuración desde DB (opcional)
 */
export function calcularCotizacion(W, L, L_plate, orientacion, cfg = {}) {
  W = Number(W);
  L = Number(L);
  L_plate = Number(L_plate);

  // Merge config
  const c = { ...DEFAULTS, ...cfg };
  const anchoPlaca = Number(c.anchoPlaca);
  const largoPerfil = Number(c.largoPerfil);

  const D_plates = orientacion === 'L' ? L : W;
  const D_perp   = orientacion === 'L' ? W : L;

  const perimetro = 2 * (W + L);
  const area = W * L;

  // ---------- A. Placas y Unión H ----------
  const filas = Math.ceil(D_perp / anchoPlaca);
  const placasPorFila = Math.ceil(D_plates / L_plate);
  const empalmesPorFila = placasPorFila - 1;

  let totalPlacas;
  let requiereUnionH;
  let unionH_piezas;
  let infoCorte = '';

  if (placasPorFila <= 1) {
    requiereUnionH = false;
    unionH_piezas = 0;
    totalPlacas = filas;
    infoCorte = `Cobertura completa: ${D_plates.toFixed(2)} m ≤ ${L_plate} m de placa`;
  } else {
    requiereUnionH = true;
    unionH_piezas = empalmesPorFila * Math.ceil(D_perp / largoPerfil);
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

  // ---------- B. Estructura ----------
  const lineasMontantes = Math.ceil(D_perp / c.espaciadoMontantes);
  const metrosMontantes = lineasMontantes * D_plates;
  const montantesBase = Math.ceil(metrosMontantes / largoPerfil);
  const refuerzosMontantes = Math.ceil(area / c.umbralRefuerzoMontantes);
  const montantes = montantesBase + refuerzosMontantes;

  const lineasOmegas = Math.ceil(D_plates / c.espaciadoOmegas);
  const metrosOmegas = lineasOmegas * D_perp;
  const omegas = Math.ceil(metrosOmegas / largoPerfil);

  const angulares = Math.ceil(perimetro / largoPerfil);

  // ---------- C. Consumibles ----------
  const cornisas = Math.ceil(perimetro / c.largoCornisa);
  const bolsasT1 = Math.ceil(area / c.rendimientoTornillos);
  const bolsasTarugos = Math.ceil(area / c.rendimientoTornillos);

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
