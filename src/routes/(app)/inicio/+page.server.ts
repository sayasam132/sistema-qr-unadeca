import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase, user } }) => {
	const { perfil } = await parent();

	if (perfil?.tipo_usuario === 'admin') {
		const [{ count: notificacionesPendientes }, { data: permisosRecientes }] = await Promise.all([
			supabase
				.from('notificaciones')
				.select('id', { count: 'exact', head: true })
				.eq('usuario_id', user!.id)
				.eq('leida', false),
			supabase
				.from('permisos')
				.select('id, tipo_permiso, estado, created_at, usuarios ( nombre, apellido )')
				.order('created_at', { ascending: false })
				.limit(5)
		]);

		// El embed usuarios(...) viene tipado como array sin un tipo de base de
		// datos generado; en la práctica es siempre un único registro.
		const permisosConSolicitante = (permisosRecientes ?? []).map((permiso) => {
			const solicitante = Array.isArray(permiso.usuarios) ? permiso.usuarios[0] : permiso.usuarios;
			return { ...permiso, usuarios: solicitante as { nombre: string; apellido: string } | null };
		});

		return {
			notificacionesPendientes: notificacionesPendientes ?? 0,
			permisosPendientes: 0,
			movimientos: [],
			permisosRecientes: permisosConSolicitante
		};
	}

	const esGuardia = perfil?.tipo_usuario === 'guardia';

	const [
		{ count: notificacionesPendientes },
		{ count: permisosPendientes },
		{ data: movimientos }
	] = await Promise.all([
		supabase
			.from('notificaciones')
			.select('id', { count: 'exact', head: true })
			.eq('usuario_id', user!.id)
			.eq('leida', false),
		supabase
			.from('permisos')
			.select('id', { count: 'exact', head: true })
			.eq('usuario_id', user!.id)
			.eq('estado', 'pendiente'),
		esGuardia
			? Promise.resolve({ data: [] })
			: supabase
					.from('movimientos')
					.select('id, tipo, created_at')
					.eq('usuario_id', user!.id)
					.order('created_at', { ascending: false })
					.limit(2)
	]);

	return {
		notificacionesPendientes: notificacionesPendientes ?? 0,
		permisosPendientes: permisosPendientes ?? 0,
		movimientos: movimientos ?? [],
		permisosRecientes: []
	};
};
