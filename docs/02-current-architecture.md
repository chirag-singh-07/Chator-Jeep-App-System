# Current Architecture

## Current State
- **Frontend Architecture:** React/Vite (Admin), React Native/Expo (Apps). State management via Zustand.
- **Backend Architecture:** Node.js API with Express. Modular folder structure (`src/modules`).
- **Database:** MongoDB for persistent storage.
- **Realtime Communication:** Socket.IO and Firebase Cloud Messaging (FCM).
- **Background Jobs:** Redis and BullMQ.
- **Payments:** Razorpay, Wallet integration.
- **File Storage:** AWS S3 / DigitalOcean Spaces.

## Architecture Diagram

```mermaid
graph TD
  CustomerApp[Customer App Expo] --> API[Node.js API]
  RestaurantApp[Restaurant App Expo] --> API
  DeliveryApp[Delivery App Expo] --> API
  AdminPanel[Admin Panel React] --> API
  
  API --> DB[(MongoDB)]
  API --> Redis[(Redis)]
  API --> FCM[Firebase FCM]
  API --> Payment[Razorpay]
  API --> Storage[S3 / DigitalOcean]
```

## Findings
Well-separated concerns. Backend acts as the centralized broker.
