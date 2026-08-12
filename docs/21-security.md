# Security

## Current State
- Rate limiters implemented for Auth and Uploads.
- Helmet used for HTTP headers.
- JWT used for sessions.

## Findings
- **High:** Ensure all prices are calculated server-side.
- **High:** Verify Razorpay webhooks using signatures.
- **Medium:** Refresh token storage must be secure.

## Recommended Architecture
Regularly rotate JWT secrets.
