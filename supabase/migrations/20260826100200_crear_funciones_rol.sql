-- Función auxiliar para conocer el rol del usuario autenticado sin caer en
-- recursión de políticas RLS: al ser security definer corre con los
-- privilegios del dueño de la función, que no está sujeto a RLS.
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = public
as $$
	select r.nombre
	from public.usuarios u
	join public.roles r on r.id = u.rol_id
	where u.id = auth.uid();
$$;

grant execute on function public.rol_actual() to authenticated;

-- Admin necesita ver todos los perfiles para administrarlos; guardia necesita
-- verlos para identificar a la persona dueña de un QR escaneado.
create policy "usuarios_select_admin_guardia" on public.usuarios
	for select
	to authenticated
	using (public.rol_actual() in ('admin', 'guardia'));

-- Alta automática del perfil en public.usuarios cuando se crea la cuenta en
-- auth.users (disparado por supabase.auth.signUp desde el formulario de
-- registro, que envía nombre_completo y carnet como metadata del usuario).
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
	id_rol_estudiante smallint;
begin
	select id into id_rol_estudiante from public.roles where nombre = 'estudiante';

	insert into public.usuarios (id, nombre_completo, carnet, correo, rol_id)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
		coalesce(new.raw_user_meta_data ->> 'carnet', ''),
		new.email,
		id_rol_estudiante
	);

	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.manejar_nuevo_usuario();
