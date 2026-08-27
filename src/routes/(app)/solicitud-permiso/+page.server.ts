import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { perfil } = await parent();

	if (perfil?.tipo_usuario !== 'estudiante' || perfil?.hogar !== 'interno') {
		error(403, 'La solicitud de permiso es solo para estudiantes internos.');
	}
};
