# API Documentation

## Current State
Routes are organized under `/api/v1/`. Swagger UI is available at `/api/v1/docs`.

### Known Endpoints
- **GET /health:** Health check
- **GET /:** Root info
- **Auth:** `/api/v1/auth` (Rate limited)
- **Uploads:** `/api/v1/uploads` (Rate limited)

## Findings
The API uses REST principles and JWT for authentication.

## Implementation Notes
For full details, the Swagger spec should be consulted when running the server.
