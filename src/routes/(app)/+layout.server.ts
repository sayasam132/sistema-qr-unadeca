import { redirect } from '@sveltejs/kit';
import type { NombreRol } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
	if (!session || !user) {
		redirect(303, '/login');
	}

	const { data: fila } = await supabase
		.from('usuarios')
		.select('id, nombre_completo, carnet, foto_url, roles ( nombre )')
		.eq('id', user.id)
		.single();

	const rol = (fila?.roles as unknown as { nombre: NombreRol } | null)?.nombre ?? null;

	const perfil = fila
		? {
				id: fila.id as string,
				nombre_completo: fila.nombre_completo as string,
				carnet: fila.carnet as string,
				foto_url: fila.foto_url as string | null,
				rol
			}
		: null;

	return { session, user, perfil };
};
