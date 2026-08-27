import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// RLS ya filtra: un preceptor solo ve solicitudes de tipo salida_dia de
	// estudiantes de su mismo género.
	const { data } = await supabase
		.from('permisos')
		.select(
			'id, usuario_id, tipo_permiso, motivo, estado, aprobado_admision, aprobado_preceptor, fecha_salida, fecha_regreso, hora_salida, hora_regreso, lugar_destino, created_at, usuarios ( nombre, apellido, identificacion, carnet )'
		)
		.order('created_at', { ascending: false })
		.limit(200);

	// El embed usuarios(...) viene tipado como array sin un tipo de base de
	// datos generado; en la práctica es siempre un único registro.
	const permisos = (data ?? []).map((permiso) => {
		const usuario = Array.isArray(permiso.usuarios) ? permiso.usuarios[0] : permiso.usuarios;
		return {
			...permiso,
			usuarios: usuario as {
				nombre: string;
				apellido: string;
				identificacion: string | null;
				carnet: string | null;
			} | null
		};
	});

	return { permisos };
};
