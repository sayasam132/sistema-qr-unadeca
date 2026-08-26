import { generarCodigoQR } from '$lib/utils/qr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, locals: { supabase } }) => {
	const { perfil } = await parent();

	// El contenido del QR es el id del perfil: es lo que el guardia lee al
	// escanear para buscar al usuario y registrar el movimiento.
	const qrDataUrl = await generarCodigoQR(perfil?.id ?? '');

	let fotoUrl: string | null = null;
	if (perfil?.foto_url) {
		const { data } = await supabase.storage
			.from('fotos-perfil')
			.createSignedUrl(perfil.foto_url, 3600);
		fotoUrl = data?.signedUrl ?? null;
	}

	return { qrDataUrl, fotoUrl };
};
