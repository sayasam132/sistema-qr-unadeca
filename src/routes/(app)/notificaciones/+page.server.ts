import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data: notificaciones } = await supabase
		.from('notificaciones')
		.select('id, titulo, mensaje, tipo, leida, created_at')
		.eq('usuario_id', user!.id)
		.order('created_at', { ascending: false });

	return { notificaciones: notificaciones ?? [] };
};
