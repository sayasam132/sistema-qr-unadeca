<script lang="ts">
	import { page } from '$app/state';

	const enlaces = [
		{ href: '/inicio', etiqueta: 'Inicio' },
		{ href: '/mi-qr', etiqueta: 'Mi QR' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones' },
		{ href: '/solicitud-permiso', etiqueta: 'Solicitar permiso' }
	];
</script>

<nav class="navbar">
	<a class="navbar__marca" href="/inicio">UNADECA <span>Control de acceso QR</span></a>
	<ul class="navbar__enlaces">
		{#each enlaces as enlace (enlace.href)}
			<li>
				<a href={enlace.href} class:activo={page.url.pathname === enlace.href}>
					{enlace.etiqueta}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1rem 1.5rem;
		background-color: var(--color-navy);
		color: white;
		flex-wrap: wrap;
	}

	.navbar__marca {
		color: white;
		text-decoration: none;
		font-weight: bold;
		font-size: 1.1rem;
	}

	.navbar__marca span {
		display: block;
		font-size: 0.75rem;
		font-weight: normal;
		color: var(--color-teal);
	}

	.navbar__enlaces {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.navbar__enlaces a {
		color: white;
		text-decoration: none;
		font-size: 0.95rem;
		padding-bottom: 0.25rem;
		border-bottom: 2px solid transparent;
	}

	.navbar__enlaces a:hover,
	.navbar__enlaces a.activo {
		color: var(--color-teal);
		border-bottom-color: var(--color-teal);
	}
</style>
