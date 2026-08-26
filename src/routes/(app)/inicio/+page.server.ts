import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
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
		supabase
			.from('movimientos')
			.select('id, tipo, creado_en')
			.eq('usuario_id', user!.id)
			.order('creado_en', { ascending: false })
			.limit(2)
	]);

	return {
		notificacionesPendientes: notificacionesPendientes ?? 0,
		permisosPendientes: permisosPendientes ?? 0,
		movimientos: movimientos ?? []
	};
};
