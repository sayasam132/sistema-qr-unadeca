import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { perfil } = await parent();

	if (perfil?.tipo_usuario !== 'guardia') {
		error(403, 'No tenés permiso para acceder a esta sección.');
	}
};
