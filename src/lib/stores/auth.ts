import { writable } from 'svelte/store';
import type { PerfilUsuario } from '$lib/types';

// Perfil del usuario autenticado (se completa en la fase de integración de
// autenticación real; por ahora queda disponible para que los componentes
// de la interfaz ya puedan importarlo).
export const perfilUsuario = writable<PerfilUsuario | null>(null);
