-- ============================================
-- DIAGNÓSTICO - Ejecutá esto en el SQL Editor de tu proyecto nuevo
-- para ver qué tablas y columnas existen.
-- ============================================

-- 1. ¿Existe la tabla categorias?
select exists (
  select from information_schema.tables
  where table_schema = 'public' and table_name = 'categorias'
) as existe_categorias;

-- 2. Si existe, ¿qué columnas tiene?
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'categorias'
order by ordinal_position;

-- 3. ¿Cuántas filas tiene?
select count(*) as total_categorias from public.categorias;

-- 4. ¿Qué otras tablas existen?
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
