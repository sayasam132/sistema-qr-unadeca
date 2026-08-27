import { fail } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase-admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: guardias } = await supabase
		.from('usuarios')
		.select('id, nombre, apellido, genero')
		.eq('tipo_usuario', 'guardia')
		.order('nombre', { ascending: true });

	return { guardias: guardias ?? [] };
};

export const actions: Actions = {
	crear: async ({ request }) => {
		const datos = await request.formData();
		const nombre = String(datos.get('nombre') ?? '').trim();
		const apellido = String(datos.get('apellido') ?? '').trim();
		const correo = String(datos.get('correo') ?? '').trim();
		const contrasena = String(datos.get('contrasena') ?? '');
		const genero = String(datos.get('genero') ?? '');

		if (
			!nombre ||
			!apellido ||
			!correo ||
			contrasena.length < 6 ||
			(genero !== 'masculino' && genero !== 'femenino')
		) {
			return fail(400, {
				error:
					'Completá nombre, apellido, correo, una contraseña de al menos 6 caracteres, y elegí Barones o Señoritas.'
			});
		}

		const { data: alta, error: errorAlta } = await supabaseAdmin.auth.admin.createUser({
			email: correo,
			password: contrasena,
			email_confirm: true,
			user_metadata: { nombre, apellido, tipo_usuario: 'guardia' }
		});

		if (errorAlta || !alta.user) {
			return fail(400, {
				error: `No se pudo crear la cuenta: ${errorAlta?.message ?? 'error desconocido'}`
			});
		}

		// La identificación es obligatoria y única en la base, pero no se pide
		// en este formulario (así queda igual al diseño): el guardia la
		// completa desde Mi Perfil la primera vez que entra, y ahí queda
		// bloqueada. Se usa el correo como placeholder para que nunca choque
		// con el de otra cuenta.
		const { error: errorPerfil } = await supabaseAdmin.from('usuarios').insert({
			id: alta.user.id,
			nombre,
			apellido,
			correo,
			tipo_usuario: 'guardia',
			identificacion: `Pendiente-${correo}`,
			genero,
			consentimiento: false
		});

		if (errorPerfil) {
			// Sin perfil la cuenta queda huérfana e inutilizable: revertimos el
			// alta de auth para no dejarla a medio crear.
			await supabaseAdmin.auth.admin.deleteUser(alta.user.id);
			return fail(400, { error: `No se pudo crear el perfil: ${errorPerfil.message}` });
		}

		return { exito: true, correo };
	},

	eliminar: async ({ request }) => {
		const datos = await request.formData();
		const id = String(datos.get('id') ?? '');

		if (!id) {
			return fail(400, { error: 'Falta el id del guardia a eliminar.' });
		}

		// Defensa extra: solo se borran cuentas que efectivamente son guardias,
		// aunque el formulario ya solo lista guardias.
		const { data: usuario } = await supabaseAdmin
			.from('usuarios')
			.select('tipo_usuario')
			.eq('id', id)
			.single();

		if (usuario?.tipo_usuario !== 'guardia') {
			return fail(400, { error: 'Esa cuenta no es de un guardia.' });
		}

		const { error: errorEliminar } = await supabaseAdmin.auth.admin.deleteUser(id);
		if (errorEliminar) {
			return fail(400, { error: `No se pudo eliminar la cuenta: ${errorEliminar.message}` });
		}

		return { eliminado: true };
	}
};
