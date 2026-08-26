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
	let mostrarConsentimiento = $state(false);

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

	function manejarEnvio(evento: SubmitEvent) {
		evento.preventDefault();
		error = null;

		if (!archivoFoto || !rostroValidado) {
			error = 'Subí una foto con tu rostro visible antes de continuar.';
			return;
		}

		mostrarConsentimiento = true;
	}

	async function confirmarRegistro() {
		mostrarConsentimiento = false;

		if (!archivoFoto) return;

		enviando = true;
		try {
			const { error: errorAlta } = await supabase.auth.signUp({
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

			// signUp a veces no devuelve una sesión activa aunque la confirmación
			// de correo esté desactivada; iniciamos sesión explícitamente para
			// no depender de ese detalle.
			const { data: sesion, error: errorSesion } = await supabase.auth.signInWithPassword({
				email: correo,
				password: contrasena
			});

			if (errorSesion || !sesion.user || !sesion.session) {
				error = 'La cuenta se creó. Iniciá sesión con tu correo y contraseña para continuar.';
				goto('/login');
				return;
			}

			const usuario = sesion.user;
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
	<form class="auth__tarjeta" onsubmit={manejarEnvio}>
		<h1>Crear cuenta</h1>
		<p class="auth__subtitulo">Registrate para obtener tu código QR de acceso</p>

		{#if error}
			<p class="auth__error">{error}</p>
		{/if}

		<div class="campo-auth">
			<input type="text" placeholder="Nombre completo" bind:value={nombreCompleto} required />
		</div>

		<div class="campo-auth">
			<input type="text" placeholder="Número de carné" bind:value={carnet} required />
		</div>

		<div class="campo-auth">
			<input type="email" placeholder="Correo electrónico" bind:value={correo} required />
		</div>

		<div class="campo-auth">
			<input
				type="password"
				placeholder="Contraseña"
				bind:value={contrasena}
				required
				minlength="6"
			/>
		</div>

		<label class="auth__foto" class:auth__foto--lista={rostroValidado}>
			<input
				type="file"
				accept="image/*"
				onchange={manejarArchivo}
				required
				class="auth__foto-input"
			/>
			{#if validandoRostro}
				Validando que la foto tenga un rostro visible…
			{:else if rostroValidado}
				✅ Rostro detectado correctamente
			{:else}
				Subir fotografía (obligatorio)
			{/if}
		</label>

		{#if previsualizacion}
			<img
				class="auth__previsualizacion"
				src={previsualizacion}
				alt="Previsualización de la foto subida"
			/>
		{/if}

		<button
			type="submit"
			class="auth__enviar"
			disabled={enviando || validandoRostro || !rostroValidado}
		>
			{enviando ? 'Creando cuenta…' : 'Registrarse'}
		</button>

		<p class="auth__enlace">¿Ya tenés cuenta? <a href="/login">Iniciá sesión</a></p>
	</form>
</div>

{#if mostrarConsentimiento}
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-consentimiento">
		<div class="modal__tarjeta">
			<h2 id="titulo-consentimiento">Consentimiento de Tratamiento de Datos Personales</h2>
			<p class="modal__texto">
				De acuerdo con la Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus
				Datos Personales de Costa Rica, le informamos que sus datos personales (nombre, fotografía y
				documento de identidad) serán utilizados exclusivamente para el control de acceso a las
				instalaciones de la UNADECA. Sus datos serán almacenados de forma segura y podrá solicitar
				su eliminación en cualquier momento desde su perfil.
			</p>
			<div class="modal__acciones">
				<button
					type="button"
					class="modal__boton modal__boton--secundario"
					onclick={() => (mostrarConsentimiento = false)}
				>
					Cancelar
				</button>
				<button
					type="button"
					class="modal__boton modal__boton--primario"
					onclick={confirmarRegistro}
				>
					Acepto y continúo
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.auth {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-navy);
		padding: 1.5rem;
	}

	.auth__tarjeta {
		width: 100%;
		max-width: 420px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 2rem;
		box-sizing: border-box;
	}

	.auth__tarjeta h1 {
		color: var(--color-navy);
		margin: 0 0 0.25rem;
		text-align: center;
	}

	.auth__subtitulo {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		text-align: center;
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
		margin-bottom: 0.9rem;
	}

	.campo-auth input {
		width: 100%;
		height: 44px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid #ccc;
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.9rem;
		box-sizing: border-box;
	}

	.auth__foto {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		border-radius: var(--radius);
		border: 1px solid var(--color-teal);
		background-color: #eaf9ff;
		color: var(--color-teal);
		font-weight: bold;
		font-size: 0.85rem;
		text-align: center;
		cursor: pointer;
		margin-bottom: 0.9rem;
		padding: 0 1rem;
	}

	.auth__foto--lista {
		color: #1e7e34;
		border-color: #1e7e34;
		background-color: #eaf9ee;
	}

	.auth__foto-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.auth__previsualizacion {
		display: block;
		width: 72px;
		height: 72px;
		object-fit: cover;
		border-radius: var(--radius);
		margin: -0.4rem auto 0.9rem;
		border: 1px solid var(--color-border);
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
	}

	.auth__enviar:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.auth__enlace {
		text-align: center;
		font-size: 0.85rem;
		margin: 1rem 0 0;
	}

	.auth__enlace a {
		color: var(--color-teal);
		font-weight: bold;
	}

	.modal {
		position: fixed;
		inset: 0;
		background-color: rgba(13, 27, 75, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 10;
	}

	.modal__tarjeta {
		width: 100%;
		max-width: 480px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 1.75rem;
		box-sizing: border-box;
	}

	.modal__tarjeta h2 {
		color: var(--color-navy);
		font-size: 1.15rem;
		margin: 0 0 1rem;
	}

	.modal__texto {
		color: var(--color-text);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.5rem;
	}

	.modal__acciones {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.modal__boton {
		height: 42px;
		padding: 0 1.25rem;
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: bold;
		cursor: pointer;
		border: none;
	}

	.modal__boton--secundario {
		background-color: transparent;
		color: var(--color-navy);
		border: 1px solid var(--color-border);
	}

	.modal__boton--primario {
		background-color: var(--color-teal);
		color: white;
	}
</style>
