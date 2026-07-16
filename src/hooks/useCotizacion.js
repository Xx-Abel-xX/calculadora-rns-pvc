// ============================================
// HOOK CENTRAL DE ESTADO - useCotizacion
// Ahora lee el inventario del InventarioContext (Supabase/fallback).
// Ya no importa PLACAS ni preciosPorDefecto directamente.
// ============================================

import { useMemo, useState, useCallback } from 'react';
import { calcularCotizacion } from '../lib/calculos.js';
import { elegirMejorCombinacion, elegirMejorOrientacion } from '../lib/orientacion.js';
import { useInventario } from '../context/InventarioContext.jsx';

// Construye un objeto "placa" compatible con la lógica desde un producto DB
function normalizarPlaca(producto) {
  if (!producto) return null;
  const precioDefault = producto.variantes?.[0]?.precio ?? 0;
  return {
    id: producto.id,
    codigo: producto.nombre, // alias de retrocompat con la UI
    nombre: producto.nombre,
    familia: producto.nombre,
    largo: Number(producto.largo) || 6,
    espesor: producto.espesor ?? '',
    precio: precioDefault,
    precioDefault,
    variantes: (producto.variantes || []).map((v) => ({
      id: v.id,
      codigo: v.codigo,
      color: v.color,
      precio: v.precio,
    })),
  };
}

// Busca el producto de una categoría por slug
function buscarPorSlug(productos, slug) {
  return productos.find((p) => p.categoria?.slug === slug && p.activo !== false);
}

export function useCotizacion() {
  const { productos, config, usandoFallback } = useInventario();

  // ---------- Inputs ----------
  const [W, setW] = useState('');
  const [L, setL] = useState('');
  const [calculado, setCalculado] = useState(false);

  const [placaIdManual, setPlacaIdManual] = useState(null);
  const [orientacionManual, setOrientacionManual] = useState(null);
  const [edicion, setEdicion] = useState({});

  // Precios editables en sesión (NO persistentes - regla de rebajas temporales)
  // Se inicializan vacíos y se llenan lazy cuando hay inventario
  const [precios, setPrecios] = useState({});

  const [conManoObra, setConManoObra] = useState(false);
  const [conObraVendida, setConObraVendida] = useState(false);
  const [varianteIdx, setVarianteIdx] = useState({});

  // ---------- Placas disponibles (solo las de rol 'placa') ----------
  const placasDisponibles = useMemo(() => {
    return productos
      .filter((p) => p.categoria?.rol === 'placa' && p.activo !== false)
      .map(normalizarPlaca)
      .filter(Boolean);
  }, [productos]);

  // ---------- Config de cálculo (desde DB) ----------
  const cfg = useMemo(() => ({
    anchoPlaca: config.ancho_placa ?? 0.25,
    largoPerfil: config.largo_perfil ?? 3,
    espaciadoMontantes: config.espaciado_montantes ?? 1.2,
    espaciadoOmegas: config.espaciado_omegas ?? 0.6,
    largoCornisa: config.largo_cornisa ?? 6,
    rendimientoTornillos: config.rendimiento_tornillos ?? 20,
    umbralRefuerzoMontantes: config.umbral_refuerzo_montantes ?? 16,
  }), [config]);

  // ---------- Mapa de precios default desde inventario ----------
  const preciosDefault = useMemo(() => {
    const map = {};
    for (const p of productos) {
      const rol = p.categoria?.rol;
      const slug = p.categoria?.slug;
      // Precio de la primera variante activa
      const vActiva = p.variantes?.find((v) => v.activo !== false) ?? p.variantes?.[0];
      const precio = vActiva?.precio ?? 0;

      if (rol === 'placa') {
        map[`placa:${p.id}`] = precio;
      } else {
        // Mapear slug a la clave que usa calculos
        const claveMap = {
          montante: 'montante',
          omega: 'omega',
          angulo: 'angulo',
          cornisa: 'cornisa',
          union_h: 'unionH',
          tornillo_t1: 'tornilloT1',
          tornillo_tarugo: 'tornilloTarugo',
          mano_obra: 'manoObra',
          obra_vendida: 'obraVendida',
        };
        const clave = claveMap[slug];
        if (clave) map[clave] = precio;
      }
    }
    return map;
  }, [productos]);

  // Precios efectivos: default de DB + overrides de sesión
  const preciosEfectivos = useMemo(() => ({ ...preciosDefault, ...precios }), [preciosDefault, precios]);

  // ---------- Mejor combinación automática ----------
  const mejorAuto = useMemo(() => {
    if (!calculado || placasDisponibles.length === 0) return null;
    return elegirMejorCombinacion(Number(W), Number(L), placasDisponibles, preciosEfectivos, cfg);
  }, [calculado, W, L, placasDisponibles, preciosEfectivos, cfg]);

  // ---------- Placa efectiva ----------
  const placa = useMemo(() => {
    if (!calculado || placasDisponibles.length === 0) return null;
    if (placaIdManual) return placasDisponibles.find((p) => p.id === placaIdManual) ?? mejorAuto?.placa;
    return mejorAuto?.placa;
  }, [calculado, placasDisponibles, placaIdManual, mejorAuto]);

  // ---------- Variante efectiva ----------
  const variante = useMemo(() => {
    if (!placa) return null;
    const idx = varianteIdx[placa.id] ?? 0;
    return placa.variantes[idx] ?? placa.variantes[0];
  }, [placa, varianteIdx]);

  // ---------- Orientación óptima ----------
  const orientacionOptima = useMemo(() => {
    if (!calculado || !placa) return 'L';
    if (placaIdManual) {
      return elegirMejorOrientacion(Number(W), Number(L), placa.largo, placa.id, preciosEfectivos, cfg, placasDisponibles).orientacion;
    }
    return mejorAuto.orientacion;
  }, [calculado, placa, placaIdManual, W, L, preciosEfectivos, cfg, placasDisponibles, mejorAuto]);

  const orientacion = orientacionManual ?? orientacionOptima;
  const esOptima = orientacion === orientacionOptima;

  // ---------- Cotización ----------
  const cot = useMemo(() => {
    if (!calculado || !placa) return null;
    return calcularCotizacion(Number(W), Number(L), placa.largo, orientacion, cfg);
  }, [calculado, placa, W, L, orientacion, cfg]);

  // ---------- Acción Calcular ----------
  const calcular = useCallback(() => {
    const w = Number(W);
    const l = Number(L);
    if (!w || !l || w <= 0 || l <= 0) return false;
    setEdicion({});
    setPrecios({}); // reset rebajas temporales
    setPlacaIdManual(null);
    setOrientacionManual(null);
    setCalculado(true);
    return true;
  }, [W, L]);

  const setMaterial = useCallback((nuevoId) => {
    setPlacaIdManual(nuevoId || null);
    setOrientacionManual(null);
  }, []);

  const toggleOrientacion = useCallback(() => {
    setOrientacionManual((prev) => {
      const actual = prev ?? orientacionOptima;
      return actual === 'L' ? 'W' : 'L';
    });
  }, [orientacionOptima]);

  const editarCelda = useCallback((clave, campo, valor) => {
    setEdicion((prev) => ({
      ...prev,
      [clave]: {
        ...prev[clave],
        [campo]: campo === 'cantidad' || campo === 'precio'
          ? Math.max(0, Number(valor) || 0)
          : valor,
      },
    }));
  }, []);

  const restablecerFila = useCallback((clave) => {
    setEdicion((prev) => {
      const copia = { ...prev };
      delete copia[clave];
      return copia;
    });
  }, []);

  const resetSi = useCallback(() => {
    if (calculado) {
      setCalculado(false);
      setEdicion({});
      setPlacaIdManual(null);
      setOrientacionManual(null);
    }
  }, [calculado]);

  const setWReset = useCallback((v) => { setW(v); resetSi(); }, [resetSi]);
  const setLReset = useCallback((v) => { setL(v); resetSi(); }, [resetSi]);

  // ---------- Filas de la tabla (data-driven desde categorías) ----------
  const filas = useMemo(() => {
    if (!cot || !placa) return [];

    // Mapeo: slug de categoría → clave en cantidades
    const slugToCant = {
      montante: 'montante',
      omega: 'omega',
      angulo: 'angulo',
      cornisa: 'cornisa',
      union_h: 'unionH',
      tornillo_t1: 'tornilloT1',
      tornillo_tarugo: 'tornilloTarugo',
    };

    const filasBase = [];

    // Placa primero
    const precioPlaca = preciosEfectivos[`placa:${placa.id}`] ?? placa.precioDefault ?? 0;
    const detallePlaca = variante ? variante.codigo : placa.codigo;
    filasBase.push({
      clave: 'placa',
      detalle: detallePlaca,
      cantidad: cot.cantidades.placa,
      precio: precioPlaca,
      editable: true,
    });

    // Montante con nota de refuerzos
    const prodMontante = buscarPorSlug(productos, 'montante');
    if (prodMontante) {
      filasBase.push({
        clave: 'montante',
        detalle: prodMontante.nombre,
        cantidad: cot.cantidades.montante,
        precio: preciosEfectivos.montante ?? 0,
        editable: true,
        nota: `+${cot.montantes - cot.montantesBase} refuerzo(s)`,
      });
    }

    // Resto de categorías (data-driven)
    for (const [slug, clave] of Object.entries(slugToCant)) {
      if (slug === 'montante') continue; // ya hecho
      const prod = buscarPorSlug(productos, slug);
      if (!prod) continue;

      // Union H solo si requiere
      if (clave === 'unionH' && !cot.requiereUnionH) continue;

      filasBase.push({
        clave,
        detalle: prod.nombre,
        cantidad: cot.cantidades[clave],
        precio: preciosEfectivos[clave] ?? 0,
        editable: true,
      });
    }

    // Aplicar ediciones
    return filasBase.map((f) => {
      const ed = edicion[f.clave];
      if (!ed) return { ...f, subtotal: f.cantidad * f.precio, modificado: false };
      const cantidad = ed.cantidad ?? f.cantidad;
      const precio = ed.precio ?? f.precio;
      const detalle = ed.detalle ?? f.detalle;
      return { ...f, cantidad, precio, detalle, subtotal: cantidad * precio, modificado: true };
    });
  }, [cot, placa, variante, productos, edicion, preciosEfectivos]);

  // ---------- Totales ----------
  const subtotalMateriales = useMemo(
    () => filas.reduce((acc, f) => acc + f.subtotal, 0),
    [filas]
  );

  const AREA_MINIMA = config.area_minima ?? 9;
  const areaFacturable = useMemo(() => {
    if (!cot) return AREA_MINIMA;
    return Math.max(cot.area, AREA_MINIMA);
  }, [cot, AREA_MINIMA]);

  const montoManoObra = useMemo(() => {
    return Math.ceil(areaFacturable) * (preciosEfectivos.manoObra ?? 30);
  }, [areaFacturable, preciosEfectivos]);

  const totalFinal = useMemo(() => {
    if (conObraVendida) {
      return Math.ceil(areaFacturable) * (preciosEfectivos.obraVendida ?? 140);
    }
    return subtotalMateriales + (conManoObra ? montoManoObra : 0);
  }, [conObraVendida, conManoObra, subtotalMateriales, montoManoObra, areaFacturable, preciosEfectivos]);

  const setPrecioServicio = useCallback((clave, valor) => {
    setPrecios((prev) => ({ ...prev, [clave]: Math.max(0, Number(valor) || 0) }));
  }, []);

  return {
    W, L,
    setW: setWReset, setL: setLReset,
    calculado, calcular,
    cot, placa, orientacion, orientacionOptima, esOptima,
    variante, varianteIdx, setVarianteIdx,
    filas,
    placaIdManual, setMaterial,
    orientacionManual, toggleOrientacion,
    edicion, editarCelda, restablecerFila,
    precios: preciosEfectivos,
    setPrecioServicio,
    placasDisponibles,
    conManoObra, setConManoObra,
    conObraVendida, setConObraVendida,
    montoManoObra, areaFacturable,
    subtotalMateriales, totalFinal,
    usandoFallback,
  };
}
