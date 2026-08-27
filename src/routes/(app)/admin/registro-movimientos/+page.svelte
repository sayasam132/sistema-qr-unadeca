<script lang="ts">
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';
	import {
		formatearFecha as formatearFechaCR,
		formatearHora as formatearHoraCR,
		obtenerComponentesCR
	} from '$lib/utils/fecha';

	let { data } = $props();

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	let busqueda = $state('');
	let fecha = $state('');
	let horaDesde = $state('');
	let horaHasta = $state('');

	function coincideTexto(movimiento: (typeof data.movimientos)[number]) {
		if (!busqueda.trim()) return true;
		const termino = busqueda.trim().toLowerCase();
		const nombreCompleto =
			`${movimiento.usuarios?.nombre ?? ''} ${movimiento.usuarios?.apellido ?? ''}`.toLowerCase();
		const identificacion = (movimiento.usuarios?.identificacion ?? '').toLowerCase();
		const carnet = (movimiento.usuarios?.carnet ?? '').toLowerCase();
		return (
			nombreCompleto.includes(termino) ||
			identificacion.includes(termino) ||
			carnet.includes(termino)
		);
	}

	function coincideFecha(movimiento: (typeof data.movimientos)[number]) {
		if (!fecha) return true;
		const componentes = obtenerComponentesCR(movimiento.created_at);
		const [anio, mes, dia] = fecha.split('-').map(Number);
		return componentes.anio === anio && componentes.mes === mes && componentes.dia === dia;
	}

	function coincideHora(movimiento: (typeof data.movimientos)[number]) {
		if (!horaDesde && !horaHasta) return true;
		const componentes = obtenerComponentesCR(movimiento.created_at);
		const horaMovimiento = `${String(componentes.hora).padStart(2, '0')}:${String(componentes.minuto).padStart(2, '0')}`;
		if (horaDesde && horaMovimiento < horaDesde) return false;
		if (horaHasta && horaMovimiento > horaHasta) return false;
		return true;
	}

	let movimientosFiltrados = $derived(
		data.movimientos.filter(
			(movimiento) =>
				coincideTexto(movimiento) && coincideFecha(movimiento) && coincideHora(movimiento)
		)
	);

	function formatearFecha(fecha: string) {
		return formatearFechaCR(fecha);
	}

	function formatearHora(fecha: string) {
		return formatearHoraCR(fecha);
	}

	function limpiarFiltros() {
		busqueda = '';
		fecha = '';
		horaDesde = '';
		horaHasta = '';
	}

	function escaparCsv(valor: string) {
		if (/[",\n]/.test(valor)) {
			return `"${valor.replace(/"/g, '""')}"`;
		}
		return valor;
	}

	function exportarCsv() {
		const encabezados = ['Nombre', 'Identificación/Carné', 'Tipo', 'Fecha', 'Hora'];
		const filas = movimientosFiltrados.map((movimiento) => [
			`${movimiento.usuarios?.nombre ?? ''} ${movimiento.usuarios?.apellido ?? ''}`.trim(),
			movimiento.usuarios?.identificacion || movimiento.usuarios?.carnet || '',
			movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida',
			formatearFecha(movimiento.created_at),
			formatearHora(movimiento.created_at)
		]);

		const contenido = [encabezados, ...filas]
			.map((fila) => fila.map((valor) => escaparCsv(String(valor))).join(','))
			.join('\n');

		const bom = String.fromCharCode(0xfeff);
		const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const enlace = document.createElement('a');
		enlace.href = url;
		enlace.download = `registro-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
		enlace.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Registro de salidas/entradas · UNADECA</title>
</svelte:head>

<PanelPagina titulo="Registro de salidas/entradas" subtitulo="Historial de accesos" {iniciales}>
	<div class="filtros">
		<input
			type="text"
			placeholder="Buscar por nombre o identificación…"
			bind:value={busqueda}
			class="filtros__busqueda"
		/>
		<input type="date" bind:value={fecha} title="Fecha" />
		<input type="time" bind:value={horaDesde} title="Hora desde" />
		<input type="time" bind:value={horaHasta} title="Hora hasta" />
		<button type="button" class="filtros__limpiar" onclick={limpiarFiltros}>Limpiar</button>
		<button type="button" class="filtros__exportar" onclick={exportarCsv}>⬇️ Exportar CSV</button>
	</div>

	{#if movimientosFiltrados.length === 0}
		<p class="registro__vacio">No hay movimientos que coincidan con la búsqueda.</p>
	{:else}
		<div class="registro__tabla">
			<div class="registro__fila registro__fila--encabezado">
				<span>Nombre</span>
				<span>Identificación</span>
				<span>Tipo</span>
				<span>Fecha</span>
				<span>Hora</span>
			</div>
			{#each movimientosFiltrados as movimiento (movimiento.id)}
				<div class="registro__fila">
					<span>{movimiento.usuarios?.nombre} {movimiento.usuarios?.apellido}</span>
					<span>{movimiento.usuarios?.identificacion || movimiento.usuarios?.carnet || '—'}</span>
					<span
						class:registro__tipo--entrada={movimiento.tipo === 'entrada'}
						class:registro__tipo--salida={movimiento.tipo === 'salida'}
					>
						{movimiento.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}
					</span>
					<span>{formatearFecha(movimiento.created_at)}</span>
					<span>{formatearHora(movimiento.created_at)}</span>
				</div>
			{/each}
		</div>
	{/if}
</PanelPagina>

<style>
	.filtros {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.filtros input {
		height: 40px;
		padding: 0 0.8rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.85rem;
	}

	.filtros__busqueda {
		flex: 1;
		min-width: 220px;
	}

	.filtros__limpiar,
	.filtros__exportar {
		height: 40px;
		padding: 0 1rem;
		border-radius: var(--radius);
		border: none;
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: bold;
		cursor: pointer;
	}

	.filtros__limpiar {
		background-color: var(--color-input-bg);
		color: var(--color-navy);
		border: 1px solid var(--color-border);
	}

	.filtros__exportar {
		background-color: var(--color-navy);
		color: white;
	}

	.registro__vacio {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.registro__tabla {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.registro__fila {
		display: grid;
		grid-template-columns: 2fr 1.3fr 1fr 1fr 0.8fr;
		gap: 0.75rem;
		align-items: center;
		padding: 0.7rem 1rem;
		border-radius: var(--radius);
		background-color: var(--color-input-bg);
		font-size: 0.85rem;
	}

	.registro__fila--encabezado {
		background-color: transparent;
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.75rem;
		text-transform: uppercase;
		padding: 0 1rem;
	}

	.registro__tipo--entrada {
		color: var(--color-teal);
	}

	.registro__tipo--salida {
		color: var(--color-danger-strong);
	}
</style>
