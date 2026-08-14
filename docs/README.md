# Documentation Overview

## What this is
This is the complete technical documentation and architecture package for ChatoriJeeb.

## Current Technology Stack
Node.js, Express, MongoDB, Redis, React Native (Expo), React.

## Current Architecture Summary
A micro-app architecture with a central Node.js backend acting as the broker for all apps.

## Recommended Architecture Summary
Maintain the backend but migrate mobile applications to Flutter. Ensure robust server-side validation and transactions.

## Recommended Reading Order
1. 01-project-overview.md
2. 02-current-architecture.md
3. 03-backend-architecture.md
4. 04-database-architecture.md
5. 11-order-system.md
6. 41-bulk-order-system.md
7. 40-ai-agent-development-rules.md

## Important Warnings
- Never trust client-side pricing.
- Backend is the source of truth.

## Known Unknowns
- Some specific Map API usages.

## Migration Status
- Planned migration from Expo to Flutter.

## Instructions for future AI agents
Read `40-ai-agent-development-rules.md` before making any changes.
