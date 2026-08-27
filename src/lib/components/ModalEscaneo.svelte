<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import QrScanner from 'qr-scanner';
	import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url';

	QrScanner.WORKER_PATH = QrScannerWorkerPath;

	let {
		supabase,
		guardiaId,
		cerrar
	}: {
		supabase: SupabaseClient;
		guardiaId: string;
		cerrar: () => void;
	} = $props();

	let videoEl: HTMLVideoElement = $state()!;
	let scanner: QrScanner | null = null;

	let error = $state<string | null>(null);
	let buscando = $state(false);
	let registrando = $state(false);
	let mensajeExito = $state<string | null>(null);

	let usuarioEscaneado = $state<{
		id: string;
		nombre: string;
		apellido: string;
		tipo_usuario: string;
	} | null>(null);

	const etiquetasRol: Record<string, string> = {
		estudiante: 'Estudiante',
		visitante: 'Visitante',
		profesor: 'Profesor / Personal',
		admin: 'Administrador',
		guardia: 'Guardia',
		preceptor: 'Preceptor/a'
	};

	async function manejarResultado(resultado: QrScanner.ScanResult) {
		if (buscando || usuarioEscaneado) return;

		const idEscaneado = resultado.data.trim();
		buscando = true;
		error = null;

		try {
			const { data: usuario, error: errorBusqueda } = await supabase
				.from('usuarios')
				.select('id, nombre, apellido, tipo_usuario')
				.eq('id', idEscaneado)
				.single();

			if (errorBusqueda || !usuario) {
				error = 'No se encontró ningún usuario con ese código QR.';
				return;
			}

			usuarioEscaneado = usuario;
			scanner?.stop();
		} finally {
			buscando = false;
		}
	}

	$effect(() => {
		if (!videoEl) return;

		scanner = new QrScanner(videoEl, manejarResultado, {
			highlightScanRegion: true,
			highlightCodeOutline: true,
			returnDetailedScanResult: true
		});

		scanner.start().catch(() => {
			error = 'No se pudo acceder a la cámara. Revisá los permisos del navegador.';
		});

		return () => {
			scanner?.stop();
			scanner?.destroy();
			scanner = null;
		};
	});

	onDestroy(() => {
		scanner?.stop();
		scanner?.destroy();
	});

	function volverAEscanear() {
		usuarioEscaneado = null;
		error = null;
		scanner?.start();
	}

	async function registrarMovimiento(tipo: 'entrada' | 'salida') {
		if (!usuarioEscaneado) return;

		error = null;
		registrando = true;
		try {
			const { error: errorInsert } = await supabase.from('movimientos').insert({
				usuario_id: usuarioEscaneado.id,
				registrado_por: guardiaId,
				tipo
			});

			if (errorInsert) {
				error = `No se pudo registrar el movimiento: ${errorInsert.message}`;
				return;
			}

			mensajeExito = `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada para ${usuarioEscaneado.nombre} ${usuarioEscaneado.apellido}.`;
			usuarioEscaneado = null;

			setTimeout(() => {
				mensajeExito = null;
				volverAEscanear();
			}, 1800);
		} finally {
			registrando = false;
		}
	}
</script>

<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-escaneo">
	<div class="modal__tarjeta">
		<div class="modal__cabecera">
			<h2 id="titulo-escaneo">📷 Escaneando código QR</h2>
			<button type="button" class="modal__cerrar" onclick={cerrar} aria-label="Cerrar">×</button>
		</div>

		{#if mensajeExito}
			<p class="modal__exito">{mensajeExito}</p>
		{:else if usuarioEscaneado}
			<p class="modal__instruccion">Confirmá el movimiento para:</p>
			<p class="modal__usuario">
				{usuarioEscaneado.nombre}
				{usuarioEscaneado.apellido}
				<span class="modal__usuario-rol"
					>· {etiquetasRol[usuarioEscaneado.tipo_usuario] ?? usuarioEscaneado.tipo_usuario}</span
				>
			</p>

			{#if error}
				<p class="modal__error">{error}</p>
			{/if}

			<div class="modal__acciones">
				<button
					type="button"
					class="modal__boton modal__boton--entrada"
					disabled={registrando}
					onclick={() => registrarMovimiento('entrada')}
				>
					Entrada
				</button>
				<button
					type="button"
					class="modal__boton modal__boton--salida"
					disabled={registrando}
					onclick={() => registrarMovimiento('salida')}
				>
					Salida
				</button>
			</div>

			<button type="button" class="modal__link" onclick={volverAEscanear}>
				Volver a escanear
			</button>
		{:else}
			<p class="modal__instruccion">Apuntá la cámara al código QR del usuario</p>

			<div class="modal__video-marco">
				<!-- eslint-disable-next-line svelte/require-each-key -->
				<video bind:this={videoEl} class="modal__video"></video>
			</div>

			<p class="modal__nota">Mantené el QR dentro del recuadro</p>

			{#if buscando}
				<p class="modal__buscando">Buscando usuario…</p>
			{/if}
			{#if error}
				<p class="modal__error">{error}</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background-color: rgba(13, 27, 75, 0.75);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 50;
	}

	.modal__tarjeta {
		width: 100%;
		max-width: 420px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		box-sizing: border-box;
	}

	.modal__cabecera {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.modal__cabecera h2 {
		color: var(--color-navy);
		font-size: 1rem;
		margin: 0;
	}

	.modal__cerrar {
		background: none;
		border: none;
		font-size: 1.4rem;
		line-height: 1;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.modal__instruccion {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		text-align: center;
		margin: 0 0 1rem;
	}

	.modal__video-marco {
		width: 100%;
		aspect-ratio: 4 / 3;
		border-radius: var(--radius);
		overflow: hidden;
		background-color: black;
	}

	.modal__video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal__nota {
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.8rem;
		margin: 0.75rem 0 0;
	}

	.modal__buscando {
		text-align: center;
		color: var(--color-teal);
		font-size: 0.85rem;
		margin: 0.75rem 0 0;
	}

	.modal__usuario {
		text-align: center;
		color: var(--color-navy);
		font-weight: bold;
		font-size: 1.1rem;
		margin: 0 0 1.5rem;
	}

	.modal__usuario-rol {
		color: var(--color-teal);
		font-weight: normal;
		font-size: 0.9rem;
	}

	.modal__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0.75rem 0 0;
		text-align: center;
	}

	.modal__exito {
		background-color: #eaf9ee;
		color: #1e7e34;
		border-radius: var(--radius);
		padding: 1.5rem 0.8rem;
		font-size: 0.95rem;
		text-align: center;
		font-weight: bold;
		margin: 0;
	}

	.modal__acciones {
		display: flex;
		gap: 0.75rem;
	}

	.modal__boton {
		flex: 1;
		height: 46px;
		border: none;
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: bold;
		color: white;
		cursor: pointer;
	}

	.modal__boton--entrada {
		background-color: var(--color-teal);
	}

	.modal__boton--salida {
		background-color: var(--color-danger-strong);
	}

	.modal__boton:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.modal__link {
		display: block;
		width: 100%;
		background: none;
		border: none;
		color: var(--color-teal);
		font-family: inherit;
		font-size: 0.85rem;
		text-align: center;
		margin-top: 1rem;
		cursor: pointer;
	}
</style>
