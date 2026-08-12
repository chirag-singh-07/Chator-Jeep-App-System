# Live Order Tracking

## Current State
- **Technology:** Socket.IO.
- **Flow:** Driver emits location -> Backend -> Customer socket room.

## Findings
Rider location updates are synced in real-time.

## Recommended Architecture
- Throttle GPS updates (e.g., every 5-10 seconds or based on distance delta) to save battery and reduce WebSocket load.
- Use Redis Pub/Sub if scaling Socket.IO across multiple Node.js instances.
