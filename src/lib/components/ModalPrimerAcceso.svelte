<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let {
		supabase,
		usuarioId,
		nombreActual,
		apellidoActual
	}: {
		supabase: SupabaseClient;
		usuarioId: string;
		nombreActual: string;
		apellidoActual: string;
	} = $props();

	type Paso = 'nombre' | 'consentimiento';
	let paso = $state<Paso>('nombre');

	let nombre = $state(nombreActual);
	let apellido = $state(apellidoActual);
	let nuevaContrasena = $state('');
	let confirmarContrasena = $state('');

	let guardando = $state(false);
	let error = $state<string | null>(null);

	function continuar(evento: SubmitEvent) {
		evento.preventDefault();
		error = null;

		if (nuevaContrasena && nuevaContrasena.length < 6) {
			error = 'La nueva contraseña debe tener al menos 6 caracteres.';
			return;
		}
		if (nuevaContrasena && nuevaContrasena !== confirmarContrasena) {
			error = 'Las contraseñas no coinciden.';
			return;
		}

		paso = 'consentimiento';
	}

	async function aceptarYContinuar() {
		error = null;
		guardando = true;
		try {
			if (nuevaContrasena) {
				const { error: errorContrasena } = await supabase.auth.updateUser({
					password: nuevaContrasena
				});
				if (errorContrasena) {
					error = `No se pudo cambiar la contraseña: ${errorContrasena.message}`;
					paso = 'nombre';
					return;
				}
			}

			const { error: errorGuardar } = await supabase
				.from('usuarios')
				.update({ nombre, apellido, consentimiento: true })
				.eq('id', usuarioId);

			if (errorGuardar) {
				error = `No se pudo guardar: ${errorGuardar.message}`;
				paso = 'nombre';
				return;
			}

			await invalidateAll();
		} finally {
			guardando = false;
		}
	}
</script>

<div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-primer-acceso">
	<div class="modal__tarjeta">
		{#if paso === 'nombre'}
			<h2 id="titulo-primer-acceso">Bienvenido/a — completá tu nombre</h2>
			<p class="modal__texto">
				Esta es la primera vez que ingresás con esta cuenta. Confirmá o corregí tu nombre antes de
				continuar.
			</p>

			{#if error}
				<p class="modal__error">{error}</p>
			{/if}

			<form onsubmit={continuar}>
				<div class="campo-modal">
					<label for="pa-nombre">Nombre</label>
					<input id="pa-nombre" type="text" bind:value={nombre} required />
				</div>
				<div class="campo-modal">
					<label for="pa-apellido">Apellido</label>
					<input id="pa-apellido" type="text" bind:value={apellido} required />
				</div>
				<div class="campo-modal">
					<label for="pa-contrasena">Nueva contraseña (opcional)</label>
					<input
						id="pa-contrasena"
						type="password"
						placeholder="Dejalo vacío para conservar la actual"
						bind:value={nuevaContrasena}
						minlength="6"
					/>
				</div>
				{#if nuevaContrasena}
					<div class="campo-modal">
						<label for="pa-confirmar">Confirmá la nueva contraseña</label>
						<input
							id="pa-confirmar"
							type="password"
							bind:value={confirmarContrasena}
							minlength="6"
						/>
					</div>
				{/if}

				<div class="modal__acciones">
					<button type="submit" class="modal__boton modal__boton--primario">Continuar</button>
				</div>
			</form>
		{:else}
			<h2 id="titulo-primer-acceso">Consentimiento de Tratamiento de Datos Personales</h2>
			<p class="modal__texto">
				De acuerdo con la Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus
				Datos Personales de Costa Rica, le informamos que sus datos personales (nombre, fotografía y
				documento de identidad) serán utilizados exclusivamente para el control de acceso a las
				instalaciones de la UNADECA. Sus datos serán almacenados de forma segura y podrá solicitar
				su eliminación en cualquier momento desde su perfil.
			</p>

			{#if error}
				<p class="modal__error">{error}</p>
			{/if}

			<div class="modal__acciones">
				<button
					type="button"
					class="modal__boton modal__boton--secundario"
					onclick={() => (paso = 'nombre')}
					disabled={guardando}
				>
					Atrás
				</button>
				<button
					type="button"
					class="modal__boton modal__boton--primario"
					onclick={aceptarYContinuar}
					disabled={guardando}
				>
					{guardando ? 'Guardando…' : 'Acepto y continúo'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background-color: rgba(13, 27, 75, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 50;
	}

	.modal__tarjeta {
		width: 100%;
		max-width: 460px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: 1.75rem;
		box-sizing: border-box;
	}

	.modal__tarjeta h2 {
		color: var(--color-navy);
		font-size: 1.1rem;
		margin: 0 0 1rem;
	}

	.modal__texto {
		color: var(--color-text);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.25rem;
	}

	.modal__error {
		background-color: #fdecea;
		color: #b3261e;
		border-radius: var(--radius);
		padding: 0.6rem 0.8rem;
		font-size: 0.85rem;
		margin: 0 0 1rem;
	}

	.campo-modal {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-bottom: 0.9rem;
	}

	.campo-modal label {
		font-size: 0.8rem;
		font-weight: bold;
		color: var(--color-navy);
	}

	.campo-modal input {
		height: 42px;
		padding: 0 0.9rem;
		border-radius: var(--radius);
		border: 1px solid var(--color-border);
		background-color: var(--color-input-bg);
		font-family: inherit;
		font-size: 0.9rem;
	}

	.modal__acciones {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
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

	.modal__boton:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
