# Payment System

## Current State
- **Gateway:** Razorpay, PhonePe.
- **Methods:** COD, ONLINE, WALLET, PARTIAL_WALLET.
- **Payment Status:** `UNPAID`, `PAID`, `REFUNDED`.

## Findings
Webhooks must be used to verify payment success. The system records `razorpayOrderId` and `razorpayPaymentId`.

## Recommended Architecture
- **Idempotency:** Ensure webhooks use idempotency keys to prevent duplicate processing.
- Never trust client-side payment success messages.
