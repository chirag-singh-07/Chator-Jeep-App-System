# Restaurant System

## Current State
- **Registration:** `REQUESTED` -> `ACTIVE`.
- **Location:** GeoJSON Point for 2dsphere indexing.
- **Docs:** Aadhar, PAN, FSSAI, Live Photo.
- **Status:** `isOpen` boolean toggle.

## Findings
Restaurants have a wallet balance (`walletBalance`, `totalEarnings`). The admin must approve the restaurant.

## Missing/Needs Improvement
- Operating hours scheduling (currently just a boolean `isOpen`).
- Holiday management.
