<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<Navbar />

<main class="contenedor">
	{@render children()}
</main>

<style>
	.contenedor {
		max-width: 960px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}
</style>
