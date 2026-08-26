export type RolUsuario = 'estudiante' | 'admin' | 'guardia';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface PerfilUsuario {
	id: string;
	nombre_completo: string;
	carnet: string;
	rol: RolUsuario;
	foto_url: string | null;
}

export interface SolicitudPermiso {
	id: string;
	usuario_id: string;
	motivo: string;
	estado: EstadoSolicitud;
	creado_en: string;
}
