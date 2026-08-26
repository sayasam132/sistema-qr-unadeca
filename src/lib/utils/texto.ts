/** Devuelve las iniciales (nombre + apellido) de un nombre completo, en mayúsculas. */
export function obtenerIniciales(nombreCompleto: string): string {
	const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
	const primera = partes[0]?.[0] ?? '';
	const segunda = partes[1]?.[0] ?? '';
	return (primera + segunda).toUpperCase();
}
