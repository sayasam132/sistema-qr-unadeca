<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import { contieneRostro } from '$lib/utils/face-api';
	import { formatearSoloFechaLarga } from '$lib/utils/fecha';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');
	let esEstudiante = $derived(perfil?.tipo_usuario === 'estudiante');
	let esProfesor = $derived(perfil?.tipo_usuario === 'profesor');

	const etiquetasRol: Record<string, string> = {
		estudiante: 'Estudiante',
		visitante: 'Visitante',
		profesor: 'Profesor / Personal',
		admin: 'Administrador',
		guardia: 'Guardia'
	};
	const etiquetasHogar: Record<string, string> = { interno: 'Interno', externo: 'Externo' };

	let nombre = $state(perfil?.nombre ?? '');
	let apellido = $state(perfil?.apellido ?? '');
	let carnet = $state(perfil?.carnet ?? '');
	let telefono = $state(data.telefono ?? '');
	let identificacion = $state(data.identificacion ?? '');
	let profesion = $state(data.profesion ?? '');

	const correoInicial = perfil?.correo ?? '';
	let correo = $state(correoInicial);

	// Se carga desde la base (columna identidad_bloqueada) y además queda
	// forzado por un trigger en la base de datos, así que no se puede evitar
	// llamando a la API directamente.
	let datosBloqueados = $state(data.identidadBloqueada);

	let fotoUrlActual = $state(data.fotoUrl);
	let validandoFoto = $state(false);
	let subiendoFoto = $state(false);
	let guardando = $state(false);
	let error = $state<string | null>(null);
	let mensaje = $state<string | null>(null);

	async function manejarCambioFoto(evento: Event) {
		error = null;
		mensaje = null;

		const input = evento.target as HTMLInputElement;
		const archivo = input.files?.[0] ?? null;
		if (!archivo || !perfil) return;

		validandoFoto = true;
		try {
			const tieneRostro = await contieneRostro(archivo);
			if (!tieneRostro) {
				error = 'No se detectó un rostro en la foto. Elegí otra imagen.';
				return;
			}

			subiendoFoto = true;
			const extension = archivo.name.split('.').pop() ?? 'jpg';
			const ruta = `${perfil.id}/perfil.${extension}`;

			const { error: errorSubida } = await supabase.storage
				.from('fotos-perfil')
				.upload(ruta, archivo, { upsert: true });
			if (errorSubida) {
				error = 'No se pudo subir la foto.';
				return;
			}

			const { error: errorActualizar } = await supabase
				.from('usuarios')
				.update({ foto_url: ruta })
				.eq('id', perfil.id);
			if (errorActualizar) {
				error = 'La foto se subió, pero no se pudo actualizar tu perfil.';
				return;
			}

			const { data: firmada } = await supabase.storage
				.from('fotos-perfil')
				.createSignedUrl(ruta, 3600);
			fotoUrlActual = firmada?.signedUrl ?? fotoUrlActual;
			mensaje = 'Foto actualizada correctamente.';
		} catch {
			error = 'No se pudo validar o subir la foto.';
		} finally {
			validandoFoto = false;
			subiendoFoto = false;
		}
	}

	async function guardarCambios(evento: SubmitEvent) {
		evento.preventDefault();
		if (!perfil) return;

		error = null;
		mensaje = null;
		guardando = true;
		try {
			const cambioCorreo = correo !== correoInicial;

			if (cambioCorreo) {
				const { error: errorCorreo } = await supabase.auth.updateUser({ email: correo });
				if (errorCorreo) {
					error = `No se pudo actualizar el correo: ${errorCorreo.message}`;
					return;
				}
			}

			const { error: errorGuardar } = await supabase
				.from('usuarios')
				.update({
					nombre,
					apellido,
					carnet: carnet || null,
					telefono: telefono || null,
					identificacion: identificacion || null,
					profesion: profesion || null,
					correo,
					identidad_bloqueada: true
				})
				.eq('id', perfil.id);

			if (errorGuardar) {
				error = `No se pudieron guardar los cambios: ${errorGuardar.message}`;
				return;
			}

			datosBloqueados = true;
			const campoIdentidad = esEstudiante ? 'carné' : 'identificación';
			mensaje = cambioCorreo
				? 'Cambios guardados. Revisá tu correo nuevo para confirmar el cambio de dirección de acceso.'
				: `Cambios guardados. Nombre, apellidos y ${campoIdentidad} quedan bloqueados hasta el próximo cuatrimestre.`;
			await invalidateAll();
		} finally {
			guardando = false;
		}
	}
</script>

<svelte:head>
	<title>Mi perfil · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Mi Perfil" subtitulo={`Bienvenido, ${primerNombre}`} {iniciales}>
	{#if error}
		<p class="perfil__error">{error}</p>
	{/if}
	{#if mensaje}
		<p class="perfil__aviso">{mensaje}</p>
	{/if}

	<input
		id="entrada-foto"
		type="file"
		accept="image/*"
		class="perfil__foto-input-oculto"
		onchange={manejarCambioFoto}
	/>

	<div class="perfil__cabecera">
		<label for="entrada-foto" class="perfil__foto">
			{#if fotoUrlActual}
				<img src={fotoUrlActual} alt="Foto de perfil" />
			{:else}
				<span aria-hidden="true">📷</span>
			{/if}
		</label>

		<div>
			<p class="perfil__nombre-completo">{perfil?.nombre} {perfil?.apellido}</p>
			{#if esEstudiante}
				<p class="perfil__subrol">
					{etiquetasRol[perfil?.tipo_usuario ?? ''] ?? ''}
					{#if perfil?.hogar}
						· {etiquetasHogar[perfil.hogar]}
					{/if}
				</p>
			{/if}
			<label for="entrada-foto" class="perfil__boton-foto">
				{validandoFoto ? 'Validando…' : subiendoFoto ? 'Subiendo…' : 'Cambiar foto'}
			</label>
		</div>
	</div>

	<form class="perfil__formulario" onsubmit={guardarCambios}>
		<div class="perfil__grilla">
			<div class="campo-perfil campo-perfil--bloqueable">
				<label for="nombre">⚠ Nombre</label>
				<input id="nombre" type="text" bind:value={nombre} disabled={datosBloqueados} required />
			</div>
			<div class="campo-perfil campo-perfil--bloqueable">
				<label for="apellido">⚠ Apellidos</label>
				<input
					id="apellido"
					type="text"
					bind:value={apellido}
					disabled={datosBloqueados}
					required
				/>
			</div>
			{#if esEstudiante}
				<div class="campo-perfil campo-perfil--bloqueable">
					<label for="carnet">⚠ Carné</label>
					<input id="carnet" type="text" bind:value={carnet} disabled={datosBloqueados} />
				</div>
			{:else}
				<div class="campo-perfil campo-perfil--bloqueable">
					<label for="identificacion">⚠ Identificación/cédula/pasaporte</label>
					<input
						id="identificacion"
						type="text"
						bind:value={identificacion}
						disabled={datosBloqueados}
					/>
				</div>
			{/if}
			<div class="campo-perfil">
				<label for="telefono">Teléfono</label>
				<input
					id="telefono"
					type="tel"
					placeholder="Para contactarte en caso de emergencia"
					bind:value={telefono}
				/>
			</div>
			{#if esProfesor}
				<div class="campo-perfil campo-perfil--ancho">
					<label for="profesion">Profesión</label>
					<input
						id="profesion"
						type="text"
						placeholder="Tu profesión, o indicá si sos maestro/a temporal"
						bind:value={profesion}
					/>
				</div>
			{/if}
			<div class="campo-perfil campo-perfil--ancho">
				<label for="correo">Correo</label>
				<input id="correo" type="email" bind:value={correo} required />
			</div>
		</div>

		{#if datosBloqueados && data.bloqueoHasta}
			<p class="perfil__nota">
				⚠ Nombre, apellidos y {esEstudiante ? 'carné' : 'identificación'} quedan bloqueados hasta el
				{formatearSoloFechaLarga(data.bloqueoHasta)} (inicio del próximo cuatrimestre).
			</p>
		{:else}
			<p class="perfil__nota">
				⚠ Los campos en naranja solo se pueden modificar una vez por cuatrimestre.
			</p>
		{/if}

		<button type="submit" class="perfil__guardar" disabled={guardando}>
			{guardando ? 'Guardando…' : 'Guardar cambios'}
		</button>
	</form>
</PanelPagina>

<style>
	.perfil__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.perfil__aviso {
		background-color: #eaf9ee;
		color: #1e7e34;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.perfil__foto-input-oculto {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		overflow: hidden;
	}

	.perfil__cabecera {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.perfil__foto {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background-color: #ccc;
		overflow: hidden;
		cursor: pointer;
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.perfil__foto img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.perfil__nombre-completo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 1.1rem;
		margin: 0 0 0.25rem;
	}

	.perfil__subrol {
		color: var(--color-teal);
		font-size: 0.9rem;
		margin: 0 0 0.6rem;
	}

	.perfil__boton-foto {
		display: inline-flex;
		align-items: center;
		height: 34px;
		padding: 0 1rem;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-size: 0.8rem;
		font-weight: bold;
		cursor: pointer;
	}

	.perfil__grilla {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem 1.5rem;
	}

	.campo-perfil {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.campo-perfil--ancho {
		grid-column: 1 / -1;
	}

	.campo-perfil label {
		font-size: 0.8rem;
		font-weight: bold;
		color: var(--color-navy);
	}

	.campo-perfil--bloqueable label {
		color: #b8860b;
	}

	.campo-perfil input {
		height: 42px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.9rem;
	}

	.campo-perfil--bloqueable input {
		background-color: #fff8e1;
		border-color: #f0d787;
	}

	.campo-perfil input:disabled {
		opacity: 0.75;
	}

	.perfil__nota {
		color: #b8860b;
		font-size: 0.8rem;
		margin: 0.5rem 0 1.25rem;
	}

	.perfil__guardar {
		height: 46px;
		padding: 0 1.75rem;
		border: none;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: bold;
		cursor: pointer;
	}

	.perfil__guardar:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
