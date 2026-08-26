export type NombreRol = 'estudiante' | 'admin' | 'guardia';

export interface Rol {
	id: number;
	nombre: NombreRol;
	descripcion: string | null;
}

export interface Usuario {
	id: string;
	nombre_completo: string;
	carnet: string;
	correo: string;
	rol_id: number;
	foto_url: string | null;
	creado_en: string;
}

/** Perfil del usuario autenticado con el nombre del rol ya resuelto. */
export interface PerfilUsuario {
	id: string;
	nombre_completo: string;
	carnet: string;
	foto_url: string | null;
	rol: NombreRol | null;
}

export type EstadoPermiso = 'pendiente' | 'aprobada' | 'rechazada';

export interface Permiso {
	id: string;
	usuario_id: string;
	motivo: string;
	estado: EstadoPermiso;
	resuelto_por: string | null;
	resuelto_en: string | null;
	creado_en: string;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
	id: string;
	usuario_id: string;
	registrado_por: string;
	tipo: TipoMovimiento;
	creado_en: string;
}

export interface Notificacion {
	id: string;
	usuario_id: string;
	titulo: string;
	mensaje: string;
	leida: boolean;
	creado_en: string;
}
