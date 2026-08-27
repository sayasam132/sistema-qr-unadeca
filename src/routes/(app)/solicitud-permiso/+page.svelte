<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import SelectorHora12 from '$lib/components/SelectorHora12.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let primerNombre = $derived(perfil?.nombre?.split(' ')[0] ?? '');
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	function fechaISO(fecha: Date) {
		const anio = fecha.getFullYear();
		const mes = String(fecha.getMonth() + 1).padStart(2, '0');
		const dia = String(fecha.getDate()).padStart(2, '0');
		return `${anio}-${mes}-${dia}`;
	}

	const hoy = fechaISO(new Date());

	type ModalAbierto = 'fin_de_semana' | 'salida_dia' | null;
	let modalAbierto = $state<ModalAbierto>(null);

	let fsFechaSalida = $state('');
	let fsFechaRegreso = $state('');
	let fsHoraSalida = $state('');
	let fsHoraRegreso = $state('');
	let fsLugarDestino = $state('');
	let fsNumeroTutor = $state('');
	let fsDescripcion = $state('');

	let fsFechaRegresoMin = $derived(fsFechaSalida || hoy);

	let sdFecha = $state('');
	let sdLugarDestino = $state('');
	let sdHoraSalida = $state('');
	let sdHoraRegreso = $state('');
	let sdDescripcion = $state('');

	let enviando = $state(false);
	let error = $state<string | null>(null);
	let mensaje = $state<string | null>(null);

	function abrirModal(tipo: ModalAbierto) {
		error = null;
		mensaje = null;
		modalAbierto = tipo;
	}

	function cerrarModal() {
		modalAbierto = null;
	}

	async function enviarFinDeSemana(evento: SubmitEvent) {
		evento.preventDefault();
		if (!perfil) return;

		error = null;

		if (fsFechaSalida < hoy) {
			error = 'La fecha de salida no puede ser anterior a hoy.';
			return;
		}
		if (fsFechaRegreso < fsFechaSalida) {
			error = 'La fecha de regreso no puede ser anterior a la fecha de salida.';
			return;
		}

		enviando = true;
		try {
			const { error: errorInsert } = await supabase.from('permisos').insert({
				usuario_id: perfil.id,
				tipo_permiso: 'fin_de_semana',
				fecha_salida: fsFechaSalida,
				fecha_regreso: fsFechaRegreso,
				hora_salida: fsHoraSalida,
				hora_regreso: fsHoraRegreso,
				lugar_destino: fsLugarDestino,
				numero_padre_tutor: fsNumeroTutor,
				motivo: fsDescripcion
			});

			if (errorInsert) {
				error = `No se pudo enviar la solicitud: ${errorInsert.message}`;
				return;
			}

			mensaje = 'Solicitud de fin de semana enviada correctamente.';
			modalAbierto = null;
			fsFechaSalida = '';
			fsFechaRegreso = '';
			fsHoraSalida = '';
			fsHoraRegreso = '';
			fsLugarDestino = '';
			fsNumeroTutor = '';
			fsDescripcion = '';
		} finally {
			enviando = false;
		}
	}

	async function enviarSalidaDia(evento: SubmitEvent) {
		evento.preventDefault();
		if (!perfil) return;

		error = null;

		if (sdFecha < hoy) {
			error = 'La fecha de salida no puede ser anterior a hoy.';
			return;
		}

		enviando = true;
		try {
			const { error: errorInsert } = await supabase.from('permisos').insert({
				usuario_id: perfil.id,
				tipo_permiso: 'salida_dia',
				fecha_salida: sdFecha,
				fecha_regreso: sdFecha,
				hora_salida: sdHoraSalida,
				hora_regreso: sdHoraRegreso,
				lugar_destino: sdLugarDestino,
				motivo: sdDescripcion
			});

			if (errorInsert) {
				error = `No se pudo enviar la solicitud: ${errorInsert.message}`;
				return;
			}

			mensaje = 'Solicitud de salida enviada correctamente.';
			modalAbierto = null;
			sdFecha = '';
			sdLugarDestino = '';
			sdHoraSalida = '';
			sdHoraRegreso = '';
			sdDescripcion = '';
		} finally {
			enviando = false;
		}
	}
</script>

<svelte:head>
	<title>Solicitud de permiso · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Solicitud De Permiso" subtitulo={`Bienvenido, ${primerNombre}`} {iniciales}>
	{#if mensaje}
		<p class="solicitud__aviso">{mensaje}</p>
	{/if}

	<p class="solicitud__subtitulo">Nueva Solicitud de Salida</p>

	<div class="solicitud__botones">
		<button
			type="button"
			class="solicitud__boton solicitud__boton--primario"
			onclick={() => abrirModal('fin_de_semana')}
		>
			Fin De Semana
		</button>
		<button
			type="button"
			class="solicitud__boton solicitud__boton--secundario"
			onclick={() => abrirModal('salida_dia')}
		>
			Salida del día
		</button>
	</div>
</PanelPagina>

{#if modalAbierto === 'fin_de_semana'}
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-fin-semana">
		<form class="modal__tarjeta" onsubmit={enviarFinDeSemana}>
			<h2 id="titulo-fin-semana">Solicitud de Fin de Semana</h2>

			{#if error}
				<p class="modal__error">{error}</p>
			{/if}

			<div class="modal__grilla">
				<div class="campo-modal">
					<label for="fs-salida">Fecha de salida</label>
					<input id="fs-salida" type="date" min={hoy} bind:value={fsFechaSalida} required />
				</div>
				<div class="campo-modal">
					<label for="fs-regreso">Fecha de regreso</label>
					<input
						id="fs-regreso"
						type="date"
						min={fsFechaRegresoMin}
						bind:value={fsFechaRegreso}
						required
					/>
				</div>
				<div class="campo-modal">
					<label for="fs-hora-salida">Hora de salida</label>
					<SelectorHora12 id="fs-hora-salida" bind:value={fsHoraSalida} />
				</div>
				<div class="campo-modal">
					<label for="fs-hora-regreso">Hora de regreso</label>
					<SelectorHora12 id="fs-hora-regreso" bind:value={fsHoraRegreso} />
				</div>
				<div class="campo-modal">
					<label for="fs-lugar">Lugar de destino</label>
					<input id="fs-lugar" type="text" bind:value={fsLugarDestino} required />
				</div>
				<div class="campo-modal">
					<label for="fs-tutor">Número de padre/tutor</label>
					<input id="fs-tutor" type="tel" bind:value={fsNumeroTutor} required />
				</div>
			</div>

			<div class="campo-modal campo-modal--ancho">
				<label for="fs-descripcion">Descripción del viaje</label>
				<textarea id="fs-descripcion" rows="3" bind:value={fsDescripcion} required></textarea>
			</div>

			<div class="modal__acciones">
				<button type="button" class="modal__boton modal__boton--secundario" onclick={cerrarModal}>
					Cancelar
				</button>
				<button type="submit" class="modal__boton modal__boton--primario" disabled={enviando}>
					{enviando ? 'Enviando…' : 'Enviar solicitud'}
				</button>
			</div>
		</form>
	</div>
{/if}

{#if modalAbierto === 'salida_dia'}
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-salida-dia">
		<form class="modal__tarjeta" onsubmit={enviarSalidaDia}>
			<h2 id="titulo-salida-dia">Permiso de salida</h2>

			{#if error}
				<p class="modal__error">{error}</p>
			{/if}

			<div class="modal__grilla">
				<div class="campo-modal">
					<label for="sd-fecha">Fecha de salida</label>
					<input id="sd-fecha" type="date" min={hoy} bind:value={sdFecha} required />
				</div>
				<div class="campo-modal">
					<label for="sd-lugar">Lugar de destino</label>
					<input id="sd-lugar" type="text" bind:value={sdLugarDestino} required />
				</div>
				<div class="campo-modal">
					<label for="sd-hora-salida">Hora de salida</label>
					<SelectorHora12 id="sd-hora-salida" bind:value={sdHoraSalida} />
				</div>
				<div class="campo-modal">
					<label for="sd-hora-regreso">Hora de regreso</label>
					<SelectorHora12 id="sd-hora-regreso" bind:value={sdHoraRegreso} />
				</div>
			</div>

			<div class="campo-modal campo-modal--ancho">
				<label for="sd-descripcion">Descripción de la salida</label>
				<textarea id="sd-descripcion" rows="3" bind:value={sdDescripcion} required></textarea>
			</div>

			<div class="modal__acciones">
				<button type="button" class="modal__boton modal__boton--secundario" onclick={cerrarModal}>
					Cancelar
				</button>
				<button type="submit" class="modal__boton modal__boton--primario" disabled={enviando}>
					{enviando ? 'Enviando…' : 'Enviar solicitud'}
				</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.solicitud__aviso {
		background-color: #eaf9ee;
		color: #1e7e34;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1.25rem;
	}

	.solicitud__subtitulo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 1rem;
	}

	.solicitud__botones {
		display: flex;
		gap: 1rem;
	}

	.solicitud__boton {
		height: 40px;
		padding: 0 1.25rem;
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: bold;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.solicitud__boton--primario {
		background-color: var(--color-teal);
		color: white;
	}

	.solicitud__boton--secundario {
		background-color: var(--color-input-bg);
		color: var(--color-navy);
		border-color: var(--color-border);
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
		overflow-y: auto;
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
		font-size: 1.1rem;
		margin: 0 0 1.1rem;
	}

	.modal__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.modal__grilla {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.9rem;
		margin-bottom: 0.9rem;
	}

	.campo-modal {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.campo-modal--ancho {
		margin-bottom: 1.25rem;
	}

	.campo-modal label {
		font-size: 0.8rem;
		font-weight: bold;
		color: var(--color-navy);
	}

	.campo-modal input,
	.campo-modal textarea {
		padding: 0 0.8rem;
		height: 40px;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.85rem;
	}

	.campo-modal textarea {
		height: auto;
		padding: 0.6rem 0.8rem;
		resize: vertical;
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

	.modal__boton--primario:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
