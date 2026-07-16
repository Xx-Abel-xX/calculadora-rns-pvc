// ============================================
// CONSULTAS A SUPABASE - Inventario
// Todas las funciones devuelven { data, error }.
// Si Supabase no está configurado, devuelven error (y el contexto usa fallback).
// ============================================

import { supabase, supabaseListo } from './supabase.js';

// Helper: si no hay cliente, devolver error
function noConfig() {
  return { data: null, error: { message: 'Supabase no configurado' } };
}

// ---------- LECTURA ----------

export async function cargarCategorias() {
  if (!supabaseListo) return noConfig();
  return supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true });
}

export async function cargarInventarioCompleto() {
  if (!supabaseListo) return noConfig();
  return supabase
    .from('productos')
    .select(`
      *,
      categoria:categorias(*),
      variantes(*)
    `)
    .order('created_at', { ascending: true });
}

export async function cargarConfiguracion() {
  if (!supabaseListo) return noConfig();
  return supabase.from('configuracion').select('*');
}

// ---------- VARIANTES ----------

export async function crearVariante({ producto_id, codigo, color, precio, activo = true }) {
  if (!supabaseListo) return noConfig();
  return supabase.from('variantes').insert({ producto_id, codigo, color, precio, activo }).select().single();
}

export async function actualizarVariante(id, cambios) {
  if (!supabaseListo) return noConfig();
  return supabase.from('variantes').update(cambios).eq('id', id).select().single();
}

export async function eliminarVariante(id) {
  if (!supabaseListo) return noConfig();
  return supabase.from('variantes').delete().eq('id', id);
}

// ---------- PRODUCTOS ----------

export async function crearProducto({ categoria_id, nombre, largo, ancho, espesor, descripcion, activo = true }) {
  if (!supabaseListo) return noConfig();
  return supabase.from('productos')
    .insert({ categoria_id, nombre, largo, ancho, espesor, descripcion, activo })
    .select(`
      *,
      categoria:categorias(*),
      variantes(*)
    `)
    .single();
}

export async function actualizarProducto(id, cambios) {
  if (!supabaseListo) return noConfig();
  return supabase.from('productos')
    .update(cambios)
    .eq('id', id)
    .select(`
      *,
      categoria:categorias(*),
      variantes(*)
    `)
    .single();
}

export async function eliminarProducto(id) {
  if (!supabaseListo) return noConfig();
  return supabase.from('productos').delete().eq('id', id);
}

// ---------- CATEGORIAS ----------

export async function crearCategoria(data) {
  if (!supabaseListo) return noConfig();
  return supabase.from('categorias').insert(data).select().single();
}

export async function actualizarCategoria(id, cambios) {
  if (!supabaseListo) return noConfig();
  return supabase.from('categorias').update(cambios).eq('id', id).select().single();
}

export async function eliminarCategoria(id) {
  if (!supabaseListo) return noConfig();
  return supabase.from('categorias').delete().eq('id', id);
}

// ---------- CONFIGURACION ----------

export async function actualizarConfiguracion(clave, valor) {
  if (!supabaseListo) return noConfig();
  return supabase.from('configuracion').update({ valor }).eq('clave', clave).select().single();
}
