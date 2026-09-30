-- IronPulse · esquema base
-- Pegar en Supabase → SQL → New query → Run

create extension if not exists "pgcrypto";

-- Perfiles: user_id enlaza con auth; null = atleta demo sin cuenta real
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete cascade,
  email text,
  nombre text not null,
  alias text not null,
  socio text not null,
  apodo text,
  avatar_color text not null default '#ff3b5c',
  rol text not null default 'socio' check (rol in ('socio', 'admin')),
  es_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create sequence if not exists public.socio_seq start with 100 increment by 1;

-- Emails que reciben rol admin al registrarse (rellenar en SETUP)
create table if not exists public.admin_emails (
  email text primary key
);

alter table public.admin_emails enable row level security;
drop policy if exists "admin_emails_select_auth" on public.admin_emails;
create policy "admin_emails_select_auth"
  on public.admin_emails for select
  to authenticated
  using (true);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  machine_id text not null,
  peso numeric not null check (peso > 0),
  reps integer not null check (reps > 0),
  tipo text not null default 'efectiva' check (tipo in ('calentamiento', 'efectiva')),
  rpe numeric,
  nota text,
  fecha timestamptz not null default now(),
  es_demo boolean not null default false
);

create index if not exists series_fecha_idx on public.series (fecha desc);
create index if not exists series_member_idx on public.series (member_id);
create index if not exists series_machine_idx on public.series (machine_id);

alter table public.profiles enable row level security;
alter table public.series enable row level security;

-- Lectura abierta a usuarios autenticados (rankings de sala)
drop policy if exists "profiles_select_auth" on public.profiles;
create policy "profiles_select_auth"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and rol = (select p.rol from public.profiles p where p.user_id = auth.uid())
  );

drop policy if exists "series_select_auth" on public.series;
create policy "series_select_auth"
  on public.series for select
  to authenticated
  using (true);

drop policy if exists "series_insert_own" on public.series;
create policy "series_insert_own"
  on public.series for insert
  to authenticated
  with check (
    member_id in (select id from public.profiles where user_id = auth.uid())
    and es_demo = false
  );

drop policy if exists "series_delete_own" on public.series;
create policy "series_delete_own"
  on public.series for delete
  to authenticated
  using (
    member_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Rankings públicos de solo lectura para visitantes (sala / QR sin login)
drop policy if exists "profiles_select_anon_demo_or_public" on public.profiles;
create policy "profiles_select_anon_demo_or_public"
  on public.profiles for select
  to anon
  using (true);

drop policy if exists "series_select_anon" on public.series;
create policy "series_select_anon"
  on public.series for select
  to anon
  using (true);

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and rol = 'admin'
  );
$$;

revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to authenticated;

-- Alta automática de perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  colores text[] := array['#ff3b5c','#fbbf24','#22d3ee','#f97316','#34d399','#a78bfa','#f472b6','#60a5fa'];
  alias_base text;
  num_socio text;
begin
  alias_base := split_part(coalesce(new.email, 'socio'), '@', 1);
  if length(alias_base) < 2 then
    alias_base := 'Socio';
  end if;
  num_socio := lpad(nextval('public.socio_seq')::text, 3, '0');

  insert into public.profiles (user_id, email, nombre, alias, socio, avatar_color, rol)
  values (
    new.id,
    new.email,
    initcap(replace(alias_base, '.', ' ')),
    initcap(alias_base),
    num_socio,
    colores[1 + floor(random() * array_length(colores, 1))::int],
    case
      when lower(coalesce(new.email, '')) in (
        select lower(email) from public.admin_emails
      ) then 'admin'
      else 'socio'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Limpia atletas demo
create or replace function public.clear_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin() then
    raise exception 'Solo administradores';
  end if;
  delete from public.series where es_demo = true;
  delete from public.profiles where es_demo = true;
end;
$$;

revoke all on function public.clear_demo() from public;
grant execute on function public.clear_demo() to authenticated;

-- Seed demo (perfiles sintéticos + marcas fijas + historial corto)
create or replace function public.seed_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ids uuid[] := array[
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'a0000000-0000-4000-8000-000000000002'::uuid,
    'a0000000-0000-4000-8000-000000000003'::uuid,
    'a0000000-0000-4000-8000-000000000004'::uuid,
    'a0000000-0000-4000-8000-000000000005'::uuid,
    'a0000000-0000-4000-8000-000000000006'::uuid,
    'a0000000-0000-4000-8000-000000000007'::uuid,
    'a0000000-0000-4000-8000-000000000008'::uuid,
    'a0000000-0000-4000-8000-000000000009'::uuid,
    'a0000000-0000-4000-8000-00000000000a'::uuid,
    'a0000000-0000-4000-8000-00000000000b'::uuid,
    'a0000000-0000-4000-8000-00000000000c'::uuid
  ];
  hoy date := current_date;
begin
  if not public.es_admin() then
    raise exception 'Solo administradores';
  end if;

  perform public.clear_demo();

  insert into public.profiles (id, email, nombre, alias, socio, apodo, avatar_color, rol, es_demo) values
    (ids[1], 'demo+marcos@ironpulse.local', 'Marcos Rivas', 'Marcos', '248', null, '#ff3b5c', 'socio', true),
    (ids[2], 'demo+carlos@ironpulse.local', 'Carlos Mendoza', 'Carlos M.', '112', 'Titán', '#fbbf24', 'socio', true),
    (ids[3], 'demo+david@ironpulse.local', 'David Vargas', 'David V.', '087', null, '#22d3ee', 'socio', true),
    (ids[4], 'demo+javier@ironpulse.local', 'Javier Soler', 'Javier S.', '199', null, '#f97316', 'socio', true),
    (ids[5], 'demo+sofia@ironpulse.local', 'Sofía Torres', 'Sofía T.', '230', null, '#34d399', 'socio', true),
    (ids[6], 'demo+mateo@ironpulse.local', 'Mateo Gil', 'Mateo G.', '145', null, '#a78bfa', 'socio', true),
    (ids[7], 'demo+lucia@ironpulse.local', 'Lucía Bermúdez', 'Lucía B.', '301', null, '#f472b6', 'socio', true),
    (ids[8], 'demo+elena@ironpulse.local', 'Elena Ruiz', 'Elena R.', '064', null, '#facc15', 'socio', true),
    (ids[9], 'demo+rodrigo@ironpulse.local', 'Rodrigo Toledo', 'Rodrigo T.', '012', 'Vikingo', '#60a5fa', 'socio', true),
    (ids[10], 'demo+nerea@ironpulse.local', 'Nerea Campos', 'Nerea C.', '276', null, '#4ade80', 'socio', true),
    (ids[11], 'demo+ivan@ironpulse.local', 'Iván Moya', 'Iván M.', '158', null, '#fb7185', 'socio', true),
    (ids[12], 'demo+carmen@ironpulse.local', 'Carmen Gil', 'Carmen G.', '204', null, '#c084fc', 'socio', true);

  -- Marcas fijas (remo semana, prensa, etc.)
  insert into public.series (member_id, machine_id, peso, reps, tipo, rpe, fecha, es_demo) values
    (ids[2], 'm14', 120, 10, 'efectiva', 9.5, hoy::timestamptz + interval '19 hours', true),
    (ids[3], 'm14', 115, 8, 'efectiva', 9.5, (hoy - 1)::timestamptz + interval '19 hours', true),
    (ids[4], 'm14', 110, 9, 'efectiva', 9.5, (hoy - 1)::timestamptz + interval '19 hours', true),
    (ids[5], 'm14', 102.5, 8, 'efectiva', 9.5, (hoy - 2)::timestamptz + interval '19 hours', true),
    (ids[6], 'm14', 90, 10, 'efectiva', 9.5, hoy::timestamptz + interval '19 hours', true),
    (ids[7], 'm14', 87.5, 8, 'efectiva', 9.5, (hoy - 1)::timestamptz + interval '19 hours', true),
    (ids[1], 'm14', 85, 10, 'efectiva', 9.5, hoy::timestamptz + interval '19 hours', true),
    (ids[1], 'm06', 310, 8, 'efectiva', 9.5, (hoy - 2)::timestamptz + interval '19 hours', true),
    (ids[2], 'm22', 46, 8, 'efectiva', 9.5, (hoy - 12)::timestamptz + interval '19 hours', true),
    (ids[9], 'm22', 44, 6, 'efectiva', 9.5, (hoy - 20)::timestamptz + interval '19 hours', true),
    (ids[4], 'm22', 40, 8, 'efectiva', 9.5, (hoy - 7)::timestamptz + interval '19 hours', true),
    (ids[1], 'm22', 38, 6, 'efectiva', 9.5, (hoy - 38)::timestamptz + interval '19 hours', true),
    (ids[1], 'm21', 90, 12, 'efectiva', 9.5, (hoy - 6)::timestamptz + interval '19 hours', true),
    (ids[9], 'm11', 105, 5, 'efectiva', 9.5, (hoy - 224)::timestamptz + interval '19 hours', true);

  -- Historial corto: 4 semanas × miembros × 2 máquinas
  insert into public.series (member_id, machine_id, peso, reps, tipo, rpe, fecha, es_demo)
  select
    ids[1 + ((g.n + m.n) % 12)],
    (array['m14','m06','m22','m11','m21','m01','m02'])[1 + (g.n % 7)],
    40 + ((g.n * 7 + m.n * 3) % 80),
    6 + (g.n % 6),
    case when m.n % 4 = 0 then 'calentamiento' else 'efectiva' end,
    7 + (g.n % 3),
    (hoy - ((g.n % 28))::int)::timestamptz + make_interval(hours => 9 + (g.n % 8)),
    true
  from generate_series(0, 83) as g(n)
  cross join generate_series(0, 2) as m(n);
end;
$$;

revoke all on function public.seed_demo() from public;
grant execute on function public.seed_demo() to authenticated;
