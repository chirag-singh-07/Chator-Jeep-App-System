# Current Problems

## Findings

**Problem:** Potential missing MongoDB transactions for payments.
**Severity:** HIGH
**Why it is bad:** Can lead to race conditions where wallet is deducted but order fails.
**Recommended fix:** Implement Mongoose transactions for critical flows.

**Problem:** Client-side pricing calculation risk.
**Severity:** CRITICAL
**Why it is bad:** If API accepts `totalAmount` blindly, users can place free orders.
**Recommended fix:** Backend must recalculate.
