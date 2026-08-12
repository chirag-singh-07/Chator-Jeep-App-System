# Chatori Jeeb: Billing & Profit Distribution Guide

This document provides a detailed breakdown of how pricing, final billing, and profit distributions work in the Chatori Jeeb platform, along with a concrete example.

## 1. Final Billing (What the Customer Pays)

When a customer places an order, the system independently fetches the latest prices from the database to ensure accuracy and calculates the totals:

*   **Food Amount:** The total cost of all menu items (Item Price × Quantity).
*   **Delivery Fee:** Calculated dynamically based on the straight-line distance between the restaurant and the customer. The formula is `Base Fee (e.g., ₹35) + (Distance in km × Per Km Rate (e.g., ₹6))`.
*   **Platform Fee:** A fixed convenience fee added to the order.
*   **Coupon Discount:** Any valid promotional discount applied by the customer.

**Final Bill = (Food Amount + Delivery Fee + Platform Fee) - Coupon Discount**

---

## 2. Profit Distribution (Who Gets What)

When the order is successfully marked as `COMPLETED` (i.e., after the driver verifies the OTP upon arrival), the system automatically routes the money to the respective digital wallets:

1.  **Delivery Partner:** Takes **100% of the Delivery Fee**.
2.  **Restaurant:** Takes the **Food Amount minus their Commission**. By default, the platform charges the restaurant a 10% commission on the food sales.
3.  **Platform (Chatori Jeeb):** Takes the **Commission from the restaurant** plus the **Platform Fee**, but also absorbs the cost of any **Coupon Discounts**.

---

## 📝 Example Walkthrough

Let's assume a customer orders 2 Pizzas from a restaurant 5 kilometers away.

*   **Pizza price:** ₹200 each (Total: ₹400)
*   **Platform fee:** ₹10
*   **Commission rate:** 10%
*   **Delivery config:** ₹35 base + ₹6/km
*   **Coupon used:** "WELCOME" for ₹50 off

### Step 1: The Customer's Bill
*   **Food Amount:** ₹400
*   **Delivery Fee:** ₹35 + (5km × ₹6) = ₹65
*   **Platform Fee:** ₹10
*   **Subtotal:** ₹475
*   **Coupon Discount:** -₹50
*   **Total Paid by Customer:** **₹425**

### Step 2: The Distribution (When the order is delivered)
*   **Delivery Partner Wallet:** Credited **₹65**. *(They keep the entire delivery fee).*
*   **Restaurant Wallet:** Credited **₹360**. *(Food Amount of ₹400 - 10% platform commission of ₹40).*
*   **Chatori Jeeb Revenue:** Takes the ₹40 commission + ₹10 Platform Fee = ₹50 gross. However, since the platform subsidized a ₹50 discount coupon, the net profit on this specific transaction is **₹0** (₹50 gross - ₹50 coupon).

*Note: All wallet credits are handled automatically using secure database transactions during the delivery completion event, ensuring no funds are lost or double-credited in the process.*
