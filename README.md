# Backend de EcoHome Store

Backend beta para la plataforma de comercio electronico EcoHome Store construido con Node.js, Express y PostgreSQL.

## Estructura del Proyecto

```text
EcoHome/
|-- migrations/
|   `-- 20260421_add_products_created_by.sql
|-- schema.sql
|-- package.json
|-- .env.example
|-- README.md
|-- openapi.json
|-- public/
|   `-- index.html
`-- src/
    |-- app.js
    |-- server.js
    |-- config/
    |   `-- env.js
    |-- controllers/
    |   |-- authController.js
    |   |-- productController.js
    |   `-- userController.js
    |-- database/
    |   `-- pool.js
    |-- middleware/
    |   |-- authJWT.js
    |   |-- authorizeRole.js
    |   |-- errorHandler.js
    |   `-- validateRequest.js
    |-- routes/
    |   |-- authRoutes.js
    |   |-- productRoutes.js
    |   `-- userRoutes.js
    `-- services/
        |-- authService.js
        |-- productService.js
        `-- userService.js
```

## Configuracion

1. Instala las dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
copy .env.example .env
```

3. Actualiza `.env` con tus credenciales de PostgreSQL y tu secreto JWT.

4. Ejecuta el esquema base en PostgreSQL o en el editor SQL de Supabase:

```sql
\i schema.sql
```

5. Si tu base ya existia antes del cambio de trazabilidad, aplica tambien la migracion:

```sql
\i migrations/20260421_add_products_created_by.sql
```

6. Inicia la API:

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

### Autenticacion

- `POST /auth/signup`
- `POST /auth/login`

### Productos

- `GET /products`
- `GET /products/:id`
- `POST /products` solo admin
- `PATCH /products/:id` solo admin
- `DELETE /products/:id` solo admin

Los endpoints de productos ahora incluyen trazabilidad:

- `created_by` se asigna desde `req.user.id`
- `creator` expone solo `{ id, name }`

### Usuarios

- `GET /users/me/stats` usuario autenticado

## OpenAPI y Postman

- El archivo `openapi.json` contiene la especificacion OpenAPI 3.0 lista para importar en Postman.
- En Postman puedes usar `Import` y seleccionar `openapi.json`.
- Tambien se incluye `EcoHome Store API.postman_collection.json`.

## Notas

- Las contrasenas se almacenan con hash usando bcrypt.
- JWT es stateless e incluye `id`, `role`, `name` y `email`.
- Las operaciones de escritura de productos estan protegidas con JWT y control de roles.
- `POST /products` no acepta `created_by` desde el cliente; la identidad siempre sale del JWT.
- `GET /users/me/stats` devuelve el total de productos creados por el usuario autenticado.
- PostgreSQL se utiliza mediante un pool de conexiones de `pg`.
- El registro publico siempre crea usuarios con rol `client`. Los usuarios admin deben crearse directamente en PostgreSQL para flujos de arranque o promocion.

## Ejemplos de respuesta

### Producto

```json
{
  "id": "a0d13a1a-3f20-4d92-9b93-7aa94a8fcd22",
  "name": "Lampara de bambu",
  "price": "89.90",
  "created_at": "2026-04-07T18:30:00.000Z",
  "updated_at": "2026-04-07T18:30:00.000Z",
  "created_by": "5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59",
  "creator": {
    "id": "5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59",
    "name": "Ana Perez"
  }
}
```

### Estadisticas del usuario autenticado

```json
{
  "userId": "5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59",
  "name": "Ana Perez",
  "productCount": 4
}
```

## Uso de Supabase como PostgreSQL

1. En el panel de Supabase, abre tu proyecto y haz clic en `Connect`.
2. Copia los datos de conexion del `Session pooler` si tu aplicacion Express se ejecuta como un backend persistente. Usa `Direct connection` solo si tu entorno soporta IPv6.
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
5. Si la base ya existia, ejecuta tambien `migrations/20260421_add_products_created_by.sql`.
6. Inicia el backend normalmente con `npm run dev`.

Este proyecto usa Supabase unicamente como base de datos PostgreSQL administrada. La autenticacion y la autorizacion siguen siendo manejadas completamente por este backend.
