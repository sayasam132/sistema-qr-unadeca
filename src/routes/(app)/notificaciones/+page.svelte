<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import { formatearFechaHora } from '$lib/utils/fecha';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	let notificaciones = $state(data.notificaciones);

	type Notificacion = (typeof notificaciones)[number];

	const infoTipo: Record<string, { icono: string; clase: string }> = {
		aprobada: { icono: '✅', clase: 'fila-notif--aprobada' },
		rechazada: { icono: '❌', clase: 'fila-notif--rechazada' },
		info: { icono: '🔒', clase: 'fila-notif--info' }
	};

	let seleccionada = $state<Notificacion | null>(null);

	function formatearFecha(fecha: string) {
		return formatearFechaHora(fecha);
	}

	async function abrirNotificacion(notif: Notificacion) {
		seleccionada = notif;
		if (!notif.leida) {
			notif.leida = true;
			await supabase.from('notificaciones').update({ leida: true }).eq('id', notif.id);
		}
	}
</script>

<svelte:head>
	<title>Notificaciones · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Notificaciones" subtitulo={`Bienvenido, ${primerNombre}`} {iniciales}>
	<p class="notif__subtitulo">Mis Notificaciones</p>

	{#if notificaciones.length === 0}
		<p class="notif__vacio">No tenés notificaciones por el momento.</p>
	{:else}
		<div class="notif__lista">
			{#each notificaciones as notif (notif.id)}
				<button
					type="button"
					class="fila-notif {infoTipo[notif.tipo]?.clase ?? 'fila-notif--info'}"
					class:fila-notif--no-leida={!notif.leida}
					onclick={() => abrirNotificacion(notif)}
				>
					<p class="fila-notif__titulo">
						{infoTipo[notif.tipo]?.icono ?? '🔔'}
						{notif.titulo}
					</p>
					<p class="fila-notif__fecha">{formatearFecha(notif.created_at)}</p>
				</button>
			{/each}
		</div>
	{/if}
</PanelPagina>

{#if seleccionada}
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle">
		<div class="modal__tarjeta">
			<h2 id="titulo-detalle">Detalle de notificación</h2>
			<p class="modal__mensaje">
				{infoTipo[seleccionada.tipo]?.icono ?? '🔔'}
				{seleccionada.mensaje}
			</p>
			<p class="modal__fecha">{formatearFecha(seleccionada.created_at)}</p>
			<div class="modal__acciones">
				<button type="button" class="modal__boton" onclick={() => (seleccionada = null)}>
					Cerrar
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.notif__subtitulo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 1rem;
	}

	.notif__vacio {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.notif__lista {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.fila-notif {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		border: none;
		border-radius: var(--radius);
		padding: 0.9rem 1.1rem;
		font-family: inherit;
		text-align: left;
		cursor: pointer;
	}

	.fila-notif--aprobada {
		background-color: #e8f5e9;
	}

	.fila-notif--rechazada {
		background-color: #fdecea;
	}

	.fila-notif--info {
		background-color: #eaf6fc;
	}

	.fila-notif__titulo {
		margin: 0;
		font-size: 0.9rem;
		font-weight: normal;
		color: var(--color-navy);
	}

	.fila-notif--no-leida .fila-notif__titulo {
		font-weight: bold;
	}

	.fila-notif__fecha {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.fila-notif {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.modal {
		position: fixed;
		inset: 0;
		background-color: rgba(13, 27, 75, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 10;
	}

	.modal__tarjeta {
		width: 100%;
		max-width: 420px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 1.75rem;
		box-sizing: border-box;
	}

	.modal__tarjeta h2 {
		color: var(--color-navy);
		font-size: 1.1rem;
		margin: 0 0 1rem;
	}

	.modal__mensaje {
		color: var(--color-text);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 0.75rem;
	}

	.modal__fecha {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		margin: 0 0 1.5rem;
	}

	.modal__acciones {
		display: flex;
		justify-content: flex-end;
	}

	.modal__boton {
		height: 42px;
		padding: 0 1.5rem;
		border: none;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: bold;
		cursor: pointer;
	}
</style>
