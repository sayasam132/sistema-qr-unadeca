<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { supabase, session } = $derived(data);

	onMount(() => {
		const { data: escuchaAuth } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
			if (nuevaSesion?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => escuchaAuth.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>UNADECA · Control de acceso QR</title>
</svelte:head>

{@render children()}
