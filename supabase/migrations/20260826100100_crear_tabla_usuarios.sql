-- Perfil de cada usuario autenticado. El id coincide con el id de auth.users.
create table public.usuarios (
	id uuid primary key references auth.users (id) on delete cascade,
	nombre_completo text not null,
	carnet text not null unique,
	correo text not null,
	rol_id smallint not null references public.roles (id),
	foto_url text,
	creado_en timestamptz not null default now()
);

alter table public.usuarios enable row level security;

-- El alta de la fila ocurre desde el trigger on_auth_user_created (ver
-- 20260826100200_crear_funciones_rol.sql), por eso no se otorga insert al
-- cliente. El rol y el carnet quedan protegidos: solo se permite actualizar
-- nombre_completo y foto_url.
grant select, update on public.usuarios to authenticated;
revoke update on public.usuarios from authenticated;
grant update (nombre_completo, foto_url) on public.usuarios to authenticated;

create policy "usuarios_select_propio" on public.usuarios
	for select
	to authenticated
	using (id = auth.uid());

create policy "usuarios_update_propio" on public.usuarios
	for update
	to authenticated
	using (id = auth.uid())
	with check (id = auth.uid());
