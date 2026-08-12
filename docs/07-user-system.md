# User System

## Current State
- **Profile:** name, email, phone.
- **Addresses:** Array of addresses with `label`, `line1`, `city`, and `location` (GeoJSON Point).
- **Status:** `ACTIVE`, `DISABLED`, `PENDING`.
- **FCM Tokens:** Array of tokens for push notifications.

## Findings
Users can have multiple addresses and devices (multiple FCM tokens).

## Recommended Architecture
Maintain the current schema, but consider creating a separate Wallet collection to isolate financial transactions.
