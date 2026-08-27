<script lang="ts">
	import { page } from '$app/state';
	import Navbar from '$lib/components/Navbar.svelte';
	import ModalPrimerAcceso from '$lib/components/ModalPrimerAcceso.svelte';

	let { data, children } = $props();

	let perfil = $derived(page.data.perfil);

	// Las cuentas creadas directo en la base (admin, guardia, preceptor) no
	// pasan por /registro, así que nunca aceptaron el consentimiento de la
	// Ley 8968. Se les pide la primera vez que entran, sin importar el rol.
	let requierePrimerAcceso = $derived(!!perfil && !perfil.consentimiento);
</script>

<div class="app-shell">
	<Navbar />
	<main class="app-shell__contenido">
		{@render children()}
	</main>
</div>

{#if requierePrimerAcceso && perfil}
	<ModalPrimerAcceso
		supabase={data.supabase}
		usuarioId={perfil.id}
		nombreActual={perfil.nombre}
		apellidoActual={perfil.apellido}
	/>
{/if}

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		background-color: var(--color-navy);
	}

	.app-shell__contenido {
		flex: 1;
		padding: 2rem 2.5rem;
		box-sizing: border-box;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.app-shell {
			flex-direction: column;
		}

		.app-shell__contenido {
			padding: 4.5rem 1rem 1.5rem;
		}
	}
</style>
