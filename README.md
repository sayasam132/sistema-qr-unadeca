# Sistema QR UNADECA

Sistema de control de acceso mediante código QR para la UNADECA.

## Stack

- **Svelte + SvelteKit** (TypeScript)
- **Supabase**: PostgreSQL, Storage, Auth (JWT), API REST, Row Level Security
- **node-qrcode** para la generación de códigos QR
- **face-api.js** para la validación de fotografías de perfil
- Despliegue en **Vercel**

## Rutas principales

| Ruta                 | Descripción                             |
| -------------------- | --------------------------------------- |
| `/login`             | Inicio de sesión                        |
| `/registro`          | Registro de nuevos usuarios             |
| `/inicio`            | Panel principal del usuario             |
| `/mi-qr`             | Código QR de acceso personal            |
| `/mi-perfil`         | Datos y foto de perfil                  |
| `/notificaciones`    | Notificaciones del usuario              |
| `/solicitud-permiso` | Solicitud de permisos de ingreso/salida |
| `/admin`             | Panel de administración                 |
| `/guardia`           | Panel de guardia para validar accesos   |

`/login` y `/registro` son públicas; el resto requiere sesión iniciada
(ver `src/routes/(app)/+layout.server.ts`).

## Configuración local

1. Instalar dependencias:

   ```sh
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar con las credenciales del proyecto Supabase:

   ```sh
   cp .env.example .env
   ```

   - `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`: en Supabase → Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY`: idem, es secreta (solo se usa en `src/lib/server`).

3. Levantar el servidor de desarrollo:

   ```sh
   npm run dev -- --open
   ```

## Estado del proyecto

Fase actual: **estructura base** (proyecto, cliente de Supabase, layout y las 9 rutas con
contenido de referencia). La autenticación real, el esquema de base de datos con RLS,
la generación de QR ligada al perfil y la validación facial se implementan en las
siguientes iteraciones — ver comentarios `TODO (fase 2)` en el código.
