# Authentication & Authorization

## Current State
- **Authentication:** JWT (Access and Refresh tokens).
- **Roles:** Defined in `src/common/constants`.

## Findings
Roles likely include:
- `USER`
- `RESTAURANT_OWNER`
- `DELIVERY_PARTNER`
- `ADMIN`

## Role Matrix

| Action | Customer | Restaurant | Delivery | Admin |
|--------|----------|------------|----------|-------|
| Place Order | Yes | No | No | No |
| Accept Order | No | Yes | No | No |
| Deliver Order| No | No | Yes | No |
| Block User | No | No | No | Yes |

## Security Weaknesses
- Tokens must be securely stored on clients.
- Refresh token rotation should be enforced.
