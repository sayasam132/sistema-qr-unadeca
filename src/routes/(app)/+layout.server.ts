import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user } }) => {
	if (!session) {
		redirect(303, '/login');
	}

	// TODO (fase 2): cargar el perfil desde la tabla `perfiles` (incluye el
	// rol) y usarlo para restringir /admin y /guardia según corresponda.
	return { session, user };
};
