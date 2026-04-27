# 🍕 Chator Jeep — Full-Stack Food Delivery Platform

A production-ready, high-performance food delivery ecosystem comprising five interconnected platforms. Built with a focus on real-time synchronization, secure payments, and a premium user experience.

---

## 🏗️ System Architecture

The platform follows a **Micro-app Architecture** where distinct applications handle specific roles in the food delivery lifecycle, all powered by a centralized high-speed backend.

### 🧩 Core Components
1.  **Backend (Node.js/Express)**: Centralized API, WebSocket server, and business logic engine.
2.  **Admin Panel (React/Vite)**: Operations dashboard for managing restaurants, users, riders, and system logs.
3.  **Customer App (Expo)**: Zomato-style mobile app for food discovery, ordering, and live tracking.
4.  **Restaurant App (Expo)**: Kitchen management system for order processing and menu control.
5.  **Delivery App (Expo)**: Rider companion for order requests, GPS navigation, and payout tracking.

---

## 🚀 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Redis (BullMQ) |
| **Real-time** | Socket.IO (Room-based sync), Firebase Cloud Messaging (Push) |
| **Mobile** | React Native, Expo, Zustand (State), Axios |
| **Admin UI** | React, TailwindCSS, Lucide Icons, Shadcn/UI |
| **Payments** | Razorpay Gateway, Integrated User/Partner Wallets |
| **Assets** | AWS S3 / DigitalOcean Spaces for high-res images |

---

## ✨ Key Features

### 🛒 Customer App
- **Geo-Proximity**: Fetch restaurants based on real-time GPS location.
- **Cart System**: Multi-item management with variants and add-ons.
- **Smart Checkout**: Hybrid payment options (Full Wallet, Partial Wallet + Razorpay, or COD).
- **Live Tracking**: Real-time status steppers and rider location mapping.

### 🍳 Restaurant App
- **Real-time Alerts**: Instant sound notifications for new incoming orders.
- **Order Management**: Status transitions (Accept -> Prepare -> Ready).
- **Menu Control**: Instant toggle for dish availability (In-stock/Out-of-stock).
- **Digital Wallet**: Real-time tracking of earnings and automatic payouts.

### 🛵 Delivery App
- **Matching Engine**: Redis-backed algorithm for assigning riders based on proximity.
- **Secure Completion**: 4-digit OTP verification system to prevent fraudulent deliveries.
- **GPS Navigation**: Built-in map routes from restaurant to customer.
- **Availability Toggle**: Simple Online/Offline switch for riders.

### 📊 Admin Panel
- **System Monitoring**: Terminal-style interface for monitoring backend logs and cron jobs.
- **Onboarding**: Complete KYC flow for approving/blocking restaurants and riders.
- **Global Settings**: Configure delivery fees, taxes, and service availability.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env (see Template below)
npm run dev
```

### 2. Admin Panel Setup
```bash
cd admin-panel
npm install
npm run dev
```

### 3. Mobile Apps (Customer / Restaurant / Delivery)
```bash
# Repeat for each mobile app directory
npm install
npx expo start
```

---

## 🔑 Environment Configuration (.env)

### Backend
```env
PORT=5000
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
AWS_S3_BUCKET=...
FIREBASE_SERVICE_ACCOUNT={"project_id":...}
```

### Mobile Apps (EXPO)
```env
EXPO_PUBLIC_API_URL=http://<your-ip>:5000/api/v1
EXPO_PUBLIC_RAZORPAY_KEY=...
```

---

## 🔄 Order Flow Logic

1.  **Order Placement**: User places order -> Wallet/Payment verified -> Order added to `PENDING`.
2.  **Restaurant Alert**: Restaurant receives `new_order` socket event -> Accepts -> Status: `PREPARING`.
3.  **Rider Request**: Restaurant marks `READY` -> Backend searches nearby riders -> `delivery:request` emitted.
4.  **Pickup**: Rider accepts -> Status: `PICKED_UP` -> Delivery OTP generated and sent to customer.
5.  **Completion**: Rider enters Customer OTP -> Status: `COMPLETED` -> **Earnings split and credited to Restaurant & Rider wallets automatically.**

---

## 📄 License
Internal proprietary software for Chator Jeep Ecosystem.
