<script lang="ts">
	let {
		value = $bindable(''),
		id
	}: {
		value: string;
		id?: string;
	} = $props();

	function partesDesde24h(v: string) {
		if (!v) return { hora12: 12, minuto: 0, periodo: 'AM' as const };
		const [h, m] = v.split(':').map(Number);
		const periodo: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
		let hora12 = h % 12;
		if (hora12 === 0) hora12 = 12;
		return { hora12, minuto: m, periodo };
	}

	const inicial = partesDesde24h(value);
	let hora12 = $state(inicial.hora12);
	let minuto = $state(inicial.minuto);
	let periodo = $state<'AM' | 'PM'>(inicial.periodo);

	const horas = Array.from({ length: 12 }, (_, i) => i + 1);
	const minutos = Array.from({ length: 60 }, (_, i) => i);

	$effect(() => {
		let h24 = hora12 % 12;
		if (periodo === 'PM') h24 += 12;
		value = `${String(h24).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
	});
</script>

<div class="selector-hora" {id}>
	<select bind:value={hora12} aria-label="Hora">
		{#each horas as h (h)}
			<option value={h}>{h}</option>
		{/each}
	</select>
	<span class="selector-hora__separador">:</span>
	<select bind:value={minuto} aria-label="Minuto">
		{#each minutos as m (m)}
			<option value={m}>{String(m).padStart(2, '0')}</option>
		{/each}
	</select>
	<select bind:value={periodo} aria-label="AM o PM">
		<option value="AM">AM</option>
		<option value="PM">PM</option>
	</select>
</div>

<style>
	.selector-hora {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.selector-hora select {
		height: 40px;
		padding: 0 0.4rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.85rem;
	}

	.selector-hora__separador {
		color: var(--color-text-muted);
		font-weight: bold;
	}
</style>
