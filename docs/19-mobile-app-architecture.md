# Mobile App Architecture

## Current State
- **Framework:** React Native (Expo)
- **State:** Zustand
- **Network:** Axios

## Recommended Architecture (Flutter Migration)
```
lib/
  core/
  config/
  network/
  features/
    auth/
    home/
    orders/
```

## Findings
Three separate Expo apps: Customer, Restaurant, Delivery.
