<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import { formatearSoloFecha } from '$lib/utils/fecha';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	let busqueda = $state('');
	let procesandoId = $state<string | null>(null);
	let error = $state<string | null>(null);

	const etiquetasTipo: Record<string, string> = {
		fin_de_semana: 'Fin de semana',
		salida_dia: 'Salida del día'
	};

	function coincide(permiso: (typeof data.permisos)[number]) {
		if (!busqueda.trim()) return true;
		const termino = busqueda.trim().toLowerCase();
		const nombreCompleto =
			`${permiso.usuarios?.nombre ?? ''} ${permiso.usuarios?.apellido ?? ''}`.toLowerCase();
		const identificacion = (permiso.usuarios?.identificacion ?? '').toLowerCase();
		const carnet = (permiso.usuarios?.carnet ?? '').toLowerCase();
		return (
			nombreCompleto.includes(termino) ||
			identificacion.includes(termino) ||
			carnet.includes(termino)
		);
	}

	let permisosFiltrados = $derived(data.permisos.filter(coincide));

	function formatearFecha(fecha: string) {
		return formatearSoloFecha(fecha);
	}

	async function resolver(
		permiso: (typeof data.permisos)[number],
		accion: 'aprobar' | 'aprobar_completo' | 'rechazar'
	) {
		error = null;
		procesandoId = permiso.id;
		try {
			let payload: Record<string, boolean | string>;
			if (accion === 'rechazar') {
				payload = { estado: 'rechazada' };
			} else if (permiso.tipo_permiso === 'salida_dia' || accion === 'aprobar_completo') {
				payload = { aprobado_admision: true, aprobado_preceptor: true };
			} else {
				payload = { aprobado_admision: true };
			}

			const { data: actualizado, error: errorActualizar } = await supabase
				.from('permisos')
				.update(payload)
				.eq('id', permiso.id)
				.select('estado')
				.single();

			if (errorActualizar) {
				error = `No se pudo actualizar la solicitud: ${errorActualizar.message}`;
				return;
			}

			// El estado final lo calcula un trigger en la base de datos (fin de
			// semana necesita admisión + preceptor); solo se notifica al
			// estudiante cuando ya quedó resuelto, no en la primera etapa.
			if (actualizado.estado !== 'pendiente') {
				const etiquetaTipo = etiquetasTipo[permiso.tipo_permiso] ?? permiso.tipo_permiso;
				const { error: errorNotificacion } = await supabase.from('notificaciones').insert({
					usuario_id: permiso.usuario_id,
					titulo:
						actualizado.estado === 'aprobada'
							? 'Tu solicitud de permiso fue aprobada'
							: 'Tu solicitud de permiso fue rechazada',
					mensaje: `Tu solicitud de ${etiquetaTipo} del ${formatearFecha(permiso.fecha_salida)} fue ${actualizado.estado} por Admisión Estudiantil.`,
					tipo: actualizado.estado
				});

				if (errorNotificacion) {
					console.error('Error al notificar al estudiante:', errorNotificacion);
				}
			}

			await invalidateAll();
		} finally {
			procesandoId = null;
		}
	}
</script>

<svelte:head>
	<title>Dar permiso · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Dar permiso" subtitulo="Aprobar o rechazar solicitudes" {iniciales}>
	{#if error}
		<p class="permiso__error">{error}</p>
	{/if}

	<input
		type="text"
		placeholder="Buscar por nombre o identificación…"
		bind:value={busqueda}
		class="permiso__busqueda"
	/>

	{#if permisosFiltrados.length === 0}
		<p class="permiso__vacio">No hay solicitudes que coincidan con la búsqueda.</p>
	{:else}
		<div class="permiso__lista">
			{#each permisosFiltrados as permiso (permiso.id)}
				<div class="permiso__tarjeta">
					<div>
						<p class="permiso__nombre">
							{permiso.usuarios?.nombre}
							{permiso.usuarios?.apellido}
							<span class="permiso__tipo"
								>· {etiquetasTipo[permiso.tipo_permiso] ?? permiso.tipo_permiso}</span
							>
						</p>
						<p class="permiso__detalle">
							{formatearFecha(permiso.fecha_salida)}
							{#if permiso.fecha_regreso && permiso.fecha_regreso !== permiso.fecha_salida}
								→ {formatearFecha(permiso.fecha_regreso)}
							{/if}
							{#if permiso.lugar_destino}
								· {permiso.lugar_destino}
							{/if}
						</p>
						<p class="permiso__motivo">{permiso.motivo}</p>
						{#if permiso.estado === 'pendiente' && permiso.tipo_permiso === 'fin_de_semana' && permiso.aprobado_admision}
							<p class="permiso__aviso">Ya aprobada por Admisión · esperando al preceptor/a</p>
						{/if}
					</div>

					{#if permiso.estado === 'pendiente'}
						<div class="permiso__acciones">
							{#if permiso.tipo_permiso === 'fin_de_semana'}
								{#if !permiso.aprobado_admision}
									<button
										type="button"
										class="permiso__boton permiso__boton--aprobar"
										disabled={procesandoId === permiso.id}
										onclick={() => resolver(permiso, 'aprobar')}
									>
										Aprobar
									</button>
								{/if}
								<button
									type="button"
									class="permiso__boton permiso__boton--aprobar-completo"
									disabled={procesandoId === permiso.id}
									onclick={() => resolver(permiso, 'aprobar_completo')}
								>
									Aprobar completo
								</button>
							{:else}
								<button
									type="button"
									class="permiso__boton permiso__boton--aprobar"
									disabled={procesandoId === permiso.id}
									onclick={() => resolver(permiso, 'aprobar')}
								>
									Aprobar
								</button>
							{/if}
							<button
								type="button"
								class="permiso__boton permiso__boton--rechazar"
								disabled={procesandoId === permiso.id}
								onclick={() => resolver(permiso, 'rechazar')}
							>
								Rechazar
							</button>
						</div>
					{:else}
						<span
							class="permiso__estado"
							class:permiso__estado--aprobada={permiso.estado === 'aprobada'}
							class:permiso__estado--rechazada={permiso.estado === 'rechazada'}
						>
							{permiso.estado === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</PanelPagina>

<style>
	.permiso__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.permiso__busqueda {
		width: 100%;
		max-width: 380px;
		height: 40px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.85rem;
		margin-bottom: 1.5rem;
	}

	.permiso__vacio {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.permiso__aviso {
		margin: 0.4rem 0 0;
		color: var(--color-teal);
		font-size: 0.75rem;
		font-style: italic;
	}

	.permiso__lista {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.permiso__tarjeta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		background-color: var(--color-input-bg);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
	}

	@media (max-width: 600px) {
		.permiso__tarjeta {
			flex-direction: column;
			align-items: stretch;
		}

		.permiso__acciones {
			width: 100%;
		}

		.permiso__boton {
			flex: 1;
		}
	}

	.permiso__nombre {
		margin: 0 0 0.3rem;
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.9rem;
	}

	.permiso__tipo {
		color: var(--color-teal);
		font-weight: normal;
	}

	.permiso__detalle {
		margin: 0 0 0.3rem;
		color: #555;
		font-size: 0.8rem;
	}

	.permiso__motivo {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.8rem;
	}

	.permiso__acciones {
		display: flex;
		gap: 0.6rem;
		flex-shrink: 0;
	}

	.permiso__boton {
		height: 38px;
		padding: 0 1.1rem;
		border: none;
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.8rem;
		font-weight: bold;
		cursor: pointer;
		color: white;
	}

	.permiso__boton--aprobar {
		background-color: #1e7e34;
	}

	.permiso__boton--aprobar-completo {
		background-color: var(--color-teal);
	}

	.permiso__boton--rechazar {
		background-color: var(--color-danger-strong);
	}

	.permiso__boton:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.permiso__estado {
		flex-shrink: 0;
		font-size: 0.8rem;
		font-weight: bold;
	}

	.permiso__estado--aprobada {
		color: #1e7e34;
	}

	.permiso__estado--rechazada {
		color: var(--color-danger-strong);
	}
</style>
