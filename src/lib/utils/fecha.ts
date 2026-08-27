// UNADECA está en Costa Rica: se fuerza esta zona horaria en vez de confiar
// en la del sistema, porque el servidor (sobre todo una vez desplegado en
// Vercel) corre en UTC por defecto y eso desfasaba todas las fechas ~6 horas.
const ZONA_HORARIA = 'America/Costa_Rica';

export function formatearFecha(fecha: string): string {
	return new Date(fecha).toLocaleDateString('es-CR', { timeZone: ZONA_HORARIA });
}

export function formatearHora(fecha: string): string {
	return new Date(fecha).toLocaleTimeString('es-CR', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: ZONA_HORARIA
	});
}

export function formatearFechaHora(fecha: string, separador = ' · '): string {
	return `${formatearFecha(fecha)}${separador}${formatearHora(fecha)}`;
}

/**
 * Para columnas `date` sin hora (fecha_salida, fecha_regreso, bloqueo_hasta).
 * No se puede usar `new Date(fechaIso)` + zona horaria acá: eso interpreta
 * el string como medianoche UTC y, al convertir a Costa Rica (UTC-6),
 * termina mostrando el día anterior. En cambio se arman los componentes de
 * fecha como fecha local directamente, sin pasar por UTC en ningún momento.
 */
export function formatearSoloFecha(fechaIso: string): string {
	const [anio, mes, dia] = fechaIso.split('T')[0].split('-').map(Number);
	return new Date(anio, mes - 1, dia).toLocaleDateString('es-CR');
}

/** Igual que formatearSoloFecha, pero en formato largo ("27 de agosto de 2026"). */
export function formatearSoloFechaLarga(fechaIso: string): string {
	const [anio, mes, dia] = fechaIso.split('T')[0].split('-').map(Number);
	return new Date(anio, mes - 1, dia).toLocaleDateString('es-CR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Descompone una fecha/hora en sus componentes (año, mes, día, hora, minuto)
 * ya calculados en hora de Costa Rica. Los getters normales de Date
 * (getFullYear, getHours, etc.) usan la zona horaria del sistema donde corre
 * el proceso, que en Vercel es UTC — por eso no sirven para comparar "es el
 * mismo día" o "está en este rango horario" de forma confiable.
 */
export function obtenerComponentesCR(fechaIso: string) {
	const formateador = new Intl.DateTimeFormat('en-CA', {
		timeZone: ZONA_HORARIA,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
	const partes = formateador.formatToParts(new Date(fechaIso));
	const obtener = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0';

	return {
		anio: Number(obtener('year')),
		mes: Number(obtener('month')),
		dia: Number(obtener('day')),
		hora: Number(obtener('hour')),
		minuto: Number(obtener('minute'))
	};
}
