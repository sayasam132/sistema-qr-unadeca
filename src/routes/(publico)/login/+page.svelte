<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let correo = $state('');
	let contrasena = $state('');
	let enviando = $state(false);
	let error = $state<string | null>(null);

	async function manejarEnvio(evento: SubmitEvent) {
		evento.preventDefault();
		error = null;
		enviando = true;

		const { error: errorInicio } = await supabase.auth.signInWithPassword({
			email: correo,
			password: contrasena
		});

		enviando = false;

		if (errorInicio) {
			error = 'Correo o contraseña incorrectos.';
			return;
		}

		await invalidateAll();
		goto('/inicio');
	}
</script>

<svelte:head>
	<title>Iniciar sesión · UNADECA</title>
</svelte:head>

<div class="auth">
	<div class="auth__encabezado">
		<p class="auth__titulo">sistema de control de acceso</p>
		<p class="auth__marca">UNADECA</p>
	</div>

	<form class="auth__tarjeta" onsubmit={manejarEnvio}>
		<div class="auth__logo" aria-hidden="true">QR</div>

		{#if error}
			<p class="auth__error">{error}</p>
		{/if}

		<div class="campo-auth">
			<input
				type="email"
				placeholder="Correo electrónico"
				bind:value={correo}
				autocomplete="username"
				required
			/>
		</div>

		<div class="campo-auth">
			<input
				type="password"
				placeholder="Contraseña"
				bind:value={contrasena}
				autocomplete="current-password"
				required
			/>
		</div>

		<button type="submit" class="auth__enviar" disabled={enviando}>
			{enviando ? 'Ingresando…' : 'Iniciar Sesión'}
		</button>

		<p class="auth__enlace">¿No tenés cuenta? <a href="/registro">Registrate aquí</a></p>
	</form>
</div>

<style>
	.auth {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: var(--color-navy);
		padding: 1.5rem;
	}

	.auth__encabezado {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.auth__titulo {
		color: white;
		font-weight: bold;
		font-size: 1.4rem;
		margin: 0 0 0.3rem;
	}

	.auth__marca {
		color: var(--color-teal);
		font-weight: bold;
		font-size: 0.95rem;
		margin: 0;
		letter-spacing: 0.03em;
	}

	.auth__tarjeta {
		width: 100%;
		max-width: 380px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 2.5rem 2rem 2rem;
		box-sizing: border-box;
	}

	.auth__logo {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		border-radius: 50%;
		background-color: var(--color-teal);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.4rem;
	}

	.auth__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.campo-auth {
		margin-bottom: 1rem;
	}

	.campo-auth input {
		width: 100%;
		height: 48px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid #ccc;
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.95rem;
		box-sizing: border-box;
	}

	.auth__enviar {
		width: 100%;
		height: 48px;
		border: none;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-family: inherit;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		margin-top: 0.4rem;
	}

	.auth__enviar:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth__enlace {
		text-align: center;
		font-size: 0.85rem;
		margin: 1rem 0 0;
		color: var(--color-teal);
	}

	.auth__enlace a {
		color: var(--color-teal);
		font-weight: bold;
	}
</style>
