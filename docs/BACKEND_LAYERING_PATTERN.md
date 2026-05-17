# Backend Layering Pattern

## Objetivo

La API Express se migra endpoint por endpoint hacia capas explícitas. Las rutas públicas no deben cambiar durante esta fase.

## Capas

- `routes/`: define paths, middlewares y wiring Express.
- `controllers/`: traduce `req`/`res` hacia servicios y maneja `next(error)`.
- `validators/`: normaliza input y lanza errores `400` para datos inválidos.
- `services/`: contiene reglas de negocio y orquestación.
- `repositories/`: contiene SQL y acceso a datos.

## Ejemplos migrados

- `GET /health`
  - `routes/health.js`
  - `controllers/healthController.js`
  - `services/healthService.js`
  - `repositories/healthRepository.js`

- `GET /api/users`
- `POST /api/users`
  - `routes/users.js`
  - `controllers/userController.js`
  - `services/userService.js`
  - `validators/userValidator.js`
  - `repositories/userRepository.js`

- `GET /api/schools`
- `POST /api/schools`
  - `routes/schools.js`
  - `controllers/schoolController.js`
  - `services/schoolService.js`
  - `validators/schoolValidator.js`
  - `repositories/schoolRepository.js`

## Regla para próximos endpoints

Migrar un endpoint completo por vez. Si una ruta tiene varias operaciones, puede convivir temporalmente con operaciones legacy mientras se mueve una operación segura, pero no se debe duplicar SQL entre ruta y repositorio.
