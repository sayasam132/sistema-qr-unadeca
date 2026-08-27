export type TipoUsuario =
	'estudiante' | 'visitante' | 'profesor' | 'admin' | 'guardia' | 'preceptor';

export type Hogar = 'interno' | 'externo';
export type Genero = 'masculino' | 'femenino';

export interface Usuario {
	id: string;
	nombre: string;
	apellido: string;
	correo: string;
	tipo_usuario: TipoUsuario;
	carnet: string | null;
	identificacion: string | null;
	foto_url: string | null;
	qr_url: string | null;
	estado: string;
	hogar: Hogar | null;
	genero: Genero | null;
	consentimiento: boolean;
	created_at: string;
}

/** Perfil del usuario autenticado, con los campos que se usan en el resto de la app. */
export interface PerfilUsuario {
	id: string;
	nombre: string;
	apellido: string;
	correo: string;
	carnet: string | null;
	identificacion: string | null;
	hogar: Hogar | null;
	genero: Genero | null;
	foto_url: string | null;
	qr_url: string | null;
	tipo_usuario: TipoUsuario;
	consentimiento: boolean;
}

export type EstadoPermiso = 'pendiente' | 'aprobada' | 'rechazada';
export type TipoPermiso = 'fin_de_semana' | 'salida_dia';

export interface Permiso {
	id: string;
	usuario_id: string;
	tipo_permiso: TipoPermiso;
	motivo: string;
	estado: EstadoPermiso;
	aprobado_admision: boolean;
	aprobado_preceptor: boolean;
	fecha_salida: string;
	fecha_regreso: string | null;
	hora_salida: string | null;
	hora_regreso: string | null;
	lugar_destino: string | null;
	numero_padre_tutor: string | null;
	created_at: string;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
	id: string;
	usuario_id: string;
	registrado_por: string;
	tipo: TipoMovimiento;
	creado_en: string;
}

export type TipoNotificacion = 'aprobada' | 'rechazada' | 'info';

export interface Notificacion {
	id: string;
	usuario_id: string;
	titulo: string;
	mensaje: string;
	tipo: TipoNotificacion;
	leida: boolean;
	created_at: string;
}
