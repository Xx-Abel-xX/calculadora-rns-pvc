// ============================================
// HOOK CENTRAL DE ESTADO - useCotizacion (v2 data-driven)
// Itera categorías por rol/método. Sin slugs hardcodeados.
// ============================================

import { useMemo, useState, useCallback } from 'react';
import { calcularCotizacion } from '../lib/calculos.js';
import { elegirMejorCombinacion, elegirMejorOrientacion } from '../lib/orientacion.js';
import { subtotalConMinimo } from '../lib/metodos-calculo.js';
import { useInventario } from '../context/InventarioContext.jsx';

// Normaliza un producto-placa de la DB al formato que usa la UI
function normalizarPlaca(producto) {
  if (!producto) return null;
  const precioDefault = producto.variantes?.[0]?.precio ?? 0;
  return {
    id: producto.id,
    categoriaId: producto.categoria_id,
    codigo: producto.nombre,
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

export function useCotizacion() {
  const { productos, categorias, config, usandoFallback } = useInventario();

  // ---------- Inputs ----------
  const [W, setW] = useState('');
  const [L, setL] = useState('');
  const [calculado, setCalculado] = useState(false);
  const [placaIdManual, setPlacaIdManual] = useState(null);
  const [orientacionManual, setOrientacionManual] = useState(null);
  const [edicion, setEdicion] = useState({});
  const [precios, setPrecios] = useState({});
  const [varianteIdx, setVarianteIdx] = useState({});

  // Toggles de servicios (data-driven: busco categorías con rol 'servicio')
  const catManoObra = useMemo(() => categorias.find((c) => c.rol === 'servicio' && c.metodo === 'servicio_m2_minimo' && c.activo !== false), [categorias]);
  const catObraVendida = useMemo(() => categorias.find((c) => c.rol === 'servicio' && c.metodo === 'servicio_total' && c.activo !== false), [categorias]);

  const [conManoObra, setConManoObra] = useState(false);
  const [conObraVendida, setConObraVendida] = useState(false);

  // ---------- Categorías activas (excepto servicios que son toggles) ----------
  const categoriasActivas = useMemo(() => {
    return categorias.filter((c) => {
      if (c.activo === false) return false;
      // Los servicios se manejan por toggle
      if (c.rol === 'servicio') {
        if (c.metodo === 'servicio_total') return conObraVendida;
        if (c.metodo === 'servicio_m2_minimo') return conManoObra && !conObraVendida;
        return false;
      }
      return true;
    });
  }, [categorias, conManoObra, conObraVendida]);

  // ---------- Placas disponibles ----------
  const placasDisponibles = useMemo(() => {
    return productos
      .filter((p) => p.categoria?.rol === 'placa' && p.activo !== false)
      .map(normalizarPlaca)
      .filter(Boolean);
  }, [productos]);

  // ---------- Config global ----------
  const cfg = useMemo(() => ({
    anchoPlaca: config.ancho_placa ?? 0.25,
    areaMinima: config.area_minima ?? 9,
  }), [config]);

  // ---------- Precios default desde inventario ----------
  const preciosDefault = useMemo(() => {
    const map = {};
    for (const p of productos) {
      const vActiva = p.variantes?.find((v) => v.activo !== false) ?? p.variantes?.[0];
      const precio = vActiva?.precio ?? 0;
      if (p.categoria?.rol === 'placa') {
        map[`placa:${p.id}`] = precio;
      } else {
        map[p.categoria_id] = precio;
      }
    }
    return map;
  }, [productos]);

  const preciosEfectivos = useMemo(() => ({ ...preciosDefault, ...precios }), [preciosDefault, precios]);

  // ---------- Mejor combinación automática ----------
  const mejorAuto = useMemo(() => {
    if (!calculado || placasDisponibles.length === 0 || categoriasActivas.length === 0) return null;
    return elegirMejorCombinacion(Number(W), Number(L), placasDisponibles, categoriasActivas, preciosEfectivos, cfg);
  }, [calculado, W, L, placasDisponibles, categoriasActivas, preciosEfectivos, cfg]);

  // ---------- Placa efectiva ----------
  const placa = useMemo(() => {
    if (!calculado || placasDisponibles.length === 0) return null;
    if (placaIdManual) return placasDisponibles.find((p) => p.id === placaIdManual) ?? mejorAuto?.placa;
    return mejorAuto?.placa;
  }, [calculado, placasDisponibles, placaIdManual, mejorAuto]);

  const variante = useMemo(() => {
    if (!placa) return null;
    const idx = varianteIdx[placa.id] ?? 0;
    return placa.variantes[idx] ?? placa.variantes[0];
  }, [placa, varianteIdx]);

  // ---------- Orientación óptima ----------
  const orientacionOptima = useMemo(() => {
    if (!calculado || !placa) return 'L';
    if (placaIdManual) {
      return elegirMejorOrientacion(Number(W), Number(L), placa, categoriasActivas, preciosEfectivos, cfg).orientacion;
    }
    return mejorAuto?.orientacion ?? 'L';
  }, [calculado, placa, placaIdManual, W, L, categoriasActivas, preciosEfectivos, cfg, mejorAuto]);

  const orientacion = orientacionManual ?? orientacionOptima;
  const esOptima = orientacion === orientacionOptima;

  // ---------- Cotización ----------
  const cot = useMemo(() => {
    if (!calculado || !placa) return null;
    return calcularCotizacion(Number(W), Number(L), placa.largo, orientacion, categoriasActivas, cfg);
  }, [calculado, placa, W, L, orientacion, categoriasActivas, cfg]);

  // ---------- Acciones ----------
  const calcular = useCallback(() => {
    const w = Number(W);
    const l = Number(L);
    if (!w || !l || w <= 0 || l <= 0) return false;
    setEdicion({});
    setPrecios({});
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
        [campo]: campo === 'cantidad' || campo === 'precio' || campo === 'subtotal'
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

  const setPrecioServicio = useCallback((clave, valor) => {
    setPrecios((prev) => ({ ...prev, [clave]: Math.max(0, Number(valor) || 0) }));
  }, []);

  // ---------- Filas de la tabla (data-driven) ----------
  const filas = useMemo(() => {
    if (!cot || !placa) return [];
    const filasBase = [];

    for (const cat of categoriasActivas) {
      const calc = cot.cantidades[cat.id];
      if (!calc) continue;
      const { cantidad, metadata } = calc;

      // Determinar el producto (primer producto activo de la categoría)
      const prod = productos.find((p) => p.categoria_id === cat.id && p.activo !== false);
      if (!prod) continue;

      // Precio
      let precio;
      let detalle;
      if (cat.rol === 'placa') {
        precio = preciosEfectivos[`placa:${placa.id}`] ?? placa.precioDefault ?? 0;
        detalle = variante ? variante.codigo : placa.codigo;
      } else {
        precio = preciosEfectivos[cat.id] ?? 0;
        detalle = prod.nombre;
      }

      // Para servicios, el detalle es el nombre de la categoría
      if (metadata.esServicio) {
        detalle = cat.nombre;
      }

      filasBase.push({
        clave: cat.id,
        detalle,
        cantidad,
        precio,
        editable: true,
        esServicio: Boolean(metadata.esServicio),
        aplicaMinimo: Boolean(metadata.aplicaMinimo),
        minimo: metadata.minimo,
        anulaTabla: Boolean(metadata.anulaTabla),
        nota: metadata.nota,
        metadata,
      });
    }

    // Aplicar ediciones + calcular subtotal
    return filasBase.map((f) => {
      const ed = edicion[f.clave];
      const cantidad = ed?.cantidad ?? f.cantidad;
      const precio = ed?.precio ?? f.precio;
      const detalle = ed?.detalle ?? f.detalle;

      // Subtotal
      let subtotal;
      if (ed?.subtotal != null) {
        subtotal = ed.subtotal; // override manual (Mano de Obra)
      } else if (f.aplicaMinimo) {
        subtotal = subtotalConMinimo(cantidad, precio, f.minimo);
      } else {
        subtotal = cantidad * precio;
      }

      return {
        ...f,
        cantidad, precio, detalle, subtotal,
        modificado: Boolean(ed),
      };
    });
  }, [cot, placa, variante, categoriasActivas, productos, edicion, preciosEfectivos]);

  // ---------- Totales ----------
  const subtotalMateriales = useMemo(
    () => filas.filter((f) => !f.esServicio).reduce((acc, f) => acc + f.subtotal, 0),
    [filas]
  );

  const areaFacturable = cot?.areaFacturable ?? Math.max(Number(W) * Number(L) || 0, cfg.areaMinima);

  // Total: si hay categoría anulaTabla (Obra Vendida), solo esa
  const filaAnulaTabla = filas.find((f) => f.anulaTabla);
  const totalFinal = useMemo(() => {
    if (filaAnulaTabla) return filaAnulaTabla.subtotal;
    return filas.reduce((acc, f) => acc + f.subtotal, 0);
  }, [filas, filaAnulaTabla]);

  const montoManoObra = useMemo(() => {
    const f = filas.find((x) => x.aplicaMinimo);
    return f?.subtotal ?? 0;
  }, [filas]);

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
    categoriasActivas,
    conManoObra, setConManoObra,
    conObraVendida, setConObraVendida,
    catManoObra, catObraVendida,
    montoManoObra, areaFacturable,
    subtotalMateriales, totalFinal,
    usandoFallback,
    filaAnulaTabla,
  };
}
