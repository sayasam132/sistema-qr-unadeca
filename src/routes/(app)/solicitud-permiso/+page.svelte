<script lang="ts">
	// TODO (fase 2): enviar la solicitud a Supabase (tabla `solicitudes_permiso`).
	let motivo = $state('');
</script>

<svelte:head>
	<title>Solicitud de permiso · UNADECA</title>
</svelte:head>

<h1>Solicitud de permiso</h1>
<p>Pedí autorización para salir o ingresar fuera del horario habitual.</p>

<form class="tarjeta">
	<div class="campo">
		<label for="motivo">Motivo</label>
		<textarea id="motivo" rows="4" bind:value={motivo} required></textarea>
	</div>
	<button type="submit" class="boton">Enviar solicitud</button>
</form>
