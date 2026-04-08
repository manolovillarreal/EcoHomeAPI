# Backend de EcoHome Store

Backend beta para la plataforma de comercio electrónico EcoHome Store construido con Node.js, Express y PostgreSQL.

## Estructura del Proyecto

```text
EcoHome/
|-- schema.sql
|-- package.json
|-- .env.example
|-- README.md
`-- src/
    |-- app.js
    |-- server.js
    |-- config/
    |   `-- env.js
    |-- controllers/
    |   |-- authController.js
    |   `-- productController.js
    |-- database/
    |   `-- pool.js
    |-- middleware/
    |   |-- authJWT.js
    |   |-- authorizeRole.js
    |   |-- errorHandler.js
    |   `-- validateRequest.js
    |-- routes/
    |   |-- authRoutes.js
    |   `-- productRoutes.js
    `-- services/
        |-- authService.js
        `-- productService.js
```

## Configuración

1. Instala las dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
copy .env.example .env
```

3. Actualiza `.env` con tus credenciales de PostgreSQL y tu secreto JWT.

4. Ejecuta manualmente el script SQL en PostgreSQL o en el editor SQL de Supabase:

```sql
\i schema.sql
```

5. Inicia la API:

```bash
npm run dev
```

## Variables de Entorno

- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_PORT`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`

## Resumen de la API

### Autenticación

- `POST /auth/signup`
- `POST /auth/login`

### Productos

- `GET /products`
- `GET /products/:id`
- `POST /products` solo admin
- `PATCH /products/:id` solo admin
- `DELETE /products/:id` solo admin

## OpenAPI y Postman

- El archivo [openapi.yaml](/M:/Dev/uniasturias/EcoHome/openapi.yaml) contiene la especificación OpenAPI 3.0 lista para importar en Postman.
- En Postman puedes usar `Import` y seleccionar `openapi.yaml`.

## Notas

- Las contraseñas se almacenan con hash usando bcrypt.
- JWT es stateless e incluye `id` y `role`.
- Las operaciones de escritura de productos están protegidas con JWT y control de roles.
- PostgreSQL se utiliza mediante un pool de conexiones de `pg`.
- El registro público siempre crea usuarios con rol `client`. Los usuarios admin deben crearse directamente en PostgreSQL para flujos de arranque o promoción.

## Uso de Supabase como PostgreSQL

1. En el panel de Supabase, abre tu proyecto y haz clic en `Connect`.
2. Copia los datos de conexión del `Session pooler` si tu aplicación Express se ejecuta como un backend persistente. Usa `Direct connection` solo si tu entorno soporta IPv6.
3. Coloca los valores en `.env`:

```env
DB_HOST=aws-0-REGION.pooler.supabase.com
DB_USER=postgres.PROJECT_REF
DB_PASS=your_database_password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

4. Ejecuta `schema.sql` en el editor SQL de Supabase.
5. Inicia el backend normalmente con `npm run dev`.

Este proyecto usa Supabase únicamente como base de datos PostgreSQL administrada. La autenticación y la autorización siguen siendo manejadas completamente por este backend.
