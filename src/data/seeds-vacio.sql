-- ============================================
-- RNS PVC - Schema de Inventario VACÍO (v2 data-driven)
-- Ejecutar en: SQL Editor de Supabase (proyecto de PRUEBAS)
--
-- Crea SOLO la estructura. NO crea categorías, productos ni variantes.
-- Vos vas a crear TODO desde la interfaz de la app.
--
-- Las categorías ahora definen su método de cálculo y parámetros.
-- ============================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";

-- ============================================
-- 1. CATEGORIAS (con método de cálculo data-driven)
-- ============================================
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  rol text not null check (rol in ('placa','perfil','cornisa','union','consumible','servicio')),
  metodo text,                              -- 'placa','perfil_paralelo','perfil_perpendicular','perimetral','por_area','empalme','servicio_m2_minimo','servicio_total'
  parametros jsonb not null default '{}',   -- {espaciado, largo, rendimiento, minimo, ...} según el método
  donde_aparece text not null default 'tabla',  -- 'selector'|'tabla'|'tabla_condicional'|'oculto'
  unidad_default text not null default 'pza',
  requiere_dimensiones boolean not null default false,
  requiere_color boolean not null default false,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- 2. PRODUCTOS
-- ============================================
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  nombre text not null,
  largo numeric,
  ancho numeric,
  espesor text,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_productos_categoria on public.productos(categoria_id);

-- ============================================
-- 3. VARIANTES
-- ============================================
create table if not exists public.variantes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  codigo text not null unique,
  color text,
  precio numeric not null default 0,
  stock int,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_variantes_producto on public.variantes(producto_id);

-- ============================================
-- 4. CONFIGURACION (reglas globales del sistema)
-- ============================================
create table if not exists public.configuracion (
  clave text primary key,
  valor numeric not null,
  descripcion text
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.variantes enable row level security;
alter table public.configuracion enable row level security;

drop policy if exists "lectura_publica_categorias" on public.categorias;
drop policy if exists "escritura_publica_categorias" on public.categorias;
create policy "lectura_publica_categorias" on public.categorias for select using (true);
create policy "escritura_publica_categorias" on public.categorias for all using (true) with check (true);

drop policy if exists "lectura_publica_productos" on public.productos;
drop policy if exists "escritura_publica_productos" on public.productos;
create policy "lectura_publica_productos" on public.productos for select using (true);
create policy "escritura_publica_productos" on public.productos for all using (true) with check (true);

drop policy if exists "lectura_publica_variantes" on public.variantes;
drop policy if exists "escritura_publica_variantes" on public.variantes;
create policy "lectura_publica_variantes" on public.variantes for select using (true);
create policy "escritura_publica_variantes" on public.variantes for all using (true) with check (true);

drop policy if exists "lectura_publica_config" on public.configuracion;
drop policy if exists "escritura_publica_config" on public.configuracion;
create policy "lectura_publica_config" on public.configuracion for select using (true);
create policy "escritura_publica_config" on public.configuracion for all using (true) with check (true);

-- ============================================
-- CONFIGURACION (reglas de negocio globales)
-- ============================================
insert into public.configuracion (clave, valor, descripcion) values
  ('area_minima',                 9,    'Area minima facturable en m² (3x3)'),
  ('monto_minimo_mano_obra',     450,   'Monto minimo de mano de obra en Bs (3x3) - fallback global'),
  ('ancho_placa',                 0.25, 'Ancho de placa en metros (estandar)')
on conflict (clave) do nothing;

-- ============================================
-- FIN - La base queda VACÍA de inventario.
-- Creá categorías desde Inventario > Categorías > + Nueva.
-- ============================================
