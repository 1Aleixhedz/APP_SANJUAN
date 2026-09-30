-- IronPulse · catálogo de máquinas + Storage
-- Ejecutar en SQL Editor DESPUÉS de schema.sql

create table if not exists public.maquinas (
  id text primary key,
  slug text not null unique,
  bahia text not null,
  sector text not null,
  plataforma text not null default 'Sala',
  familia text not null default 'Cargas guiadas',
  gama text not null default 'Etenon',
  referencia text not null default '',
  nombre text not null,
  nombre_tecnico text not null default '',
  imagen text,
  video text,
  detalles jsonb not null default '[]'::jsonb,
  primarios jsonb not null default '[]'::jsonb,
  secundarios jsonb not null default '[]'::jsonb,
  reclutamiento jsonb not null default '[]'::jsonb,
  telemetria jsonb not null default '{}'::jsonb,
  claves jsonb not null default '[]'::jsonb,
  errores jsonb not null default '[]'::jsonb,
  peso_min numeric not null default 5,
  peso_max numeric not null default 120,
  incremento numeric not null default 2.5,
  unidad text not null default 'kg',
  macros jsonb not null default '[2.5, 5, 10]'::jsonb,
  activa boolean not null default true,
  origen text not null default 'admin' check (origen in ('seed', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists maquinas_slug_idx on public.maquinas (slug);
create index if not exists maquinas_activa_idx on public.maquinas (activa);

alter table public.maquinas enable row level security;

drop policy if exists "maquinas_select_all" on public.maquinas;
create policy "maquinas_select_all"
  on public.maquinas for select
  to anon, authenticated
  using (activa = true or public.es_admin());

drop policy if exists "maquinas_insert_admin" on public.maquinas;
create policy "maquinas_insert_admin"
  on public.maquinas for insert
  to authenticated
  with check (public.es_admin());

drop policy if exists "maquinas_update_admin" on public.maquinas;
create policy "maquinas_update_admin"
  on public.maquinas for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "maquinas_delete_admin" on public.maquinas;
create policy "maquinas_delete_admin"
  on public.maquinas for delete
  to authenticated
  using (public.es_admin());

-- Buckets públicos (lectura) para fotos y vídeos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'maquinas-fotos',
    'maquinas-fotos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'maquinas-videos',
    'maquinas-videos',
    true,
    52428800,
    array['video/mp4', 'video/webm', 'video/quicktime']
  )
on conflict (id) do update set public = excluded.public;

drop policy if exists "fotos_public_read" on storage.objects;
create policy "fotos_public_read"
  on storage.objects for select
  to public
  using (bucket_id in ('maquinas-fotos', 'maquinas-videos'));

drop policy if exists "fotos_admin_insert" on storage.objects;
create policy "fotos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('maquinas-fotos', 'maquinas-videos')
    and public.es_admin()
  );

drop policy if exists "fotos_admin_update" on storage.objects;
create policy "fotos_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('maquinas-fotos', 'maquinas-videos')
    and public.es_admin()
  );

drop policy if exists "fotos_admin_delete" on storage.objects;
create policy "fotos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('maquinas-fotos', 'maquinas-videos')
    and public.es_admin()
  );
