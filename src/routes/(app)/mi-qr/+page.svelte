<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let { data } = $props();

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');
	let esEstudiante = $derived(perfil?.tipo_usuario === 'estudiante');

	const etiquetasRol: Record<string, string> = {
		estudiante: 'Estudiante',
		visitante: 'Visitante',
		profesor: 'Profesor / Personal',
		admin: 'Administrador',
		guardia: 'Guardia'
	};
</script>

<svelte:head>
	<title>Mi QR · UNADECA</title>
</svelte:head>

<PanelPagina
	titulo="Mi Código QR"
	subtitulo={`Bienvenido, ${primerNombre}`}
	{iniciales}
	insigniaActiva={!esEstudiante}
>
	<div class="mi-qr">
		<div class="mi-qr__foto">
			{#if data.fotoUrl}
				<img src={data.fotoUrl} alt="Foto de perfil" />
			{/if}
		</div>

		<div class="mi-qr__perfil">
			<p class="mi-qr__nombre">{perfil?.nombre} {perfil?.apellido}</p>

			{#if esEstudiante}
				<p class="mi-qr__rol">{etiquetasRol[perfil?.tipo_usuario ?? ''] ?? ''}</p>
				{#if perfil?.carnet}
					<p class="mi-qr__dato">Carné: {perfil.carnet}</p>
				{/if}
				<span class="mi-qr__chip">✅ Activo</span>
			{:else if perfil?.identificacion}
				<p class="mi-qr__dato">Identificación: {perfil.identificacion}</p>
			{/if}
		</div>

		<div class="mi-qr__codigo">
			<div class="mi-qr__marco">
				<img src={data.qrDataUrl} alt="Código QR de acceso" />
			</div>
			<p class="mi-qr__nota">Escaneá este código para acceder</p>
			<a class="mi-qr__descargar" href={data.qrDataUrl} download="mi-qr-unadeca.png">
				⬇️ Descargar QR
			</a>
		</div>
	</div>
</PanelPagina>

<style>
	.mi-qr {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 3rem;
	}

	.mi-qr__foto {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		background-color: #ccc;
		flex-shrink: 0;
		overflow: hidden;
	}

	.mi-qr__foto img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mi-qr__perfil {
		min-width: 200px;
	}

	.mi-qr__nombre {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 1.1rem;
		margin: 0 0 0.4rem;
	}

	.mi-qr__rol {
		color: var(--color-teal);
		font-size: 0.9rem;
		margin: 0 0 0.6rem;
	}

	.mi-qr__dato {
		color: #555;
		font-size: 0.9rem;
		margin: 0 0 0.3rem;
	}

	.mi-qr__chip {
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

	.mi-qr__codigo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.mi-qr__marco {
		width: 220px;
		height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-input-bg);
		border: 2px solid var(--color-navy);
		border-radius: var(--radius);
	}

	.mi-qr__marco img {
		width: 180px;
		height: 180px;
	}

	.mi-qr__nota {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		margin: 0;
	}

	.mi-qr__descargar {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 44px;
		padding: 0 1.25rem;
		border-radius: var(--radius);
		background-color: var(--color-navy);
		color: white;
		text-decoration: none;
		font-weight: bold;
		font-size: 0.9rem;
	}
</style>
