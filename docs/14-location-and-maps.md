# Location and Maps

## Current State
- **Data Type:** GeoJSON `Point`.
- **Indexes:** `2dsphere` index on `Restaurant.location` and `User.addresses.location`.

## Findings
The database is correctly setup for geospatial queries (`$near`, `$geoNear`).

## Recommended Architecture
- Do not hardcode a massive search radius.
- Use a tiered search radius: 5km -> 8km -> 10km.
- Calculate straight-line distance via MongoDB, and optionally road distance via Maps API only for top candidates to save API costs.
