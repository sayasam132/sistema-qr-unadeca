<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { contieneRostro } from '$lib/utils/face-api';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let nombreCompleto = $state('');
	let carnet = $state('');
	let correo = $state('');
	let contrasena = $state('');
	let archivoFoto = $state<File | null>(null);
	let previsualizacion = $state<string | null>(null);

	let validandoRostro = $state(false);
	let rostroValidado = $state(false);
	let enviando = $state(false);
	let error = $state<string | null>(null);

	async function manejarArchivo(evento: Event) {
		error = null;
		rostroValidado = false;

		const input = evento.target as HTMLInputElement;
		const archivo = input.files?.[0] ?? null;
		archivoFoto = archivo;

		if (previsualizacion) URL.revokeObjectURL(previsualizacion);
		previsualizacion = archivo ? URL.createObjectURL(archivo) : null;

		if (!archivo) return;

		validandoRostro = true;
		try {
			rostroValidado = await contieneRostro(archivo);
			if (!rostroValidado) {
				error =
					'No se detectó un rostro en la foto. Subí una foto donde se vea tu cara con claridad.';
			}
		} catch {
			error = 'No se pudo validar la foto. Intentá con otra imagen.';
		} finally {
			validandoRostro = false;
		}
	}

	async function manejarEnvio(evento: SubmitEvent) {
		evento.preventDefault();
		error = null;

		if (!archivoFoto || !rostroValidado) {
			error = 'Subí una foto con tu rostro visible antes de continuar.';
			return;
		}

		enviando = true;
		try {
			const { data: alta, error: errorAlta } = await supabase.auth.signUp({
				email: correo,
				password: contrasena,
				options: { data: { nombre_completo: nombreCompleto, carnet } }
			});

			if (errorAlta) {
				error =
					errorAlta.message === 'User already registered'
						? 'Ya existe una cuenta con ese correo.'
						: 'No se pudo crear la cuenta. Revisá los datos e intentá de nuevo.';
				return;
			}

			const usuario = alta.user;
			if (!usuario || !alta.session) {
				error =
					'Te enviamos un correo de confirmación. Iniciá sesión luego de confirmarlo para completar tu registro.';
				return;
			}

			const extension = archivoFoto.name.split('.').pop() ?? 'jpg';
			const rutaFoto = `${usuario.id}/perfil.${extension}`;

			const { error: errorSubida } = await supabase.storage
				.from('fotos-perfil')
				.upload(rutaFoto, archivoFoto, { upsert: true });

			if (errorSubida) {
				error =
					'La cuenta se creó, pero no se pudo subir la foto. Podés reintentarlo luego desde tu perfil.';
				return;
			}

			const { error: errorPerfil } = await supabase
				.from('usuarios')
				.update({ foto_url: rutaFoto })
				.eq('id', usuario.id);

			if (errorPerfil) {
				error = 'La cuenta y la foto se guardaron, pero no se pudo vincular la foto a tu perfil.';
				return;
			}

			await invalidateAll();
			goto('/inicio');
		} catch {
			error = 'No se pudo completar el registro. Intentá de nuevo.';
		} finally {
			enviando = false;
		}
	}
</script>

<svelte:head>
	<title>Registro · UNADECA</title>
</svelte:head>

<div class="auth">
	<form class="tarjeta auth__formulario" onsubmit={manejarEnvio}>
		<h1>Crear cuenta</h1>
		<p class="auth__subtitulo">Registrate para obtener tu código QR de acceso</p>

		{#if error}
			<p class="auth__error">{error}</p>
		{/if}

		<div class="campo">
			<label for="nombre">Nombre completo</label>
			<input id="nombre" type="text" bind:value={nombreCompleto} required />
		</div>

		<div class="campo">
			<label for="carnet">Carnet estudiantil</label>
			<input id="carnet" type="text" bind:value={carnet} required />
		</div>

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
			<input id="contrasena" type="password" bind:value={contrasena} required minlength="6" />
		</div>

		<div class="campo">
			<label for="foto">Fotografía de perfil</label>
			<input id="foto" type="file" accept="image/*" onchange={manejarArchivo} required />
			{#if validandoRostro}
				<small class="auth__ayuda">Validando que la foto tenga un rostro visible…</small>
			{:else if rostroValidado}
				<small class="auth__ayuda auth__ayuda--ok">Rostro detectado correctamente.</small>
			{:else}
				<small class="auth__ayuda">Se valida automáticamente que contenga un rostro visible.</small>
			{/if}
			{#if previsualizacion}
				<img
					class="auth__previsualizacion"
					src={previsualizacion}
					alt="Previsualización de la foto subida"
				/>
			{/if}
		</div>

		<button
			type="submit"
			class="boton auth__enviar"
			disabled={enviando || validandoRostro || !rostroValidado}
		>
			{enviando ? 'Creando cuenta…' : 'Registrarme'}
		</button>

		<p class="auth__enlace">¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a></p>
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
		max-width: 420px;
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

	.auth__ayuda {
		color: var(--color-text-muted);
	}

	.auth__ayuda--ok {
		color: #1e7e34;
	}

	.auth__previsualizacion {
		width: 96px;
		height: 96px;
		object-fit: cover;
		border-radius: var(--radius);
		margin-top: 0.6rem;
		border: 1px solid var(--color-border);
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
