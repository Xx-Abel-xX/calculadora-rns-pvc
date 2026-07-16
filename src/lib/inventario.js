// ============================================
// CONSULTAS A SUPABASE - Inventario
// Todas las funciones devuelven { data, error }.
// ============================================

import { supabase } from './supabase.js';

// ---------- LECTURA ----------

export async function cargarCategorias() {
  return supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true });
}

// Productos con su categoría y variantes (todo de una)
export async function cargarInventarioCompleto() {
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
  return supabase.from('configuracion').select('*');
}

// ---------- VARIANTES ----------

export async function crearVariante({ producto_id, codigo, color, precio, activo = true }) {
  return supabase.from('variantes').insert({ producto_id, codigo, color, precio, activo }).select().single();
}

export async function actualizarVariante(id, cambios) {
  return supabase.from('variantes').update(cambios).eq('id', id).select().single();
}

export async function eliminarVariante(id) {
  return supabase.from('variantes').delete().eq('id', id);
}

// ---------- PRODUCTOS ----------

export async function crearProducto({ categoria_id, nombre, largo, ancho, espesor, descripcion, activo = true }) {
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
  return supabase.from('productos').delete().eq('id', id);
}

// ---------- CATEGORIAS ----------

export async function crearCategoria(data) {
  return supabase.from('categorias').insert(data).select().single();
}

export async function actualizarCategoria(id, cambios) {
  return supabase.from('categorias').update(cambios).eq('id', id).select().single();
}

export async function eliminarCategoria(id) {
  return supabase.from('categorias').delete().eq('id', id);
}

// ---------- CONFIGURACION ----------

export async function actualizarConfiguracion(clave, valor) {
  return supabase.from('configuracion').update({ valor }).eq('clave', clave).select().single();
}
