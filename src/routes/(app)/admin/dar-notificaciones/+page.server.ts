import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const { data } = await supabase
		.from('notificaciones')
		.select('id, titulo, mensaje, created_at, usuarios!enviado_por ( nombre, apellido )')
		.eq('enviado_por', user!.id)
		.order('created_at', { ascending: false })
		.limit(100);

	// El embed usuarios(...) viene tipado como array sin un tipo de base de
	// datos generado; en la práctica es siempre un único registro.
	const envios = (data ?? []).map((notif) => {
		const remitente = Array.isArray(notif.usuarios) ? notif.usuarios[0] : notif.usuarios;
		return { ...notif, usuarios: remitente as { nombre: string; apellido: string } | null };
	});

	// Un mismo envío masivo genera una fila por destinatario, todas con el
	// mismo título/mensaje/fecha (se insertan en un único statement): se
	// deduplican para mostrar el registro como un solo envío.
	const vistos = new Set<string>();
	const registro = envios.filter((envio) => {
		const clave = `${envio.titulo}|${envio.mensaje}|${envio.created_at}`;
		if (vistos.has(clave)) return false;
		vistos.add(clave);
		return true;
	});

	return { registro };
};
