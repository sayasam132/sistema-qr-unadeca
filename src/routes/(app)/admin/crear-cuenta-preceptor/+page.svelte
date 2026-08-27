<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import PanelPagina from '$lib/components/PanelPagina.svelte';
	import { obtenerIniciales } from '$lib/utils/texto';

	let { data, form } = $props();

	let perfil = $derived(page.data.perfil);
	let iniciales = $derived(perfil ? obtenerIniciales(`${perfil.nombre} ${perfil.apellido}`) : '');

	let enviando = $state(false);
	let eliminandoId = $state<string | null>(null);
	let genero = $state<'masculino' | 'femenino' | ''>('');
</script>

<svelte:head>
	<title>Crear cuenta Preceptor/a · UNADECA</title>
</svelte:head>

<PanelPagina titulo="👤 Crear cuenta preceptor" subtitulo="Alta de personal de hogar" {iniciales}>
	{#if form?.exito}
		<p class="cuenta__aviso">
			Cuenta creada correctamente para {form.correo}. Va a completar su identificación desde Mi
			Perfil y, la primera vez que inicie sesión, se le va a pedir confirmar su nombre y aceptar el
			consentimiento de datos.
		</p>
	{/if}
	{#if form?.eliminado}
		<p class="cuenta__aviso">Cuenta eliminada correctamente.</p>
	{/if}
	{#if form?.error}
		<p class="cuenta__error">{form.error}</p>
	{/if}

	<div class="cuenta__columnas">
		<form
			method="POST"
			action="?/crear"
			use:enhance={() => {
				enviando = true;
				return async ({ update }) => {
					await update();
					enviando = false;
				};
			}}
		>
			<div class="campo-cuenta">
				<label for="nombre">Nombres</label>
				<input id="nombre" name="nombre" type="text" required />
			</div>
			<div class="campo-cuenta">
				<label for="apellido">Apellidos</label>
				<input id="apellido" name="apellido" type="text" required />
			</div>
			<div class="campo-cuenta">
				<label for="correo">Correo electrónico</label>
				<input id="correo" name="correo" type="email" required />
			</div>
			<div class="campo-cuenta">
				<label for="contrasena">Contraseña temporal</label>
				<input id="contrasena" name="contrasena" type="password" minlength="6" required />
			</div>

			<input type="hidden" name="genero" value={genero} />
			<div class="cuenta__genero">
				<button
					type="button"
					class="cuenta__genero-boton cuenta__genero-boton--masculino"
					class:cuenta__genero-boton--activo={genero === 'masculino'}
					onclick={() => (genero = 'masculino')}
				>
					Barones
				</button>
				<button
					type="button"
					class="cuenta__genero-boton cuenta__genero-boton--femenino"
					class:cuenta__genero-boton--activo={genero === 'femenino'}
					onclick={() => (genero = 'femenino')}
				>
					Señoritas
				</button>
			</div>

			<button type="submit" class="cuenta__boton" disabled={enviando || !genero}>
				{enviando ? 'Creando…' : 'Crear cuenta'}
			</button>
		</form>

		<div class="cuenta__lista">
			<p class="cuenta__lista-titulo">Lista de los Preceptores</p>
			{#if data.preceptores.length === 0}
				<p class="cuenta__lista-vacio">Todavía no hay preceptores registrados.</p>
			{:else}
				{#each data.preceptores as preceptor (preceptor.id)}
					<form
						method="POST"
						action="?/eliminar"
						use:enhance={({ cancel }) => {
							const nombreCompleto = `${preceptor.nombre} ${preceptor.apellido}`;
							if (
								!confirm(
									`¿Eliminar la cuenta de ${nombreCompleto}? Esta acción no se puede deshacer.`
								)
							) {
								cancel();
								return;
							}
							eliminandoId = preceptor.id;
							return async ({ update }) => {
								await update();
								eliminandoId = null;
							};
						}}
					>
						<input type="hidden" name="id" value={preceptor.id} />
						<div
							class="cuenta__chip"
							class:cuenta__chip--femenino={preceptor.genero === 'femenino'}
						>
							<span>{preceptor.nombre} {preceptor.apellido}</span>
							<button
								type="submit"
								class="cuenta__chip-borrar"
								disabled={eliminandoId === preceptor.id}
								aria-label={`Eliminar a ${preceptor.nombre} ${preceptor.apellido}`}
							>
								×
							</button>
						</div>
					</form>
				{/each}
			{/if}
		</div>
	</div>
</PanelPagina>

<style>
	.cuenta__aviso {
		background-color: #eaf9ee;
		color: #1e7e34;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1.25rem;
	}

	.cuenta__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1.25rem;
	}

	.cuenta__columnas {
		display: flex;
		flex-wrap: wrap;
		gap: 3rem;
	}

	.cuenta__columnas form:first-child {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 320px;
		flex: 1;
	}

	.campo-cuenta {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.campo-cuenta label {
		font-size: 0.8rem;
		font-weight: bold;
		color: var(--color-navy);
	}

	.campo-cuenta input {
		height: 42px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.9rem;
	}

	.cuenta__boton {
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
		margin-top: 0.5rem;
	}

	.cuenta__boton:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.cuenta__genero {
		display: flex;
		gap: 0.75rem;
	}

	.cuenta__genero-boton {
		height: 38px;
		padding: 0 1.1rem;
		border: 2px solid transparent;
		border-radius: var(--radius);
		font-family: inherit;
		font-size: 0.8rem;
		font-weight: bold;
		color: white;
		cursor: pointer;
		opacity: 0.55;
	}

	.cuenta__genero-boton--masculino {
		background-color: #1e7e34;
	}

	.cuenta__genero-boton--femenino {
		background-color: #e0538a;
	}

	.cuenta__genero-boton--activo {
		opacity: 1;
		border-color: var(--color-navy);
	}

	.cuenta__lista {
		flex: 1;
		min-width: 220px;
	}

	.cuenta__lista-titulo {
		font-weight: bold;
		color: var(--color-navy);
		font-size: 0.95rem;
		margin: 0 0 1rem;
	}

	.cuenta__lista-vacio {
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.cuenta__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 36px;
		padding: 0 0.5rem 0 1rem;
		border-radius: 999px;
		background-color: #1e7e34;
		color: white;
		font-size: 0.85rem;
		font-weight: bold;
		margin: 0 0.5rem 0.5rem 0;
	}

	.cuenta__chip--femenino {
		background-color: #e0538a;
	}

	.cuenta__chip-borrar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: none;
		background-color: rgba(255, 255, 255, 0.25);
		color: white;
		font-size: 0.9rem;
		line-height: 1;
		cursor: pointer;
	}

	.cuenta__chip-borrar:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
