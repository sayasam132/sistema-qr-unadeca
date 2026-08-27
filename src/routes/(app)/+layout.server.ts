import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase } }) => {
	if (!session || !user) {
		redirect(303, '/login');
	}

	const { data: perfil } = await supabase
		.from('usuarios')
		.select(
			'id, nombre, apellido, correo, carnet, identificacion, hogar, genero, foto_url, qr_url, tipo_usuario, consentimiento'
		)
		.eq('id', user.id)
		.single();

	return { session, user, perfil };
};
