<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<div class="app-shell">
	<Navbar />
	<main class="app-shell__contenido">
		{@render children()}
	</main>
</div>

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
</style>
