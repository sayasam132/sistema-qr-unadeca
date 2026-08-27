<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import ModalEscaneo from '$lib/components/ModalEscaneo.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import { formatearFechaHora } from '$lib/utils/fecha';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');
	let esEstudiante = $derived(perfil?.tipo_usuario === 'estudiante');
	let esAdmin = $derived(perfil?.tipo_usuario === 'admin');
	let esGuardia = $derived(perfil?.tipo_usuario === 'guardia');

	let mostrarEscaneo = $state(false);

	const etiquetasRol: Record<string, string> = {
		estudiante: 'Estudiante',
		visitante: 'Visitante',
		profesor: 'Profesor / Personal',
		admin: 'Administrador',
		guardia: 'Guardia'
	};

	const infoMovimiento: Record<string, { icono: string; etiqueta: string; clase: string }> = {
		entrada: { icono: '📥', etiqueta: 'Entrada', clase: 'fila-movimiento--entrada' },
		salida: { icono: '📤', etiqueta: 'Salida', clase: 'fila-movimiento--salida' }
	};

	const infoEstadoPermiso: Record<string, { icono: string; clase: string }> = {
		pendiente: { icono: '⏳', clase: '' },
		aprobada: { icono: '✅', clase: 'fila-movimiento--entrada' },
		rechazada: { icono: '❌', clase: 'fila-movimiento--salida' }
	};

	const etiquetasTipoPermiso: Record<string, string> = {
		fin_de_semana: 'Fin de semana',
		salida_dia: 'Salida del día'
	};

	function formatearFecha(fecha: string) {
		return formatearFechaHora(fecha, ' | ');
	}
</script>

<svelte:head>
	<title>Inicio · UNADECA</title>
</svelte:head>

<PanelPagina
	titulo={esAdmin ? 'Inicio Admin' : 'Inicio'}
	subtitulo={`Bienvenido, ${primerNombre}`}
	{iniciales}
	insigniaActiva={!esEstudiante}
>
	{#if esAdmin}
		<a class="inicio__badge-notif" href="/notificaciones">
			🔔 Notificaciones
			{#if data.notificacionesPendientes > 0}
				<span class="inicio__badge-numero">{data.notificacionesPendientes}</span>
			{/if}
		</a>

		<p class="inicio__subtitulo-seccion">Registro de permisos</p>

		{#if data.permisosRecientes.length === 0}
			<div class="fila-movimiento">
				<p>Todavía no hay solicitudes registradas.</p>
			</div>
		{:else}
			{#each data.permisosRecientes as permiso (permiso.id)}
				<div class="fila-movimiento {infoEstadoPermiso[permiso.estado]?.clase ?? ''}">
					<p>
						{infoEstadoPermiso[permiso.estado]?.icono ?? ''}
						{permiso.usuarios?.nombre}
						{permiso.usuarios?.apellido} ·
						{etiquetasTipoPermiso[permiso.tipo_permiso] ?? permiso.tipo_permiso} · {formatearFecha(
							permiso.created_at
						)}
					</p>
				</div>
			{/each}
		{/if}
	{:else}
		<div class="inicio">
			<div class="inicio__perfil">
				<p class="inicio__nombre">{perfil?.nombre} {perfil?.apellido}</p>

				{#if esEstudiante}
					<p class="inicio__rol">{etiquetasRol[perfil?.tipo_usuario ?? ''] ?? ''}</p>
					{#if perfil?.carnet}
						<p class="inicio__dato">Carné: {perfil.carnet}</p>
					{/if}
					<span class="inicio__chip">✅ Activo</span>
				{:else}
					<p class="inicio__rol">{etiquetasRol[perfil?.tipo_usuario ?? ''] ?? ''}</p>
					{#if perfil?.identificacion}
						<p class="inicio__dato">Identificación: {perfil.identificacion}</p>
					{/if}
				{/if}

				{#if esGuardia}
					<button
						type="button"
						class="inicio__boton-escaneo"
						onclick={() => (mostrarEscaneo = true)}
					>
						📷 Iniciar Escaneo
					</button>
				{/if}
			</div>

			<div class="inicio__contenido">
				{#if esEstudiante}
					<div class="inicio__resumen">
						<div class="tarjeta-resumen tarjeta-resumen--notif">
							<p class="tarjeta-resumen__titulo">🔔 Notificaciones</p>
							<p class="tarjeta-resumen__texto">
								{data.notificacionesPendientes > 0
									? `Tenés ${data.notificacionesPendientes} notificación(es) sin leer`
									: 'No tenés notificaciones pendientes'}
							</p>
						</div>
						<div class="tarjeta-resumen tarjeta-resumen--permiso">
							<p class="tarjeta-resumen__titulo">📋 Solicitud de permiso</p>
							<p class="tarjeta-resumen__texto">
								{data.permisosPendientes > 0
									? `Tenés ${data.permisosPendientes} solicitud(es) pendiente(s)`
									: 'No tenés solicitudes activas'}
							</p>
						</div>
					</div>
				{:else}
					<a class="inicio__badge-notif" href="/notificaciones">
						🔔 Notificaciones
						{#if data.notificacionesPendientes > 0}
							<span class="inicio__badge-numero">{data.notificacionesPendientes}</span>
						{/if}
					</a>
				{/if}

				<p class="inicio__subtitulo-seccion">Últimos movimientos</p>

				{#if data.movimientos.length === 0}
					<div class="fila-movimiento">
						<p>Todavía no tenés movimientos registrados.</p>
					</div>
				{:else}
					{#each data.movimientos as movimiento (movimiento.id)}
						<div class="fila-movimiento {infoMovimiento[movimiento.tipo].clase}">
							<p>
								{infoMovimiento[movimiento.tipo].icono}
								{infoMovimiento[movimiento.tipo].etiqueta} | {formatearFecha(movimiento.created_at)}
							</p>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</PanelPagina>

{#if mostrarEscaneo && perfil}
	<ModalEscaneo {supabase} guardiaId={perfil.id} cerrar={() => (mostrarEscaneo = false)} />
{/if}

<style>
	.inicio {
		display: flex;
		flex-wrap: wrap;
		gap: 3rem;
	}

	.inicio__perfil {
		min-width: 200px;
	}

	.inicio__nombre {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 1.1rem;
		margin: 0 0 0.4rem;
	}

	.inicio__rol {
		color: var(--color-teal);
		font-size: 0.9rem;
		margin: 0 0 0.6rem;
	}

	.inicio__dato {
		color: #555;
		font-size: 0.9rem;
		margin: 0 0 0.3rem;
	}

	.inicio__boton-escaneo {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 40px;
		padding: 0 1.1rem;
		margin-top: 1rem;
		border: none;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: bold;
		cursor: pointer;
	}

	.inicio__chip {
		display: inline-flex;
		align-items: center;
		margin-top: 0.8rem;
		padding: 0.35rem 0.9rem;
		border-radius: 15px;
		background-color: var(--color-mint);
		color: var(--color-navy);
		font-weight: bold;
		font-size: 0.75rem;
	}

	.inicio__contenido {
		flex: 1;
		min-width: 280px;
	}

	.inicio__resumen {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-bottom: 1.75rem;
	}

	.tarjeta-resumen {
		flex: 1;
		min-width: 220px;
		border-radius: 12px;
		padding: 1.1rem 1.25rem;
	}

	.tarjeta-resumen--notif {
		background-color: #fff8e1;
	}

	.tarjeta-resumen--permiso {
		background-color: #e8f5e9;
	}

	.tarjeta-resumen__titulo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.9rem;
		margin: 0 0 0.4rem;
	}

	.tarjeta-resumen__texto {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		margin: 0;
	}

	.inicio__badge-notif {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		float: right;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		background-color: #fff8e1;
		color: var(--color-navy);
		font-weight: bold;
		font-size: 0.8rem;
		text-decoration: none;
		margin-bottom: 1.75rem;
	}

	.inicio__badge-numero {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 0.3rem;
		border-radius: 999px;
		background-color: var(--color-danger-strong);
		color: white;
		font-size: 0.7rem;
	}

	.inicio__subtitulo-seccion {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 0.8rem;
		clear: both;
	}

	.fila-movimiento {
		background-color: var(--color-input-bg);
		border-radius: var(--radius);
		padding: 0.9rem 1rem;
		margin-bottom: 0.75rem;
	}

	.fila-movimiento p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-teal);
	}

	.fila-movimiento--salida p {
		color: var(--color-danger-strong);
	}
</style>
