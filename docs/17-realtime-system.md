# Realtime System

## Current State
- **Technology:** Socket.IO (Room-based sync).
- Used for Order Alerts and Delivery Tracking.

## Findings
The backend runs a WebSocket server alongside the Express app.

## Implementation Notes
Ensure Redis adapter is used for Socket.IO if the backend is horizontally scaled.
