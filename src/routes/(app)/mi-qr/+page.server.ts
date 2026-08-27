import { generarCodigoQR } from '$lib/utils/qr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
	const { perfil } = await parent();

	// El QR se genera y se sube a Storage durante el registro (ver
	// registro/+page.svelte). Si por algún motivo no existe todavía
	// (cuentas viejas, o si falló la subida), se genera al vuelo como
	// respaldo para que la página nunca se rompa. Las dos URLs firmadas se
	// piden en paralelo: son independientes entre sí.
	const [resultadoQr, resultadoFoto] = await Promise.all([
		perfil?.qr_url
			? supabase.storage.from('fotos-perfil').createSignedUrl(perfil.qr_url, 3600)
			: Promise.resolve({ data: null, error: null }),
		perfil?.foto_url
			? supabase.storage.from('fotos-perfil').createSignedUrl(perfil.foto_url, 3600)
			: Promise.resolve({ data: null, error: null })
	]);

	let qrDataUrl = !resultadoQr.error ? (resultadoQr.data?.signedUrl ?? null) : null;
	if (!qrDataUrl && perfil?.id) {
		try {
			qrDataUrl = await generarCodigoQR(perfil.id);
		} catch (excepcion) {
			console.error('Error al generar el QR:', excepcion);
		}
	}

	const fotoUrl = !resultadoFoto.error ? (resultadoFoto.data?.signedUrl ?? null) : null;

	return { qrDataUrl, fotoUrl };
};
