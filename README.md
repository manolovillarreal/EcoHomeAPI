# Backend de EcoHome Store

API REST para EcoHome Store construida con Node.js, Express y PostgreSQL. Incluye autenticacion con JWT, refresh tokens, control de acceso por roles, CRUD de productos y pruebas automatizadas con Jest.

## Estructura del Proyecto

```text
EcoHome/
|-- migrations/
|   |-- 20260421_add_products_created_by.sql
|   `-- 20260428_roles_refresh_tokens.sql
|-- schema.sql
|-- package.json
|-- .env.example
|-- README.md
|-- openapi.json
|-- public/
|   `-- index.html
|-- tests/
|   |-- helpers/
|   |-- integration/
|   |-- setup.js
|   `-- unit/
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

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
copy .env.example .env
```

3. Configura `.env` con tus credenciales de PostgreSQL y secretos JWT.

4. Ejecuta el esquema base:

```sql
\i schema.sql
```

5. Si tu base ya existia, aplica tambien las migraciones:

```sql
\i migrations/20260421_add_products_created_by.sql
\i migrations/20260428_roles_refresh_tokens.sql
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
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`
- `NODE_ENV`

## Modelo de Roles

- `admin`: control total
- `staff`: usuario interno con permisos para gestionar productos
- `client`: usuario externo

Notas:

- El registro publico con `POST /auth/signup` siempre crea usuarios con rol `client`.
- Los usuarios existentes pueden migrarse a `staff` con `migrations/20260428_roles_refresh_tokens.sql`.

## Resumen de la API

### Autenticacion

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`

### Productos

- `GET /products`
- `GET /products/:id`
- `POST /products` solo `admin` o `staff`
- `PATCH /products/:id` solo `admin` o `staff`
- `PUT /products/:id` solo `admin` o `staff`
- `DELETE /products/:id` solo `admin`

### Usuarios

- `GET /users/me/stats` solo `admin` o `staff`

## Autenticacion

- El `accessToken` usa una expiracion corta.
- El `refreshToken` usa una expiracion larga y se almacena en PostgreSQL.
- El `authJWT` rechaza refresh tokens si se intentan usar como bearer tokens de acceso.

Ejemplo de login:

```json
{
  "message": "Login successful",
  "user": {
    "id": "5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59",
    "name": "Ana Perez",
    "email": "ana@example.com",
    "role": "staff",
    "created_at": "2026-04-28T18:30:00.000Z"
  },
  "token": "access.jwt",
  "accessToken": "access.jwt",
  "refreshToken": "refresh.jwt"
}
```

Ejemplo de refresh:

```json
{
  "accessToken": "new-access.jwt"
}
```

## Productos y Paginacion

`GET /products` mantiene compatibilidad hacia atras:

- Sin query params: devuelve el arreglo tradicional de productos.
- Con `page`, `limit` o `created_by`: devuelve `{ data, pagination }`.

Query params soportados:

- `page`
- `limit`
- `created_by`

Ejemplo:

```text
GET /products?page=1&limit=10&created_by=5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59
```

Respuesta paginada:

```json
{
  "data": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

Notas:

- `created_by` se asigna siempre desde `req.user.id`.
- `creator` expone solo `{ id, name }`.

## Estadisticas de Usuario

`GET /users/me/stats` devuelve:

```json
{
  "userId": "5c2da17d-3d6e-4c15-aa0a-8f4d4fe9ec59",
  "name": "Ana Perez",
  "productCount": 4
}
```

## OpenAPI y Postman

- `openapi.json` contiene la especificacion OpenAPI 3.0 actualizada.
- `EcoHome Store API.postman_collection.json` puede importarse en Postman.

## Pruebas

La API incluye pruebas unitarias e integracion con Jest y Supertest.

Comandos:

```bash
npm test
npm test -- --verbose
npm run test:watch -- --verbose
```

Cobertura actual:

- Auth: signup, login, refresh
- Productos: CRUD, paginacion y validaciones
- RBAC: permisos permitidos y denegados
- Middleware: `authJWT` y `authorize`
- Servicios: auth y products

## Uso de Supabase como PostgreSQL

1. En Supabase abre tu proyecto y haz clic en `Connect`.
2. Copia los datos del `Session pooler`.
3. Configura `.env`:

```env
DB_HOST=aws-0-REGION.pooler.supabase.com
DB_USER=postgres.PROJECT_REF
DB_PASS=your_database_password
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
JWT_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_a_second_long_random_secret
```

4. Ejecuta `schema.sql`.
5. Si la base ya existia, ejecuta ambas migraciones.
6. Inicia el backend con `npm run dev`.

Este proyecto usa Supabase solo como PostgreSQL administrado. La autenticacion y autorizacion siguen siendo responsabilidad de este backend.
