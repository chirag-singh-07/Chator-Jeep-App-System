# Cart and Checkout

## Current State
- **Payment Methods:** `COD`, `ONLINE`, `WALLET`, `PARTIAL_WALLET`.
- **Pricing:** `foodAmount`, `deliveryFee`, `commissionAmount`, `platformFee`, `totalAmount`.

## Findings
Orders calculate multiple fee components.
The backend must be the source of truth for the `totalAmount`.

## Problems
Client-side price manipulation is a risk if the backend doesn't recalculate prices based on the DB's `MenuItem` prices during checkout.
