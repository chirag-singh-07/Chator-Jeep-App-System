# Redis and Caching

## Current State
- Redis is configured and used for BullMQ and delivery matching.

## Recommended Architecture
Use Redis for:
- Caching restaurant menus.
- Storing active driver locations (geospatial).
- Rate limiting.
