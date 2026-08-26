import { generarCodigoQR } from '$lib/utils/qr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { perfil } = await parent();

	// El contenido del QR es el id del perfil: es lo que el guardia lee al
	// escanear para buscar al usuario y registrar el movimiento.
	const qrDataUrl = await generarCodigoQR(perfil?.id ?? '');

	return { qrDataUrl };
};
