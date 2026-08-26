-- Solicitudes de permiso de un usuario (por ejemplo, para salir o ingresar
-- fuera del horario habitual).
create table public.permisos (
	id uuid primary key default gen_random_uuid(),
	usuario_id uuid not null references public.usuarios (id) on delete cascade,
	motivo text not null,
	estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
	resuelto_por uuid references public.usuarios (id),
	resuelto_en timestamptz,
	creado_en timestamptz not null default now()
);

alter table public.permisos enable row level security;

grant select, insert, update on public.permisos to authenticated;

-- El usuario ve sus propias solicitudes; admin ve todas.
create policy "permisos_select" on public.permisos
	for select
	to authenticated
	using (usuario_id = auth.uid() or public.rol_actual() = 'admin');

-- Cualquier usuario autenticado puede crear su propia solicitud.
create policy "permisos_insert_propio" on public.permisos
	for insert
	to authenticated
	with check (usuario_id = auth.uid());

-- Solo admin puede aprobar o rechazar una solicitud.
create policy "permisos_update_admin" on public.permisos
	for update
	to authenticated
	using (public.rol_actual() = 'admin')
	with check (public.rol_actual() = 'admin');
