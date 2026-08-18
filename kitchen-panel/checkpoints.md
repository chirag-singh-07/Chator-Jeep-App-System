# Kitchen Panel Development Checkpoints

## Current Status
Audit phase completed. Moving on to Authentication implementation (Agent 2 task).

## Project Architecture
- **Kitchen App (Mobile):** React Native app (`main-kitchen-app` / `Restaurant-app`) handling auth via `/api/v1/restaurants/login` and `/api/v1/restaurants/register`. Uses `useAuthStore` (zustand + AsyncStorage) for state management. Uses standard JWT token (`accessToken`).
- **Kitchen Panel (Web):** Next.js 14+ application using Tailwind CSS and shadcn/ui. Already has some dummy UI created for `/login`. Needs full backend integration mirroring the mobile app.
- **Backend:** Node.js Express server (`api.chatorijeeb.com/api/v1`).

## Existing Authentication System
The mobile Kitchen App uses the following endpoints:
1. **Login:** `POST /restaurants/login` with `{ email, password }`
2. **Register:** `POST /restaurants/register` with `{ ownerName, email, password, phone, restaurantName, ... }`
3. **Forgot Password:** Uses the general auth routes:
   - Request OTP: `POST /auth/request-otp` with `{ email, type: "forgot_password" }`
   - Reset Password: `POST /auth/reset-password` with `{ email, otp, password }`

## Backend APIs
The backend has specific routes for kitchen users under `/restaurants`:
- `GET /restaurants/me/status` (Check verification status)
- `GET /restaurants/me/menu`
- `POST /restaurants/me/menu`
- `PATCH /restaurants/me/open`

## Authentication Flow
1. User logs in with email and password via `/restaurants/login`.
2. Receives `accessToken`.
3. Token stored in local storage/cookies.
4. Token attached as `Bearer` token to all subsequent authenticated requests.
5. 401 Unauthorized responses trigger logout.

## Restaurant/User Relationship
When a restaurant is registered (`/restaurants/register`), the backend creates a standard `User` document with `role: "KITCHEN"`, and a linked `Restaurant` document. The restaurant is initially in a `REQUESTED` state and must be approved by an Admin. The `accessToken` belongs to the User, and `req.user.userId` determines their restaurant context in authenticated routes.

## Real-Time Architecture
To be determined in later phases. The backend might use WebSockets/Socket.IO, but auth needs to be built first.

## Completed Work
- Project audited.
- Backend auth mechanisms mapped.
- Kitchen App auth implementation analyzed.
- Created `lib/api/axios.ts` with Axios singleton matching `main-kitchen-app`.
- Implemented `useAuthStore` using Zustand to manage tokens and user state, identical to mobile app.
- Built multi-step `/register` flow (`RegisterForm`).
- Built real `/login` logic connecting to the API (`LoginForm`).
- Built `/forgot-password` flow (`ForgotPasswordForm`) connecting to OTP routes.
- Added protected route layout for `/dashboard`.
- Implemented logout functionality.
- Updated Navigation bar to switch between Login/Register and Dashboard buttons seamlessly.

## Current Work
Agent 2 (Authentication) has completed the primary authentication setup. Next up is UI/UX polishing or Backend Integration tests.

## Remaining Work
- Build the Dashboard UI for authenticated users.
- Real-time order management architecture.
- Fetch Menu, Orders, etc.

## Decisions Made
- Use Axios for API calls. Create a singleton API client at `lib/api/axios.ts` to mirror the mobile app's `lib/api.ts`.
- Store the JWT token securely, likely in cookies or localStorage, and integrate a Zustand store or React Context for auth state to match the mobile app's behavior.

## Files Changed
- `checkpoints.md` created.

## Environment Variables
Will use `NEXT_PUBLIC_API_URL=https://api.chatorijeeb.com/api/v1` for frontend API requests.

## Testing Status
- N/A (Just starting implementation)

## Next Steps
- **Agent 2 (Authentication):** Implement real Login, Register, Forgot Password, Reset Password, Logout, and Session Handling (Route protection).
- Create `lib/api/axios.ts` and `lib/stores/useAuthStore.ts`.
