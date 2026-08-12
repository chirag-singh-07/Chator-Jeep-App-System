# Delivery Fees and Pricing

## Current State
- Fields exist for `foodAmount`, `deliveryFee`, `platformFee`, `commissionAmount`.

## Recommended Architecture
Create a centralized pricing service that calculates the final total during cart validation and order placement to prevent client spoofing.
