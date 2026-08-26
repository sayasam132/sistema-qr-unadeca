-- Bucket privado para las fotos de perfil. Cada archivo se guarda bajo
-- "<uid del usuario>/..." dentro del bucket.
insert into storage.buckets (id, name, public)
values ('fotos-perfil', 'fotos-perfil', false)
on conflict (id) do nothing;

create policy "fotos_perfil_insercion_propia" on storage.objects
	for insert
	to authenticated
	with check (
		bucket_id = 'fotos-perfil'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

create policy "fotos_perfil_actualizacion_propia" on storage.objects
	for update
	to authenticated
	using (
		bucket_id = 'fotos-perfil'
		and (storage.foldername(name))[1] = auth.uid()::text
	)
	with check (
		bucket_id = 'fotos-perfil'
		and (storage.foldername(name))[1] = auth.uid()::text
	);

-- El dueño de la foto puede verla; admin y guardia también, para verificar
-- identidad en el ingreso.
create policy "fotos_perfil_lectura" on storage.objects
	for select
	to authenticated
	using (
		bucket_id = 'fotos-perfil'
		and (
			(storage.foldername(name))[1] = auth.uid()::text
			or public.rol_actual() in ('admin', 'guardia')
		)
	);
