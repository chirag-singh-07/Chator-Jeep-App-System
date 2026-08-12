# Error Handling and Logging

## Current State
- `error.middleware.ts` handles global errors.
- Morgan used for request logging.

## Recommended Architecture
Standardize API error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
