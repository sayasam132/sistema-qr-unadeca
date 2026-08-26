<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let { data } = $props();

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre_completo?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(perfil.nombre_completo) : '');

	const etiquetasRol: Record<string, string> = {
		estudiante: 'Estudiante',
		admin: 'Administrador',
		guardia: 'Guardia'
	};

	const infoMovimiento: Record<string, { icono: string; etiqueta: string; clase: string }> = {
		entrada: { icono: '📥', etiqueta: 'Entrada', clase: 'fila-movimiento--entrada' },
		salida: { icono: '📤', etiqueta: 'Salida', clase: 'fila-movimiento--salida' }
	};

	function formatearFecha(fecha: string) {
		const d = new Date(fecha);
		return `${d.toLocaleDateString('es-CR')} | ${d.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
	}
</script>

<svelte:head>
	<title>Inicio · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Inicio" subtitulo={`Bienvenido, ${primerNombre}`} {iniciales}>
	<div class="inicio">
		<div class="inicio__perfil">
			<p class="inicio__nombre">{perfil?.nombre_completo}</p>
			<p class="inicio__rol">{etiquetasRol[perfil?.rol ?? ''] ?? ''}</p>
			<p class="inicio__dato">Carné: {perfil?.carnet}</p>
			<span class="inicio__chip">✅ Activo</span>
		</div>

		<div class="inicio__contenido">
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
							{infoMovimiento[movimiento.tipo].etiqueta} | {formatearFecha(movimiento.creado_en)}
						</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</PanelPagina>

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

	.inicio__subtitulo-seccion {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 0.8rem;
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
