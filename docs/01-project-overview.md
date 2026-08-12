# Project Overview

## Current State
- **Project Name:** ChatoriJeeb (Chator Jeep)
- **What it does:** Full-Stack Food Delivery Platform
- **Current Technology Stack:** 
  - Backend: Node.js, Express, MongoDB (Mongoose), Redis (BullMQ), Socket.IO
  - Mobile Apps: React Native, Expo, Zustand
  - Admin Panel: React, Vite, TailwindCSS
  - Payments: Razorpay
- **Main Business Workflow:** Customer places order -> Payment verified -> Restaurant gets socket event (new_order) -> Accepts -> Marks Ready -> Backend matches rider via Redis -> Rider accepts -> Pickup (OTP) -> Delivery completion.

## Findings
The platform employs a Micro-app Architecture separating concerns into a Customer App, Restaurant App, Delivery App, and Admin Panel.

## Recommended Architecture
Keep the current micro-app architecture but move to Flutter for better performance across mobile apps.

## Implementation Notes
See [Mobile App Architecture](./19-mobile-app-architecture.md) for Expo to Flutter migration details.
