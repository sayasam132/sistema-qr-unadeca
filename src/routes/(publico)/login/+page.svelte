<script lang="ts">
	// TODO (fase 2): conectar con supabase.auth.signInWithPassword y manejar errores reales.
	let correo = $state('');
	let contrasena = $state('');
</script>

<svelte:head>
	<title>Iniciar sesión · UNADECA</title>
</svelte:head>

<div class="auth">
	<form class="tarjeta auth__formulario">
		<h1>Iniciar sesión</h1>
		<p class="auth__subtitulo">Sistema de control de acceso mediante código QR — UNADECA</p>

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

		<button type="submit" class="boton auth__enviar">Ingresar</button>

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

	.auth__enviar {
		width: 100%;
	}

	.auth__enlace {
		text-align: center;
		font-size: 0.9rem;
		margin-bottom: 0;
	}
</style>
