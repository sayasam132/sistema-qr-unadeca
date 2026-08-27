import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data } = await supabase
		.from('movimientos')
		.select('id, tipo, created_at, usuarios ( nombre, apellido, identificacion, carnet )')
		.order('created_at', { ascending: false })
		.limit(500);

	// El embed usuarios(...) viene tipado como array sin un tipo de base de
	// datos generado; en la práctica es siempre un único registro.
	const movimientos = (data ?? []).map((movimiento) => {
		const usuario = Array.isArray(movimiento.usuarios)
			? movimiento.usuarios[0]
			: movimiento.usuarios;
		return {
			...movimiento,
			usuarios: usuario as {
				nombre: string;
				apellido: string;
				identificacion: string | null;
				carnet: string | null;
			} | null
		};
	});

	return { movimientos };
};
