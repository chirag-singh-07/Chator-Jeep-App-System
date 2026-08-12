# Data Consistency and Transactions

## Current State
- Mongoose models defined.

## Recommended Architecture
Use MongoDB Transactions (sessions) for:
- Order placement + Wallet deduction.
- Payment success + Status update + Wallet credit.
