# Supabase

Migraciones SQL del esquema (`supabase/migrations`), aplicadas en orden por nombre:

1. `crear_tabla_roles` — catálogo de roles (`estudiante`, `admin`, `guardia`).
2. `crear_tabla_usuarios` — perfil de cada usuario, vinculado 1 a 1 con `auth.users`.
3. `crear_funciones_rol` — función `rol_actual()` (evita recursión en RLS) y el trigger
   `on_auth_user_created`, que crea la fila en `usuarios` automáticamente al hacer
   `supabase.auth.signUp` (usa `nombre_completo` y `carnet` enviados como metadata).
4. `crear_tabla_permisos` — solicitudes de permiso de entrada/salida.
5. `crear_tabla_movimientos` — registro de entradas y salidas generado por un guardia.
6. `crear_tabla_notificaciones` — avisos dirigidos a un usuario.
7. `storage_fotos_perfil` — bucket privado `fotos-perfil` y sus políticas.

Todas las tablas tienen Row Level Security habilitado; ver cada migración para el
detalle de las políticas.

## Aplicar las migraciones

Con la [CLI de Supabase](https://supabase.com/docs/guides/cli) enlazada al proyecto:

```bash
supabase db push
```

## Modelos de face-api.js

Antes de probar el registro en el navegador, descargar los pesos de los modelos
`tiny_face_detector`, `face_landmark_68` y `face_recognition` en `static/models`
(ver `static/models/README.md`).

## Variables de entorno

Configurar `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` en `.env` (ver `.env.example`).

## Nota sobre confirmación de correo

El registro sube la foto de perfil inmediatamente después de `signUp`, usando la
sesión que Supabase Auth devuelve en la misma respuesta. Si el proyecto tiene
habilitada la confirmación de correo, esa sesión no existe todavía y la foto no
se puede subir en ese momento; para que el flujo de registro quede completo en un
solo paso, desactivar "Confirm email" en Authentication → Providers → Email.
