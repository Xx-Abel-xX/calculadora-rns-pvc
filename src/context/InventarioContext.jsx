// ============================================
// CONTEXTO DE INVENTARIO
// Carga el catálogo desde Supabase al montar la app.
// Si Supabase no responde, usa un fallback embebido (la app no se rompe).
// Expone refresh() para recargar tras cualquier cambio CRUD.
// ============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  cargarCategorias,
  cargarInventarioCompleto,
  cargarConfiguracion,
} from '../lib/inventario.js';
import { supabaseListo } from '../lib/supabase.js';
import { INVENTARIO_FALLBACK } from '../data/fallback.js';

const InventarioContext = createContext(null);

export function InventarioProvider({ children }) {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [config, setConfig] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [usandoFallback, setUsandoFallback] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    // Si Supabase no está configurado, directo al fallback
    if (!supabaseListo) {
      aplicarFallback();
      return;
    }

    try {
      const [catRes, prodRes, confRes] = await Promise.all([
        cargarCategorias(),
        cargarInventarioCompleto(),
        cargarConfiguracion(),
      ]);

      // Si todo falló (red), usar fallback
      if (catRes.error && prodRes.error) {
        aplicarFallback();
        return;
      }

      if (catRes.error) throw catRes.error;
      if (prodRes.error) throw prodRes.error;

      setCategorias(catRes.data || []);
      setProductos(prodRes.data || []);

      const configMap = {};
      for (const c of confRes.data || []) {
        configMap[c.clave] = c.valor;
      }
      setConfig(configMap);
      setUsandoFallback(false);
    } catch (err) {
      console.error('Error cargando inventario de Supabase:', err);
      setError(err.message);
      aplicarFallback();
    } finally {
      setCargando(false);
    }
  }, []);

  function aplicarFallback() {
    setCategorias(INVENTARIO_FALLBACK.categorias);
    setProductos(INVENTARIO_FALLBACK.productos);
    setConfig(INVENTARIO_FALLBACK.config);
    setUsandoFallback(true);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, [cargar]);

  const value = {
    categorias,
    productos,
    config,
    cargando,
    error,
    usandoFallback,
    recargar: cargar,
  };

  return (
    <InventarioContext.Provider value={value}>
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error('useInventario debe usarse dentro de InventarioProvider');
  return ctx;
}
