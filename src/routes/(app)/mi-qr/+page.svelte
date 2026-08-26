<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Mi QR · UNADECA</title>
</svelte:head>

<h1>Mi QR</h1>
<p>Presentá este código en el ingreso para que el guardia lo escanee.</p>

<div class="tarjeta qr">
	<img src={data.qrDataUrl} alt="Código QR de acceso" width="220" height="220" />
	<p class="qr__nota">
		Ejemplo generado con node-qrcode. En la próxima fase se vincula a tu perfil real.
	</p>
</div>

<style>
	.qr {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 320px;
	}

	.qr__nota {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		text-align: center;
		margin: 0;
	}
</style>
