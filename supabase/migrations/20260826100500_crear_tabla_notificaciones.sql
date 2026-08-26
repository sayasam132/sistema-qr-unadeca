-- Avisos dirigidos a un usuario (por ejemplo, al resolver una solicitud de
-- permiso o al registrar un movimiento).
create table public.notificaciones (
	id uuid primary key default gen_random_uuid(),
	usuario_id uuid not null references public.usuarios (id) on delete cascade,
	titulo text not null,
	mensaje text not null,
	leida boolean not null default false,
	creado_en timestamptz not null default now()
);

alter table public.notificaciones enable row level security;

-- Un usuario solo puede marcar sus notificaciones como leídas, no editar su
-- contenido.
grant select, insert, update on public.notificaciones to authenticated;
revoke update on public.notificaciones from authenticated;
grant update (leida) on public.notificaciones to authenticated;

create policy "notificaciones_select_propio" on public.notificaciones
	for select
	to authenticated
	using (usuario_id = auth.uid());

create policy "notificaciones_update_propio" on public.notificaciones
	for update
	to authenticated
	using (usuario_id = auth.uid())
	with check (usuario_id = auth.uid());

-- Solo admin genera notificaciones nuevas.
create policy "notificaciones_insert_admin" on public.notificaciones
	for insert
	to authenticated
	with check (public.rol_actual() = 'admin');
