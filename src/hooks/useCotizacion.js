// ============================================
// HOOK CENTRAL DE ESTADO - useCotizacion
// ============================================

import { useMemo, useState, useCallback } from 'react';
import { calcularCotizacion } from '../lib/calculos.js';
import { elegirMejorCombinacion, elegirMejorOrientacion } from '../lib/orientacion.js';
import { PLACAS, preciosPorDefecto } from '../data/inventario.js';

export function useCotizacion() {
  // ---------- Inputs ----------
  const [W, setW] = useState('');
  const [L, setL] = useState('');

  const [calculado, setCalculado] = useState(false);

  // Override manual
  const [placaIdManual, setPlacaIdManual] = useState(null);
  const [orientacionManual, setOrientacionManual] = useState(null); // 'L'|'W'|null(=óptima)

  const [edicion, setEdicion] = useState({});
  const [precios, setPrecios] = useState(() => preciosPorDefecto());

  // Por defecto desactivados
  const [conManoObra, setConManoObra] = useState(false);
  const [conObraVendida, setConObraVendida] = useState(false);

  // Variante (color/código) seleccionada para cada material
  const [varianteIdx, setVarianteIdx] = useState({}); // { [placaId]: indiceVariante }

  // ---------- Mejor combinación automática ----------
  const mejorAuto = useMemo(() => {
    if (!calculado) return null;
    return elegirMejorCombinacion(Number(W), Number(L), PLACAS, precios);
  }, [calculado, W, L, precios]);

  // ---------- Placa efectiva ----------
  const placa = useMemo(() => {
    if (!calculado) return null;
    if (placaIdManual) return PLACAS.find((p) => p.id === placaIdManual) ?? mejorAuto?.placa;
    return mejorAuto?.placa;
  }, [calculado, placaIdManual, mejorAuto]);

  // ---------- Variante (color/código de tienda) efectiva ----------
  const variante = useMemo(() => {
    if (!placa) return null;
    const idx = varianteIdx[placa.id] ?? 0;
    return placa.variantes[idx] ?? placa.variantes[0];
  }, [placa, varianteIdx]);

  // ---------- Orientación óptima para la placa actual ----------
  const orientacionOptima = useMemo(() => {
    if (!calculado || !placa) return 'L';
    if (placaIdManual) {
      return elegirMejorOrientacion(Number(W), Number(L), placa.largo, placa.id, precios).orientacion;
    }
    return mejorAuto.orientacion;
  }, [calculado, placa, placaIdManual, W, L, precios, mejorAuto]);

  // ---------- Orientación efectiva (override o la óptima) ----------
  const orientacion = orientacionManual ?? orientacionOptima;

  // ---------- Cotización ----------
  const cot = useMemo(() => {
    if (!calculado || !placa) return null;
    return calcularCotizacion(Number(W), Number(L), placa.largo, orientacion);
  }, [calculado, placa, W, L, orientacion]);

  // ---------- Es óptima la orientación actual? ----------
  const esOptima = orientacion === orientacionOptima;

  // ---------- Acción: Calcular ----------
  const calcular = useCallback(() => {
    const w = Number(W);
    const l = Number(L);
    if (!w || !l || w <= 0 || l <= 0) return false;
    setEdicion({});
    setPlacaIdManual(null);
    setOrientacionManual(null);
    setCalculado(true);
    return true;
  }, [W, L]);

  // ---------- Override de material ----------
  const setMaterial = useCallback((nuevoId) => {
    setPlacaIdManual(nuevoId || null);
    setOrientacionManual(null); // al cambiar material, vuelve a la óptima del nuevo
  }, []);

  // ---------- Toggle de orientación (L <-> W) ----------
  const toggleOrientacion = useCallback(() => {
    setOrientacionManual((prev) => {
      const actual = prev ?? orientacionOptima;
      return actual === 'L' ? 'W' : 'L';
    });
  }, [orientacionOptima]);

  // ---------- Editar celda ----------
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

  // ---------- Reset al cambiar inputs ----------
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

  // ---------- Filas de la tabla ----------
  const filas = useMemo(() => {
    if (!cot || !placa) return [];

    // Detalle = código de tienda de la variante seleccionada (ej. "QAC-2500")
    const detallePlaca = variante ? variante.codigo : placa.familia;
    const precioPlaca = precios[`placa:${placa.id}`] ?? placa.precio;

    const base = [
      { clave: 'placa', detalle: detallePlaca, cantidad: cot.cantidades.placa, precio: precioPlaca, editable: true },
      { clave: 'montante', detalle: 'Montante', cantidad: cot.cantidades.montante, precio: precios.montante, editable: true, nota: `+${cot.montantes - cot.montantesBase} refuerzo(s)` },
      { clave: 'omega', detalle: 'Omega', cantidad: cot.cantidades.omega, precio: precios.omega, editable: true },
      { clave: 'angulo', detalle: 'Angulo', cantidad: cot.cantidades.angulo, precio: precios.angulo, editable: true },
      { clave: 'cornisa', detalle: 'Cornisa', cantidad: cot.cantidades.cornisa, precio: precios.cornisa, editable: true },
    ];

    // Unión H solo si requiere
    if (cot.requiereUnionH) {
      base.push({
        clave: 'unionH',
        detalle: 'Unión H',
        cantidad: cot.cantidades.unionH,
        precio: precios.unionH,
        editable: true,
      });
    }

    base.push(
      { clave: 'tornilloT1', detalle: 'Tornillo T1', cantidad: cot.cantidades.tornilloT1, precio: precios.tornilloT1, editable: true },
      { clave: 'tornilloTarugo', detalle: 'Tornillo y Tarugo', cantidad: cot.cantidades.tornilloTarugo, precio: precios.tornilloTarugo, editable: true },
    );

    // Aplicar ediciones
    const conEdicion = base.map((f) => {
      const ed = edicion[f.clave];
      if (!ed) return { ...f, subtotal: f.cantidad * f.precio, modificado: false };
      const cantidad = ed.cantidad ?? f.cantidad;
      const precio = ed.precio ?? f.precio;
      const detalle = ed.detalle ?? f.detalle;
      return { ...f, cantidad, precio, detalle, subtotal: cantidad * precio, modificado: true };
    });

    // Mano de Obra y Obra Vendida como filas (si están activadas)
    const areaRedondeada = Math.ceil(cot.area);
    if (conManoObra && !conObraVendida) {
      conEdicion.push({
        clave: 'manoObra',
        detalle: 'Mano de Obra',
        cantidad: areaRedondeada,
        precio: precios.manoObra,
        subtotal: areaRedondeada * precios.manoObra,
        editable: false,
        esServicio: true,
      });
    }
    if (conObraVendida) {
      conEdicion.push({
        clave: 'obraVendida',
        detalle: 'Obra Vendida',
        cantidad: areaRedondeada,
        precio: precios.obraVendida,
        subtotal: areaRedondeada * precios.obraVendida,
        editable: false,
        esServicio: true,
      });
    }

    return conEdicion;
  }, [cot, placa, edicion, precios, conManoObra, conObraVendida]);

  // ---------- Totales ----------
  const subtotalMateriales = useMemo(
    () => filas.filter((f) => !f.esServicio).reduce((acc, f) => acc + f.subtotal, 0),
    [filas]
  );

  const totalFinal = useMemo(() => filas.reduce((acc, f) => acc + f.subtotal, 0), [filas]);

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
    precios,
    conManoObra, setConManoObra,
    conObraVendida, setConObraVendida,
    subtotalMateriales, totalFinal,
  };
}
