<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(perfil.nombre_completo) : '');

	const secciones = [
		{ icono: '👥', titulo: 'Usuarios', texto: 'Gestioná las cuentas y roles del sistema.' },
		{
			icono: '📋',
			titulo: 'Solicitudes de permiso',
			texto: 'Aprobá o rechazá solicitudes pendientes.'
		},
		{
			icono: '📊',
			titulo: 'Reportes de acceso',
			texto: 'Consultá el historial de entradas y salidas.'
		}
	];
</script>

<svelte:head>
	<title>Administración · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Administración" subtitulo="Gestión general del sistema" {iniciales}>
	<div class="admin">
		{#each secciones as seccion (seccion.titulo)}
			<div class="tarjeta-admin">
				<p class="tarjeta-admin__icono" aria-hidden="true">{seccion.icono}</p>
				<p class="tarjeta-admin__titulo">{seccion.titulo}</p>
				<p class="tarjeta-admin__texto">{seccion.texto}</p>
				<p class="tarjeta-admin__proximamente">Próximamente</p>
			</div>
		{/each}
	</div>
</PanelPagina>

<style>
	.admin {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.tarjeta-admin {
		flex: 1;
		min-width: 240px;
		background-color: var(--color-input-bg);
		border-radius: var(--radius);
		padding: 1.5rem;
	}

	.tarjeta-admin__icono {
		font-size: 1.6rem;
		margin: 0 0 0.5rem;
	}

	.tarjeta-admin__titulo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 1rem;
		margin: 0 0 0.4rem;
	}

	.tarjeta-admin__texto {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		margin: 0 0 0.9rem;
	}

	.tarjeta-admin__proximamente {
		display: inline-block;
		color: var(--color-teal);
		font-weight: bold;
		font-size: 0.75rem;
		margin: 0;
	}
</style>
