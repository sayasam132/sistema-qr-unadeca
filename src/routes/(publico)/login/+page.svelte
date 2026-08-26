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
	<form class="tarjeta auth__formulario" onsubmit={manejarEnvio}>
		<h1>Iniciar sesión</h1>
		<p class="auth__subtitulo">Sistema de control de acceso mediante código QR — UNADECA</p>

		{#if error}
			<p class="auth__error">{error}</p>
		{/if}

		<div class="campo">
			<label for="correo">Correo institucional</label>
			<input
				id="correo"
				type="email"
				placeholder="nombre@unadeca.edu"
				bind:value={correo}
				required
			/>
		</div>

		<div class="campo">
			<label for="contrasena">Contraseña</label>
			<input
				id="contrasena"
				type="password"
				placeholder="••••••••"
				bind:value={contrasena}
				required
			/>
		</div>

		<button type="submit" class="boton auth__enviar" disabled={enviando}>
			{enviando ? 'Ingresando…' : 'Ingresar'}
		</button>

		<p class="auth__enlace">¿No tenés cuenta? <a href="/registro">Registrate acá</a></p>
	</form>
</div>

<style>
	.auth {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(160deg, var(--color-navy), var(--color-navy-light));
		padding: 1.5rem;
	}

	.auth__formulario {
		width: 100%;
		max-width: 380px;
	}

	.auth__formulario h1 {
		color: var(--color-navy);
		margin-bottom: 0.25rem;
	}

	.auth__subtitulo {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.auth__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.auth__enviar {
		width: 100%;
	}

	.auth__enviar:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth__enlace {
		text-align: center;
		font-size: 0.9rem;
		margin-bottom: 0;
	}
</style>
