import QRCode from 'qrcode';

/** Genera un código QR en formato data URL (PNG en base64) a partir de un contenido de texto. */
export async function generarCodigoQR(contenido: string): Promise<string> {
	return QRCode.toDataURL(contenido, {
		errorCorrectionLevel: 'M',
		margin: 1,
		color: {
			dark: '#0D1B4B',
			light: '#FFFFFF'
		}
	});
}
