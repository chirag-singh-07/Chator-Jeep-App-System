# Bulk & Party Order System

This document outlines the current state, architecture, business rules, and UI integrations of the **Bulk & Party Order System** in the ChatoriJeeb ecosystem.

---

## 1. Overview
The Bulk & Party Order system allows customers to place large-volume orders (minimum food value of ₹5,000) that are scheduled in advance. Unlike standard orders, bulk orders calculate dynamic delivery surcharges for large item packages and allow **multiple delivery riders (multi-rider dispatch)** to accept and coordinate the delivery.

---

## 2. Database Schema (Mongoose)
In [`order.model.ts`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/backend/src/modules/order/order.model.ts), bulk orders extend the standard order Schema with:
*   `isBulkOrder` (`Boolean`, default: `false`): Flags whether the order is classified as a bulk/party order.
*   `scheduledDeliveryTime` (`Date`, default: `null`): The planned target delivery timestamp.
*   `deliveryIds` (`[ObjectId]`, ref: `DeliveryPartner`): An array of delivery partner IDs assigned to the order to support multi-rider distribution.

---

## 3. Backend Architecture & Business Rules
The core logic resides in [`order.service.ts`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/backend/src/modules/order/order.service.ts) and [`delivery.service.ts`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/backend/src/modules/delivery/delivery.service.ts):

### A. Order Placement Validations
During checkout preview and order creation:
1.  **Minimum Threshold**: Bulk orders must have a food total value of at least **₹5,000**.
2.  **Scheduling Requirement**: A scheduled delivery time is strictly required.
3.  **Advance Scheduling**: The scheduled time must be at least **3 hours in advance** of the current system time.

### B. Bulk Delivery Fee Calculations
To account for bulk carriage:
*   If the total quantity of items in the order exceeds **10**, an additional carriage surcharge of **₹20 per item** is added:
    $$\text{Additional Fee} = (\text{Total Items} - 10) \times 20$$

### C. Multi-Rider Dispatch Algorithm
Bulk orders dispatch to multiple delivery partners depending on volume:
1.  **Required Rider Count (`maxRiders`)**:
    *   For standard orders: 1 rider.
    *   For bulk orders: Calculated as:
        $$\text{maxRiders} = \max\left(2, \left\lceil \frac{\text{Total Items}}{10} \right\rceil\right)$$
2.  **Acceptance Logic**:
    *   Multiple delivery partners are allowed to accept the same bulk order.
    *   The backend verifies that the number of riders who accepted does not exceed `maxRiders`.
    *   Each accepting partner's ID is appended to the order's `deliveryIds` array.
    *   The first accepting partner triggers the order status transition to `ACCEPTED`.

### D. Bulk Notifications
In [`notification.manager.ts`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/backend/src/modules/notification/notification.manager.ts):
*   **Restaurant Notification**: Triggered via `notifyRestaurantNewBulkOrder()`. Displays title: `🎉 New Bulk/Party Order #[ID]` and custom copy emphasizing a large-value order.
*   **Rider Notification**: Broadcasted via `notifyPartnerBulkDeliveryRequest()`. Displays title: `📦 Bulk Delivery Request #[ID]` and highlights "High Earnings".

---

## 4. UI Implementation across Applications

The bulk order system is fully integrated across all frontend panels and mobile applications:

### A. Main User App (Customer Checkout)
Implemented in [`checkout/index.tsx`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/main-user-app/app/checkout/index.tsx):
*   **Bulk & Party Order Card**: Toggled using a custom switch. Enabled only if the basket total $\ge$ ₹5,000.
*   **Upsell Banner**: If the basket total is under ₹5,000, it renders an info banner showing exactly how much more to add to unlock bulk benefits: `Add ₹[Difference] more to unlock bulk benefits...`
*   **Date Selector**: Horizontal scrolling scroll view rendering dates for the next 7 days.
*   **Time Slot Selector**: Half-hour time slots grid ranging from 10:00 AM to 10:00 PM. Automatically filters out slots that do not meet the 3-hour minimum advance scheduling rule for the current day.
*   **Confirmation Box**: Displays the resolved date and time format on successful selection.

### B. Restaurant Mobile App
Implemented in [`order/[id].tsx`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/Restaurant-app/app/order/[id].tsx) and tabs:
*   **Bulk Notice Card**: An orange/red notice banner displaying: `BULK / PARTY ORDER DETECTED - This order contains a large volume of items (minimum value ₹5,000)...` along with the scheduled delivery day/time.
*   **Bulk Menu Upload**: Implemented in [`menu.tsx`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/Restaurant-app/app/(tabs)/menu.tsx) through a **Bulk Upload CSV Modal**, allowing restaurants to add multiple dishes to their menu instantaneously using structured CSV text.

### C. Delivery Partner Mobile App
Implemented in [`order/[id].tsx`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/delivery-app/app/order/[id].tsx):
*   **Rider Warning Banner**: A warning block displaying: `📦 Bulk Order: Multiple riders are assigned to this delivery. Please coordinate.`

### D. Admin Web Dashboard
Implemented in [`orders-page.tsx`](file:///c:/Users/ANUSHYA/Videos/chirag-projects/Chator-Jeep-App-System/admin-panel/src/pages/orders-page.tsx) and detail views:
*   **Orders Table Badge**: Shows a `📦 Bulk Order` warning label on the main order table rows.
*   **Order Details Banner**: Displays a `📦 Bulk / Party Order` alert box highlighting the scheduled date/time target for administrative monitoring.
