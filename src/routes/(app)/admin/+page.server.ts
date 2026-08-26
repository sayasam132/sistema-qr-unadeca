import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { perfil } = await parent();

	if (perfil?.rol !== 'admin') {
		error(403, 'No tenés permiso para acceder a esta sección.');
	}
};
