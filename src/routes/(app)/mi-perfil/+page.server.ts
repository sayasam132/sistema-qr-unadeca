import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase, user } }) => {
	const { perfil } = await parent();

	// La URL firmada de la foto y los datos extra del perfil son
	// independientes entre sí: se piden en paralelo en vez de uno detrás
	// del otro.
	const [resultadoFoto, resultadoExtra] = await Promise.all([
		perfil?.foto_url
			? supabase.storage.from('fotos-perfil').createSignedUrl(perfil.foto_url, 3600)
			: Promise.resolve({ data: null, error: null }),
		supabase
			.from('usuarios')
			.select('telefono, identificacion, profesion, identidad_bloqueada, bloqueo_hasta')
			.eq('id', user!.id)
			.single()
	]);

	const fotoUrl = !resultadoFoto.error ? (resultadoFoto.data?.signedUrl ?? null) : null;
	const extra = resultadoExtra.data;

	// El bloqueo vence automáticamente en el próximo corte de cuatrimestre:
	// si bloqueo_hasta ya pasó, se trata como si no estuviera bloqueado.
	const bloqueoVigente =
		!!extra?.identidad_bloqueada &&
		(!extra?.bloqueo_hasta || new Date(extra.bloqueo_hasta) > new Date());

	return {
		fotoUrl,
		telefono: extra?.telefono ?? '',
		identificacion: extra?.identificacion ?? '',
		profesion: extra?.profesion ?? '',
		identidadBloqueada: bloqueoVigente,
		bloqueoHasta: extra?.bloqueo_hasta ?? null
	};
};
