# Chatori Jeeb Restaurant Partner App — Login Screen UI Prompt

## App Context
**App Name:** Chatori Jeeb Restaurant (Partner App)
**Purpose:** Restaurant owners and managers login to manage orders, menu, earnings.
**Platform:** Mobile-first web (works on desktop too)
**File Type:** Standalone HTML with inline CSS and JS (no frameworks, no CDN dependencies except Font Awesome and Google Fonts)

---

## Design System

| Token | Value |
|---|---|
| Primary Red | `#D71920` |
| Bright Red | `#FF3B30` |
| Dark Red | `#A50E14` |
| White | `#FFFFFF` |
| Light BG | `#F5F5F7` |
| Border | `#E8E8EC` |
| Charcoal Text | `#1A1A1A` |
| Muted Text | `#7A7A8A` |
| Success Green | `#25B45B` |
| Font | `Inter` (Google Fonts) |
| Icons | Font Awesome 6 CDN |

---

## Screen Layout

### 1. Top Hero Section (White Background)
- Full-width white hero area taking ~38% of screen height
- Large centered app icon: rounded square with red gradient background, white utensils icon
- App name: **"Chatori Jeeb"** in bold dark text
- Subtitle tag: **"Restaurant Partner"** in a red pill/badge
- Subtle decorative elements: soft red abstract shapes or rings in the background (CSS only, no images)
- Smooth floating animation on the logo icon

### 2. Floating Login Card (White, overlapping hero)
- White card with rounded top corners (32px border-radius)
- Slight drop shadow
- Overlaps the hero section by about 20px (negative margin-top)
- Contains all login form fields

### 3. Login Method Tabs
- Two tabs inside a pill-shaped segmented control:
  - **"Password Login"** (default active)
  - **"OTP Login"**
- Active tab: white background, red text, subtle shadow
- Inactive tab: transparent, muted grey text
- Smooth slide animation when switching tabs

### 4. Password Login Form
Fields in order:
1. **Mobile / Email field**
   - Label: "Mobile Number or Email"
   - Icon: person icon (left inside input)
   - Placeholder: "Enter mobile or email"
   - Rounded input with light grey background
   - Red border glow on focus

2. **Password field**
   - Label: "Password"
   - Icon: lock icon (left inside input)
   - Placeholder: "Enter your password"
   - Show/Hide password toggle button (eye icon, right side)
   - Toggle between `type="password"` and `type="text"`

3. **Row: Remember me + Forgot Password**
   - Left: Custom checkbox "Remember me" (red when checked)
   - Right: "Forgot Password?" link in red

4. **Login Button**
   - Full width
   - Red gradient background (`#D71920` → `#FF3B30`)
   - White text, bold
   - Icon: arrow-right or login icon
   - Smooth loading spinner animation on click (replace text with spinner for 1.5s)
   - Subtle hover: lift + deepen shadow

### 5. OTP Login Form (alternate tab)
Fields in order:
1. **Mobile Number field**
   - Country code prefix "+91" with a divider
   - 10-digit number input
   - Numeric keyboard on mobile

2. **Send OTP Button**
   - Outline style (red border, red text)
   - Full width
   - On click: shows OTP input field below with animation

3. **OTP Input (6 boxes)**
   - 6 individual square input boxes in a row
   - Each box: 46×52px, rounded corners
   - Auto-focus next box on input
   - Auto-focus previous box on backspace
   - Red border + subtle glow when focused
   - Smooth fade-in animation when revealed

4. **Resend OTP countdown**
   - Text: "Resend OTP in 30s"
   - Countdown timer in red
   - After 0: becomes tappable "Resend OTP" link

5. **Verify & Login Button**
   - Same style as the password login button

### 6. Divider + Register Link
- A thin horizontal divider with "or" text in center
- Text: "New restaurant? Register here"
- "Register here" in red, bold, tappable

### 7. Bottom Trust Badges Row
- 3 small trust indicators horizontally:
  - 🔒 SSL Secured
  - ⭐ 50,000+ Partners
  - 🏆 Trusted Since 2018

---

## Micro-Animations & Interactions

| Element | Behavior |
|---|---|
| Logo icon | Gentle floating (up-down) loop |
| Tab switch | Smooth 250ms slide transition |
| Input focus | Border turns red, soft red glow, label animates up |
| Login button | Hover lifts 2px, shadow deepens |
| Login button click | Spinner for 1.5s then success toast |
| OTP field reveal | FadeIn + slideUp from below |
| OTP box focus | Scale 1.05, red border glow |
| Password toggle | Icon swaps with a tiny flip animation |
| Error state | Input border turns bright red, shake animation, error text fades in below |
| Toast notification | Slides in from top, auto-dismiss after 3s |

---

## Form Validation Rules

| Field | Rule |
|---|---|
| Mobile / Email | Required. Must be 10-digit number OR valid email format |
| Password | Required. Minimum 6 characters |
| OTP Mobile | Required. Must be 10 digits starting with 6–9 |
| OTP Code | Required. All 6 boxes must be filled |

On submit with errors:
- Shake the submit button once
- Highlight each invalid field with red border
- Show inline error message below each field
- Show a top toast: "Please fix the errors below."

---

## Error Messages

| Scenario | Toast / Inline |
|---|---|
| Empty mobile/email | "Please enter your mobile number or email." |
| Invalid email format | "Enter a valid email address." |
| Invalid mobile | "Enter a valid 10-digit mobile number." |
| Short password | "Password must be at least 6 characters." |
| Incomplete OTP | "Please enter the complete 6-digit OTP." |
| Wrong credentials (simulated) | Toast: "Incorrect credentials. Please try again." (error, red) |
| OTP sent success | Toast: "OTP sent to +91 XXXXXX" (success, dark) |
| Login success | Toast: "Welcome back! Loading dashboard…" (success) → redirect |

---

## JavaScript Functionality

1. **Tab switching** — toggle between Password and OTP forms
2. **Password show/hide** — toggle input type + icon
3. **Remember me** — custom checkbox UI
4. **Form validation** — inline error messages + field highlights
5. **Login simulation** — 1.5s spinner → success toast → (no redirect needed, just show dashboard state)
6. **OTP flow:**
   - Send OTP → reveal OTP boxes with animation
   - 30s countdown → show resend link
   - Auto-focus next box on input
   - Auto-focus previous box on backspace
7. **Shake animation** — on failed submit
8. **Toast system** — stackable top toasts with auto-dismiss

---

## Responsive Behavior

- **Mobile (<600px):** Full-screen card, single column layout
- **Desktop (≥600px):** Centered phone-frame (390×844), grey outer background, rounded card with shadow

---

## Files to Create

- `login-screen.html` — Complete standalone self-contained file
  - All CSS in `<style>` tags
  - All JS in `<script>` tags
  - Font Awesome 6 from CDN
  - Google Fonts (Inter) from CDN
  - No other external dependencies

---

## Important Notes

- Do NOT use React, Vue, Bootstrap, Tailwind, or any JS frameworks
- Do NOT use any backend, APIs, or real authentication
- Use dummy/simulated login — any credentials with valid format = success
- The design must feel **premium and modern**, not like a generic template
- White is the dominant background color
- Red is used only for key accents: buttons, active states, icons, focus rings
- Maintain consistent 8px spacing grid throughout
