<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(perfil.nombre_completo) : '');
</script>

<svelte:head>
	<title>Guardia · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Panel de guardia" subtitulo="Escaneo y validación de ingreso" {iniciales}>
	<div class="guardia">
		<div class="guardia__escaner">
			<p class="guardia__icono" aria-hidden="true">🛡️</p>
			<p class="guardia__texto">Próximamente: lector de QR en tiempo real</p>
		</div>
		<p class="guardia__nota">
			Acá vas a poder escanear el código QR de un usuario para validar su ingreso o salida y
			registrar el movimiento automáticamente.
		</p>
	</div>
</PanelPagina>

<style>
	.guardia {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		text-align: center;
		padding: 2rem 0;
	}

	.guardia__escaner {
		width: 260px;
		height: 260px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		border: 2px dashed var(--color-teal);
		border-radius: var(--radius-lg);
		background-color: var(--color-input-bg);
	}

	.guardia__icono {
		font-size: 2.5rem;
		margin: 0;
	}

	.guardia__texto {
		color: var(--color-navy);
		font-weight: bold;
		font-size: 0.95rem;
		margin: 0;
	}

	.guardia__nota {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		max-width: 420px;
		margin: 0;
	}
</style>
