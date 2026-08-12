# Delivery System

## Current State
- **Assignment Engine:** Redis-backed matching algorithm based on proximity.
- **OTP Verification:** 4-digit OTP generated upon pickup, verified by rider at completion.
- **Tracking:** Socket.IO events for live tracking.

## Findings
Delivery assignment uses a broadcast or nearest-neighbor approach.

## Recommended Architecture
1. Find eligible partners using Redis Geo spatial queries.
2. Filter by online status and current workload.
3. Send assignments sequentially or batch.
