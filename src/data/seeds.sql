-- ============================================
-- RNS PVC - Schema de Inventario (Supabase / PostgreSQL)
-- Ejecutar TODO este archivo en: SQL Editor de Supabase
-- ============================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";

-- ============================================
-- 1. CATEGORIAS
-- ============================================
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  rol text not null check (rol in ('placa','perfil','cornisa','union','consumible','servicio')),
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
-- 3. VARIANTES (SKU de tienda)
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
-- 4. CONFIGURACION (reglas de negocio editables)
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

-- Por ahora (sin login): SELECT publico, escritura abierta.
-- Cuando agreguemos login, se restringe la escritura.
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
-- DATOS INICIALES (SEEDS)
-- 1 de cada uno para arrancar
-- ============================================

-- ---------- CATEGORIAS ----------
insert into public.categorias (nombre, slug, rol, unidad_default, requiere_dimensiones, requiere_color, orden) values
  ('Placa PVC',         'placa',         'placa',      'pza',         true,  true,  1),
  ('Montante',          'montante',      'perfil',     'pza (3 m)',   true,  false, 2),
  ('Omega',             'omega',         'perfil',     'pza (3 m)',   true,  false, 3),
  ('Angulo',            'angulo',        'perfil',     'pza (3 m)',   true,  false, 4),
  ('Cornisa',           'cornisa',       'cornisa',    'pza (6 m)',   true,  true,  5),
  ('Union H',           'union_h',       'union',      'pza (6 m)',   true,  false, 6),
  ('Tornillo T1',       'tornillo_t1',   'consumible', 'bolsa',       false, false, 7),
  ('Tornillo y Tarugo', 'tornillo_tarugo','consumible','bolsa',       false, false, 8),
  ('Mano de Obra',      'mano_obra',     'servicio',   'Bs/m²',       false, false, 9),
  ('Obra Vendida',      'obra_vendida',  'servicio',   'Bs/m²',       false, false, 10)
on conflict (slug) do nothing;

-- ---------- PRODUCTOS ----------
-- Placas
insert into public.productos (categoria_id, nombre, largo, ancho, espesor) values
  ((select id from public.categorias where slug='placa'), 'QAC-UV',  6, 0.25, '0.7 mm'),
  ((select id from public.categorias where slug='placa'), 'AU-UVU',  6, 0.25, '0.8 mm'),
  ((select id from public.categorias where slug='placa'), 'UVU',     4, 0.25, '0.8 mm');

-- Perfiles (largo 3 m)
insert into public.productos (categoria_id, nombre, largo) values
  ((select id from public.categorias where slug='montante'), 'Montante', 3),
  ((select id from public.categorias where slug='omega'),    'Omega',    3),
  ((select id from public.categorias where slug='angulo'),   'Angulo',   3);

-- Cornisa (6 m)
insert into public.productos (categoria_id, nombre, largo) values
  ((select id from public.categorias where slug='cornisa'), 'Cornisa BJX', 6);

-- Union H (6 m)
insert into public.productos (categoria_id, nombre, largo) values
  ((select id from public.categorias where slug='union_h'), 'Union H', 6);

-- Consumibles
insert into public.productos (categoria_id, nombre) values
  ((select id from public.categorias where slug='tornillo_t1'),    'Tornillo T1'),
  ((select id from public.categorias where slug='tornillo_tarugo'),'Tornillo y Tarugo');

-- Servicios
insert into public.productos (categoria_id, nombre) values
  ((select id from public.categorias where slug='mano_obra'),     'Mano de Obra'),
  ((select id from public.categorias where slug='obra_vendida'), 'Obra Vendida');

-- ---------- VARIANTES ----------
-- QAC-UV 6m
insert into public.variantes (producto_id, codigo, color, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='QAC-UV'), 'QAC-2543', 'Madera Acanelado', 67),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='QAC-UV'), 'QAC-2541', 'Blanco Franja',     67),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='QAC-UV'), 'QAC-2524', 'Madera Nogal',      67),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='QAC-UV'), 'QAC-2500', 'Blanco',            67),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='QAC-UV'), 'QAC-2532', 'Madera',            67);

-- AU-UVU 6m
insert into public.variantes (producto_id, codigo, color, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='AU-UVU'), 'AU-2511', 'Blanco Cepillado', 72),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='AU-UVU'), 'AU-2502', 'Blanco Madera',    72),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='AU-UVU'), 'AU-2545', 'Blanco Ceja',      72);

-- UVU 4m
insert into public.variantes (producto_id, codigo, color, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='UVU'), 'QAC-2500-4', 'Blanco',      50),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='UVU'), 'QAC-2532-4', 'Madera',      50),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='placa' and p.nombre='UVU'), 'AU-2545-4',  'Blanco Ceja', 50);

-- Perfiles (1 variante cada uno, sin color)
insert into public.variantes (producto_id, codigo, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='montante' and p.nombre='Montante'), 'MONT-3', 23),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='omega' and p.nombre='Omega'),       'OMG-3',  22),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='angulo' and p.nombre='Angulo'),     'ANG-3',  13);

-- Cornisa
insert into public.variantes (producto_id, codigo, color, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='cornisa' and p.nombre='Cornisa BJX'), 'BJX-6', 'Blanco', 30);

-- Union H
insert into public.variantes (producto_id, codigo, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='union_h' and p.nombre='Union H'), 'UNH-6', 30);

-- Consumibles
insert into public.variantes (producto_id, codigo, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='tornillo_t1' and p.nombre='Tornillo T1'), 'T1-100', 40),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='tornillo_tarugo' and p.nombre='Tornillo y Tarugo'), 'TT-100', 25);

-- Servicios (precio = tarifa por m²)
insert into public.variantes (producto_id, codigo, precio) values
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='mano_obra' and p.nombre='Mano de Obra'), 'MO', 30),
  ((select p.id from public.productos p join public.categorias c on p.categoria_id=c.id where c.slug='obra_vendida' and p.nombre='Obra Vendida'), 'OV', 140);

-- ---------- CONFIGURACION ----------
insert into public.configuracion (clave, valor, descripcion) values
  ('area_minima',                 9,    'Tarifa minima facturable en m² (3x3)'),
  ('monto_minimo_mano_obra',     450,   'Monto minimo de mano de obra en Bs (3x3)'),
  ('espaciado_montantes',         1.2,  'Separacion entre montantes en metros'),
  ('espaciado_omegas',            0.6,  'Separacion entre omegas en metros'),
  ('largo_cornisa',               6,    'Largo de cornisa en metros'),
  ('largo_perfil',                3,    'Largo de perfiles (montante/omega/angulo) en metros'),
  ('ancho_placa',                 0.25, 'Ancho de placa en metros'),
  ('rendimiento_tornillos',       20,   'm² cubiertos por bolsa de tornillos'),
  ('umbral_refuerzo_montantes',   16,   'm² por cada refuerzo extra de montante (4x4)')
on conflict (clave) do nothing;

-- ============================================
-- FIN
-- ============================================
