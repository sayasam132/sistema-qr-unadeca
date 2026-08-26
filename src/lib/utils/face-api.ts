import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

let modelosCargados = false;

// Carga los modelos de face-api.js usados para detectar y validar rostros en
// las fotos de perfil. Los archivos de pesos deben colocarse en static/models
// (ver static/models/README.md) antes de usar esta función.
export async function cargarModelosFaciales(): Promise<void> {
	if (modelosCargados) return;

	await Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
		faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
		faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
	]);

	modelosCargados = true;
}
