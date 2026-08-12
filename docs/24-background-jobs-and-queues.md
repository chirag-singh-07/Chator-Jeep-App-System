# Background Jobs and Queues

## Current State
- **Tech:** Redis (BullMQ).
- Used for async tasks.

## Recommended Architecture
Use queues for:
- Sending FCM notifications.
- Payment reconciliation.
- Auto-canceling stale orders.
