-- Registro de entradas y salidas, generado cuando un guardia escanea el QR
-- de un usuario.
create table public.movimientos (
	id uuid primary key default gen_random_uuid(),
	usuario_id uuid not null references public.usuarios (id) on delete cascade,
	registrado_por uuid not null references public.usuarios (id),
	tipo text not null check (tipo in ('entrada', 'salida')),
	creado_en timestamptz not null default now()
);

alter table public.movimientos enable row level security;

grant select, insert on public.movimientos to authenticated;

-- El usuario ve sus propios movimientos; admin y guardia ven todos.
create policy "movimientos_select" on public.movimientos
	for select
	to authenticated
	using (usuario_id = auth.uid() or public.rol_actual() in ('admin', 'guardia'));

-- Solo guardia o admin pueden registrar un movimiento, y solo a su propio
-- nombre como responsable del registro (evita que alguien atribuya un
-- ingreso a otra persona).
create policy "movimientos_insert_guardia_admin" on public.movimientos
	for insert
	to authenticated
	with check (
		public.rol_actual() in ('guardia', 'admin')
		and registrado_por = auth.uid()
	);
