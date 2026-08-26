<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';

	const enlacesBase = [
		{ href: '/inicio', etiqueta: 'Inicio', icono: '🏠' },
		{ href: '/mi-qr', etiqueta: 'Mi QR', icono: '📱' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil', icono: '👤' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' },
		{ href: '/solicitud-permiso', etiqueta: 'Solicitud de permiso', icono: '🔓' }
	];

	let rol = $derived(page.data.perfil?.rol as string | null | undefined);

	let enlaces = $derived([
		...enlacesBase,
		...(rol === 'admin' ? [{ href: '/admin', etiqueta: 'Administración', icono: '🛠️' }] : []),
		...(rol === 'guardia' ? [{ href: '/guardia', etiqueta: 'Guardia', icono: '🛡️' }] : [])
	]);

	let supabase = $derived(page.data.supabase);
	let cerrandoSesion = $state(false);

	async function cerrarSesion() {
		cerrandoSesion = true;
		await supabase.auth.signOut();
		await invalidateAll();
		goto('/login');
	}
</script>

<aside class="barra">
	<p class="barra__marca">QR UNADECA</p>

	<nav class="barra__enlaces">
		{#each enlaces as enlace (enlace.href)}
			<a href={enlace.href} class:activo={page.url.pathname === enlace.href}>
				<span aria-hidden="true">{enlace.icono}</span>
				{enlace.etiqueta}
			</a>
		{/each}
	</nav>

	<button type="button" class="barra__salir" onclick={cerrarSesion} disabled={cerrandoSesion}>
		<span aria-hidden="true">🚪</span>
		{cerrandoSesion ? 'Saliendo…' : 'Cerrar sesión'}
	</button>
</aside>

<style>
	.barra {
		width: 240px;
		flex-shrink: 0;
		min-height: 100vh;
		background-color: var(--color-navy-sidebar);
		display: flex;
		flex-direction: column;
		padding: 1.9rem 1.25rem;
		box-sizing: border-box;
	}

	.barra__marca {
		color: var(--color-mint);
		font-weight: bold;
		font-size: 1.15rem;
		margin: 0 0 2.6rem;
	}

	.barra__enlaces {
		display: flex;
		flex-direction: column;
		gap: 1.6rem;
		flex: 1;
	}

	.barra__enlaces a {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: white;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.barra__enlaces a.activo {
		color: var(--color-mint);
		font-weight: bold;
	}

	.barra__salir {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		color: var(--color-danger);
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.barra__salir:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
