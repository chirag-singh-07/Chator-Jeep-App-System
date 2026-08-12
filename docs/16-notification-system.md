# Notification System

## Current State
- **Technology:** Firebase Cloud Messaging (FCM).
- Models contain `fcmTokens` array for users and restaurants.

## Findings
Push notifications are used for order state changes.

## Recommended Architecture
- Create a centralized Notification Service.
- Clean up stale FCM tokens automatically when FCM returns a `NotRegistered` error.
