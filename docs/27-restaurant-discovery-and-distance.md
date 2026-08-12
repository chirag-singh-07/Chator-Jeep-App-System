# Restaurant Discovery and Distance

## Current State
- Uses MongoDB `$near` / `$geoNear` with GeoJSON Points.

## Recommended Architecture
- Calculate straight-line distance via DB.
- Filter by `isOpen` and `status === 'ACTIVE'`.
