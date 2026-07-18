// ============================================
// MÉTODOS DE CÁLCULO (dispatcher data-driven)
// ============================================
// Cada categoría define su `metodo` y `parametros`.
// Este dispatcher recibe la geometría (W, L, orientación, área, etc.)
// y devuelve la cantidad + metadata para esa categoría.
//
// Métodos disponibles (8):
//   placa, perfil_paralelo, perfil_perpendicular, perimetral,
//   por_area, empalme, servicio_m2_minimo, servicio_total
// ============================================

// Catálogo de métodos para la UI (descripciones + qué parámetros pide)
export const METODOS = {
  placa: {
    label: 'Placa (selector + gráfico)',
    descripcion: 'Material principal. Aparece en el selector y se incrusta en el gráfico.',
    parametros: [], // sin parámetros propios (usa el largo del producto)
  },
  perfil_paralelo: {
    label: 'Perfil paralelo (estructura)',
    descripcion: 'Líneas paralelas a las placas con espaciado fijo. Ej: Montantes.',
    parametros: [
      { key: 'espaciado', label: 'Espaciado (m)', default: 1.2 },
      { key: 'largo_unidad', label: 'Largo de unidad (m)', default: 3 },
      { key: 'incluir_refuerzos', label: 'Sumar refuerzos por área', default: false, tipo: 'bool' },
      { key: 'umbral_refuerzo', label: 'Umbral de refuerzo (m²)', default: 16 },
    ],
  },
  perfil_perpendicular: {
    label: 'Perfil perpendicular (estructura)',
    descripcion: 'Líneas perpendiculares a las placas con espaciado. Ej: Omegas.',
    parametros: [
      { key: 'espaciado', label: 'Espaciado (m)', default: 0.6 },
      { key: 'largo_unidad', label: 'Largo de unidad (m)', default: 3 },
    ],
  },
  perimetral: {
    label: 'Perimetral',
    descripcion: 'Recorre el perímetro. Ej: Angulo, Cornisa.',
    parametros: [
      { key: 'largo_unidad', label: 'Largo de unidad (m)', default: 6 },
    ],
  },
  por_area: {
    label: 'Por área (consumible)',
    descripcion: 'Calculado por m² con un rendimiento. Ej: Tornillos.',
    parametros: [
      { key: 'rendimiento', label: 'Rendimiento (m² por unidad)', default: 20 },
    ],
  },
  empalme: {
    label: 'Empalme / Unión (condicional)',
    descripcion: 'Solo se calcula si las placas requieren empalme. Ej: Unión H.',
    parametros: [
      { key: 'largo_unidad', label: 'Largo de unidad (m)', default: 6 },
    ],
  },
  servicio_m2_minimo: {
    label: 'Servicio por m² con mínimo',
    descripcion: 'Precio por m² con un monto mínimo. Ej: Mano de Obra.',
    parametros: [
      { key: 'minimo', label: 'Monto mínimo (Bs)', default: 450 },
    ],
  },
  servicio_total: {
    label: 'Servicio total (anula tabla)',
    descripcion: 'Precio por m² que reemplaza todo el desglose. Ej: Obra Vendida.',
    parametros: [],
  },
};

// Roles disponibles para la UI
export const ROLES = ['placa', 'perfil', 'cornisa', 'union', 'consumible', 'servicio'];

// Opciones de "dónde aparece"
export const DONDE_APARECE = {
  selector: 'Selector de material + gráfico',
  tabla: 'Tabla de resultados',
  tabla_condicional: 'Tabla (solo si aplica)',
  oculto: 'Oculto (toggle aparte)',
};

/**
 * Calcula la cantidad de una categoría según su método.
 *
 * @param {object} categoria  { metodo, parametros, ... }
 * @param {object} geom       { W, L, D_plates, D_perp, perimetro, area, L_plate, requiereUnionH, empalmesPorFila, areaFacturable, areaMinima }
 * @returns {{ cantidad: number, metadata: object }}
 */
export function calcularPorMetodo(categoria, geom) {
  const { metodo, parametros: p = {} } = categoria;
  const { W, L, D_plates, D_perp, perimetro, area, L_plate, requiereUnionH, empalmesPorFila, areaFacturable } = geom;

  switch (metodo) {
    case 'placa': {
      // La placa se calcula aparte (optimización compleja).
      // El hook la trata de forma especial. Acá solo devolvemos 0 como placeholder.
      return { cantidad: 0, metadata: { esPlaca: true } };
    }

    case 'perfil_paralelo': {
      const espaciado = Number(p.espaciado) || 1.2;
      const largoUnidad = Number(p.largo_unidad) || 3;
      const lineas = Math.ceil(D_perp / espaciado);
      const metros = lineas * D_plates;
      let cantidad = Math.ceil(metros / largoUnidad);
      const metadata = {};

      if (p.incluir_refuerzos) {
        const umbral = Number(p.umbral_refuerzo) || 16;
        const refuerzos = Math.ceil(area / umbral);
        cantidad += refuerzos;
        metadata.refuerzos = refuerzos;
        metadata.nota = `+${refuerzos} refuerzo(s)`;
      }
      return { cantidad, metadata };
    }

    case 'perfil_perpendicular': {
      const espaciado = Number(p.espaciado) || 0.6;
      const largoUnidad = Number(p.largo_unidad) || 3;
      const lineas = Math.ceil(D_plates / espaciado);
      const metros = lineas * D_perp;
      const cantidad = Math.ceil(metros / largoUnidad);
      return { cantidad, metadata: {} };
    }

    case 'perimetral': {
      const largoUnidad = Number(p.largo_unidad) || 6;
      const cantidad = Math.ceil(perimetro / largoUnidad);
      return { cantidad, metadata: {} };
    }

    case 'por_area': {
      const rendimiento = Number(p.rendimiento) || 20;
      const cantidad = Math.ceil(area / rendimiento);
      return { cantidad, metadata: {} };
    }

    case 'empalme': {
      // Solo si las placas requieren unión H
      if (!requiereUnionH) {
        return { cantidad: 0, metadata: { oculto: true } };
      }
      const largoUnidad = Number(p.largo_unidad) || 6;
      const cantidad = empalmesPorFila * Math.ceil(D_perp / largoUnidad);
      return { cantidad, metadata: {} };
    }

    case 'servicio_m2_minimo': {
      const minimo = Number(p.minimo) || 0;
      const cantidadM2 = Math.ceil(areaFacturable);
      // El subtotal con mínimo se calcula en el hook (necesita precio).
      // Acá devolvemos la cantidad (m²) y el mínimo como metadata.
      return { cantidad: cantidadM2, metadata: { esServicio: true, minimo, aplicaMinimo: true } };
    }

    case 'servicio_total': {
      const cantidadM2 = Math.ceil(areaFacturable);
      return { cantidad: cantidadM2, metadata: { esServicio: true, anulaTabla: true } };
    }

    default:
      return { cantidad: 0, metadata: {} };
  }
}

/**
 * Calcula el subtotal de una fila de servicio respetando el mínimo.
 * Usado por el hook cuando una fila es servicio_m2_minimo.
 */
export function subtotalConMinimo(cantidad, precio, minimo) {
  const calc = cantidad * precio;
  return Math.max(calc, Number(minimo) || 0);
}
