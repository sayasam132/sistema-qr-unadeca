# Modelos de face-api.js

Esta carpeta debe contener los archivos de pesos (`*-weights_manifest.json` y `*.bin`)
de los modelos `tiny_face_detector`, `face_landmark_68` y `face_recognition`.

Se descargan desde el repositorio oficial de modelos de face-api.js y se colocan
directamente en esta carpeta (`static/models`) para que `cargarModelosFaciales()`
(`src/lib/utils/face-api.ts`) pueda cargarlos con `loadFromUri('/models')`.
