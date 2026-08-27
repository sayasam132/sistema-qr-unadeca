<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		titulo,
		subtitulo,
		iniciales,
		insigniaActiva = false,
		children
	}: {
		titulo: string;
		subtitulo?: string;
		iniciales?: string;
		insigniaActiva?: boolean;
		children: Snippet;
	} = $props();
</script>

<section class="panel">
	<header class="panel__cabecera">
		<div>
			<h1>
				{titulo}
				{#if insigniaActiva}
					<span class="panel__insignia" title="Cuenta activa" aria-hidden="true">✅</span>
				{/if}
			</h1>
			{#if subtitulo}
				<p class="panel__subtitulo">{subtitulo}</p>
			{/if}
		</div>
		{#if iniciales}
			<div class="panel__avatar">{iniciales}</div>
		{/if}
	</header>

	<div class="panel__cuerpo">
		{@render children()}
	</div>
</section>

<style>
	.panel {
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 2rem 2.5rem;
		min-height: calc(100vh - 4rem);
		box-sizing: border-box;
	}

	.panel__cabecera {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		padding-bottom: 1.5rem;
		margin-bottom: 1.75rem;
		border-bottom: 3px solid var(--color-divider);
	}

	.panel__cabecera h1 {
		margin: 0 0 0.4rem;
		color: var(--color-navy);
		font-size: 1.75rem;
	}

	.panel__insignia {
		display: inline-flex;
		width: 22px;
		height: 22px;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: var(--color-mint);
		font-size: 0.75rem;
		vertical-align: middle;
		margin-left: 0.3rem;
	}

	.panel__subtitulo {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 1rem;
	}

	.panel__avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background-color: var(--color-teal);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.2rem;
		flex-shrink: 0;
	}
</style>
