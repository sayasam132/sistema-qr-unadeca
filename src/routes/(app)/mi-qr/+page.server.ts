import { generarCodigoQR } from '$lib/utils/qr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	// TODO (fase 2): generar el QR a partir del id real del perfil del usuario,
	// no de un valor de ejemplo.
	const contenidoEjemplo = user?.id ?? 'ejemplo-unadeca';
	const qrDataUrl = await generarCodigoQR(contenidoEjemplo);

	return { qrDataUrl };
};
