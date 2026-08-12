# Performance and Scalability

## Current State
- Redis used for queues (BullMQ).
- 2dsphere indexes used for quick location lookups.

## Findings
System is designed to be performant.

## Recommended Architecture
- Implement pagination for all list APIs (Orders, Restaurants).
- Use CDN for S3 image assets.
