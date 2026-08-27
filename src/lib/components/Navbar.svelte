<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';

	const enlacesEstudiante = [
		{ href: '/inicio', etiqueta: 'Inicio', icono: '🏠' },
		{ href: '/mi-qr', etiqueta: 'Mi QR', icono: '📱' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil', icono: '👤' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' }
	];

	const enlacesAdmin = [
		{ href: '/inicio', etiqueta: 'Inicio', icono: '🏠' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil', icono: '👤' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' },
		{ href: '/admin/dar-permiso', etiqueta: 'Dar permiso', icono: '🔑' },
		{ href: '/admin/crear-cuenta-preceptor', etiqueta: 'Crear cuenta Preceptor/a', icono: '👤' },
		{ href: '/admin/crear-cuenta-guardia', etiqueta: 'Crear cuenta Guardia', icono: '🛡️' },
		{ href: '/admin/registro-movimientos', etiqueta: 'Registro de salidas/entradas', icono: '📋' },
		{ href: '/admin/dar-notificaciones', etiqueta: 'Dar Notificaciones', icono: '🔔' }
	];

	const enlacesGuardia = [
		{ href: '/inicio', etiqueta: 'Inicio', icono: '🏠' },
		{ href: '/mi-qr', etiqueta: 'Mi QR', icono: '📱' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil', icono: '👤' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' },
		{ href: '/guardia/registro-movimientos', etiqueta: 'Registro de movimientos', icono: '📋' }
	];

	const enlacesPreceptor = [
		{ href: '/inicio', etiqueta: 'Inicio', icono: '🏠' },
		{ href: '/mi-qr', etiqueta: 'Mi QR', icono: '📱' },
		{ href: '/mi-perfil', etiqueta: 'Mi perfil', icono: '👤' },
		{ href: '/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' },
		{ href: '/preceptor/dar-permiso', etiqueta: 'Dar permiso', icono: '🔑' }
	];

	let tipoUsuario = $derived(page.data.perfil?.tipo_usuario as string | null | undefined);
	let hogar = $derived(page.data.perfil?.hogar as string | null | undefined);

	// La solicitud de permiso es solo para estudiantes internos.
	let puedeSolicitarPermiso = $derived(tipoUsuario === 'estudiante' && hogar === 'interno');

	let enlaces = $derived(
		tipoUsuario === 'admin'
			? enlacesAdmin
			: tipoUsuario === 'guardia'
				? enlacesGuardia
				: tipoUsuario === 'preceptor'
					? enlacesPreceptor
					: [
							...enlacesEstudiante,
							...(puedeSolicitarPermiso
								? [{ href: '/solicitud-permiso', etiqueta: 'Solicitud de permiso', icono: '🔓' }]
								: [])
						]
	);

	let supabase = $derived(page.data.supabase);
	let cerrandoSesion = $state(false);
	let menuAbierto = $state(false);

	async function cerrarSesion() {
		cerrandoSesion = true;
		await supabase.auth.signOut();
		await invalidateAll();
		goto('/login');
	}

	function cerrarMenu() {
		menuAbierto = false;
	}
</script>

<button
	type="button"
	class="barra__hamburguesa"
	onclick={() => (menuAbierto = true)}
	aria-label="Abrir menú"
>
	☰
</button>

{#if menuAbierto}
	<div class="barra__superposicion" onclick={cerrarMenu} role="presentation"></div>
{/if}

<aside class="barra" class:barra--abierta={menuAbierto}>
	<div class="barra__cabecera">
		<p class="barra__marca">QR UNADECA</p>
		<button type="button" class="barra__cerrar-menu" onclick={cerrarMenu} aria-label="Cerrar menú">
			×
		</button>
	</div>

	<nav class="barra__enlaces">
		{#each enlaces as enlace (enlace.href)}
			<a href={enlace.href} class:activo={page.url.pathname === enlace.href} onclick={cerrarMenu}>
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
	.barra__hamburguesa {
		display: none;
	}

	.barra__superposicion {
		display: none;
	}

	.barra__cabecera {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 2.6rem;
	}

	.barra__cerrar-menu {
		display: none;
	}

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

	@media (max-width: 768px) {
		.barra__hamburguesa {
			display: flex;
			align-items: center;
			justify-content: center;
			position: fixed;
			top: 1rem;
			left: 1rem;
			width: 40px;
			height: 40px;
			border: none;
			border-radius: var(--radius);
			background-color: var(--color-navy-sidebar);
			color: var(--color-mint);
			font-size: 1.3rem;
			z-index: 30;
			cursor: pointer;
		}

		.barra__superposicion {
			display: block;
			position: fixed;
			inset: 0;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 35;
		}

		.barra__cerrar-menu {
			display: block;
			background: none;
			border: none;
			color: white;
			font-size: 1.5rem;
			line-height: 1;
			cursor: pointer;
		}

		.barra {
			position: fixed;
			inset: 0 auto 0 0;
			z-index: 40;
			transform: translateX(-100%);
			transition: transform 0.2s ease;
			box-shadow: 4px 0 16px rgba(0, 0, 0, 0.3);
		}

		.barra--abierta {
			transform: translateX(0);
		}
	}

	.barra__marca {
		color: var(--color-mint);
		font-weight: bold;
		font-size: 1.15rem;
		margin: 0;
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
