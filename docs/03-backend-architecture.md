# Backend Architecture

## Current State
- **Framework:** Node.js / Express
- **Entry point:** `src/server.ts` & `src/app.ts`
- **Folder structure:**
  - `src/common/` (middleware, utils, constants, services, errors)
  - `src/config/` (env, etc.)
  - `src/jobs/`
  - `src/modules/` (auth, user, restaurant, order, delivery, etc.)
  - `src/routes/`
  - `src/sockets/`
- **Validation:** Express Middlewares
- **Authentication:** JWT
- **Error handling:** Global error middleware
- **Rate limiting:** Express-rate-limit

## Findings
The architecture is modular, grouped by feature (`src/modules/*`).

## Recommended Architecture
```
routes
controllers
services
repositories
models
middleware
validators
utils
jobs
events
config
```

## Implementation Notes
Current architecture mixes controllers and services within `modules/`. A cleaner separation using the repository pattern is recommended.
