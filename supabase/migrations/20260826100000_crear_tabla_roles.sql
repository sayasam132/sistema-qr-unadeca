-- Catálogo de roles del sistema (estudiante, admin, guardia).
create table public.roles (
	id smallint generated always as identity primary key,
	nombre text not null unique check (nombre in ('estudiante', 'admin', 'guardia')),
	descripcion text
);

insert into public.roles (nombre, descripcion)
values
	('estudiante', 'Estudiante con acceso a su código QR y sus solicitudes de permiso'),
	('admin', 'Administrador con acceso total al sistema'),
	('guardia', 'Guardia de seguridad que valida el ingreso mediante QR');

alter table public.roles enable row level security;

grant select on public.roles to authenticated;

-- El catálogo de roles es de solo lectura para el cliente; se administra por
-- migración o directamente en la base de datos.
create policy "roles_lectura_autenticados" on public.roles
	for select
	to authenticated
	using (true);
