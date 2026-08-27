<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import { formatearFechaHora } from '$lib/utils/fecha';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	type Grupo = 'estudiantes' | 'visitantes' | 'profe_admin' | 'todos';

	const grupos: { valor: Grupo; etiqueta: string }[] = [
		{ valor: 'estudiantes', etiqueta: 'Estudiantes' },
		{ valor: 'visitantes', etiqueta: 'Visitantes' },
		{ valor: 'profe_admin', etiqueta: 'Profe/Admin' },
		{ valor: 'todos', etiqueta: 'Todos' }
	];

	let grupoSeleccionado = $state<Grupo>('todos');
	let titulo = $state('');
	let mensaje = $state('');
	let enviando = $state(false);
	let error = $state<string | null>(null);
	let exito = $state<string | null>(null);

	function formatearFecha(fecha: string) {
		return formatearFechaHora(fecha);
	}

	async function enviarNotificacion(evento: SubmitEvent) {
		evento.preventDefault();
		if (!perfil) return;

		error = null;
		exito = null;
		enviando = true;
		try {
			let consulta = supabase.from('usuarios').select('id');

			if (grupoSeleccionado === 'estudiantes') {
				consulta = consulta.eq('tipo_usuario', 'estudiante');
			} else if (grupoSeleccionado === 'visitantes') {
				consulta = consulta.eq('tipo_usuario', 'visitante');
			} else if (grupoSeleccionado === 'profe_admin') {
				consulta = consulta.in('tipo_usuario', ['profesor', 'admin']);
			}

			const { data: destinatarios, error: errorDestinatarios } = await consulta;

			if (errorDestinatarios) {
				error = `No se pudo buscar a los destinatarios: ${errorDestinatarios.message}`;
				return;
			}

			if (!destinatarios || destinatarios.length === 0) {
				error = 'No hay ningún destinatario para ese grupo.';
				return;
			}

			const filas = destinatarios.map((destinatario) => ({
				usuario_id: destinatario.id,
				titulo,
				mensaje,
				tipo: 'info',
				enviado_por: perfil.id
			}));

			const { error: errorInsert } = await supabase.from('notificaciones').insert(filas);

			if (errorInsert) {
				error = `No se pudo enviar la notificación: ${errorInsert.message}`;
				return;
			}

			exito = `Notificación enviada a ${destinatarios.length} usuario(s).`;
			titulo = '';
			mensaje = '';
			await invalidateAll();
		} finally {
			enviando = false;
		}
	}
</script>

<svelte:head>
	<title>Dar Notificaciones · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Dar Notificaciones" subtitulo="Enviar avisos a usuarios" {iniciales}>
	{#if error}
		<p class="notif__error">{error}</p>
	{/if}
	{#if exito}
		<p class="notif__exito">{exito}</p>
	{/if}

	<form class="notif__form" onsubmit={enviarNotificacion}>
		<div class="notif__columnas">
			<div class="notif__campos">
				<div class="campo-notif">
					<label for="titulo">Título</label>
					<input id="titulo" type="text" bind:value={titulo} required />
				</div>
				<div class="campo-notif">
					<label for="mensaje">Detalle de la notificación</label>
					<textarea id="mensaje" rows="3" bind:value={mensaje} required></textarea>
				</div>
			</div>

			<div class="notif__grupos">
				{#each grupos as grupo (grupo.valor)}
					<button
						type="button"
						class="notif__grupo-boton"
						class:notif__grupo-boton--activo={grupoSeleccionado === grupo.valor}
						onclick={() => (grupoSeleccionado = grupo.valor)}
					>
						{grupo.etiqueta}
					</button>
				{/each}
			</div>
		</div>

		<button type="submit" class="notif__enviar" disabled={enviando}>
			{enviando ? 'Enviando…' : 'Enviar'}
		</button>
	</form>

	<p class="notif__subtitulo-seccion">Registro de notificación</p>

	{#if data.registro.length === 0}
		<p class="notif__vacio">Todavía no enviaste ninguna notificación.</p>
	{:else}
		<div class="notif__registro">
			{#each data.registro as envio (envio.id)}
				<div class="notif__registro-fila">
					<p class="notif__registro-titulo">{envio.titulo}</p>
					<p class="notif__registro-mensaje">{envio.mensaje}</p>
					<p class="notif__registro-fecha">
						{formatearFecha(envio.created_at)}
						{#if envio.usuarios}
							· {envio.usuarios.nombre} {envio.usuarios.apellido}
						{/if}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</PanelPagina>

<style>
	.notif__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.notif__exito {
		background-color: #eaf9ee;
		color: #1e7e34;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.notif__form {
		margin-bottom: 2rem;
	}

	.notif__columnas {
		display: flex;
		flex-wrap: wrap;
		gap: 2.5rem;
		margin-bottom: 1.25rem;
	}

	.notif__campos {
		flex: 1;
		min-width: 260px;
		max-width: 380px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.campo-notif {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.campo-notif label {
		font-size: 0.8rem;
		font-weight: bold;
		color: var(--color-navy);
	}

	.campo-notif input,
	.campo-notif textarea {
		padding: 0.6rem 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.9rem;
	}

	.campo-notif textarea {
		resize: vertical;
	}

	.notif__grupos {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 160px;
	}

	.notif__grupo-boton {
		height: 34px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		color: var(--color-navy);
		font-family: inherit;
		font-size: 0.8rem;
		font-weight: bold;
		text-align: left;
		cursor: pointer;
	}

	.notif__grupo-boton--activo {
		background-color: var(--color-teal);
		border-color: var(--color-teal);
		color: white;
	}

	.notif__enviar {
		height: 42px;
		padding: 0 1.5rem;
		border: none;
		border-radius: var(--radius);
		background-color: var(--color-teal);
		color: white;
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: bold;
		cursor: pointer;
	}

	.notif__enviar:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.notif__subtitulo-seccion {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 1rem;
	}

	.notif__vacio {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.notif__registro {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.notif__registro-fila {
		background-color: #e8f5e9;
		border-radius: var(--radius);
		padding: 0.9rem 1.1rem;
	}

	.notif__registro-titulo {
		margin: 0 0 0.2rem;
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.85rem;
	}

	.notif__registro-mensaje {
		margin: 0 0 0.3rem;
		color: var(--color-teal);
		font-size: 0.85rem;
	}

	.notif__registro-fecha {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}
</style>
