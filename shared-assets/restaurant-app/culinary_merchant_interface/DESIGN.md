---
name: Culinary Merchant Interface
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4f4632'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#827660'
  outline-variant: '#d4c5ab'
  surface-tint: '#785900'
  primary: '#785900'
  on-primary: '#ffffff'
  primary-container: '#ffc107'
  on-primary-container: '#6d5100'
  inverse-primary: '#fabd00'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#cacbcb'
  on-tertiary-container: '#545656'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9e'
  primary-fixed-dim: '#fabd00'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 24px
  margin-desktop: 64px
  gutter: 16px
  section-gap: 80px
---

## Brand & Style
The design system embodies a premium, high-performance SaaS aesthetic tailored for the modern hospitality industry. It bridges the gap between functional enterprise software and the vibrant, sensory world of culinary arts. 

The visual language is rooted in **Corporate Modern** principles—prioritizing clarity and efficiency—but is elevated by **Glassmorphism** and subtle **Tactile** cues. This creates an environment that feels both technologically advanced and welcoming. The experience should evoke confidence, precision, and appetite, using high-impact visuals and generous whitespace to allow merchant data and food imagery to take center stage.

## Colors
The palette is built on a foundation of "Pure White" and "Light Gray" to maintain a clean, clinical SaaS feel. "Secondary Soft Black" provides a sophisticated anchor for typography and primary navigation elements, ensuring high readability and a premium edge.

"Primary Yellow" is used strategically as a high-energy accent. It is not merely a color but a functional tool for calls-to-action, status indicators, and "glow" effects that simulate warmth and focus. Use gradients of the primary yellow only for interactive states or to highlight specific merchant success metrics.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian, and modern feel. The typographic hierarchy is "top-heavy," featuring bold, aggressive display sizes for marketing headlines to create impact, while shifting to a highly legible, medium-contrast scale for the merchant dashboard.

For marketing layouts, use `display-lg` with tight letter spacing. For functional UI, prioritize `body-md` for data entry and `label-lg` for category headers. Headlines should always be set in a heavier weight (700+) to contrast against the soft, rounded UI elements.

## Layout & Spacing
The layout follows a **Fluid Grid** model for the internal dashboard and a **Fixed Grid** for marketing and Play Store surfaces. 

- **Marketing Surfaces:** Use a centered container with a maximum width of 1280px. Headlines are positioned at the top of the visual hierarchy, followed by vertically stacked Android mobile mockups. 
- **Dashboard Surfaces:** Use a persistent left-hand sidebar (Soft Black) with a fluid content area.
- **Rhythm:** A strict 8px base unit governs all padding and margins. Large-scale marketing sections should utilize a 80px "section-gap" to ensure the "Premium" feel of the brand is maintained through generous whitespace.

## Elevation & Depth
Depth is created through a combination of **Ambient Shadows** and **Glassmorphism**. 

1.  **Level 0 (Base):** Light Gray (#F5F5F5) background.
2.  **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a subtle, diffused shadow (0px 4px 20px, 5% opacity Soft Black).
3.  **Level 2 (Overlays):** Glassmorphic panels with a 20px backdrop blur and 60% opacity White fill. These are used for floating navigation or modal headers.
4.  **Accent Depth:** Use a "Yellow Glow" (Box shadow: 0px 0px 15px, 30% opacity #FFC107) for active states or highlighted merchant alerts to draw immediate visual attention without breaking the clean aesthetic.

## Shapes
The shape language is defined by significant corner radii to evoke a friendly, modern SaaS feel. 

Primary containers and dashboard cards must use a **24px (1.5rem)** radius (`rounded-xl` in this system). Interactive elements like buttons and input fields use a **8px (0.5rem)** radius to maintain a professional, structured look within the softer containers. Avoid sharp corners entirely to maintain the approachable, premium brand character.

## Components
- **Buttons:** Primary buttons use a solid Soft Black background with White text for maximum contrast. Secondary buttons use a White background with a Soft Black border. Use the "Yellow Glow" as a hover state for primary actions.
- **Cards:** Defined by a 24px radius, Pure White fill, and a subtle ambient shadow. Cards are the primary vehicle for displaying Indian food imagery and merchant analytics.
- **Input Fields:** Minimalist style with a 1px Light Gray border and 8px radius. On focus, the border transitions to Primary Yellow with a soft glow.
- **Chips/Badges:** Small, pill-shaped elements with 10% opacity Primary Yellow backgrounds and Soft Black text, used for status indicators like "Order Ready" or "Payment Confirmed."
- **Dashboard Widgets:** These include "Quick Action" circles and "Revenue Trends" charts. Charts should use the Primary Yellow for data lines to keep the brand identity front and center.
- **Android Mockups:** For marketing materials, mockups should be framed in a realistic "Material" style device frame, using the Glassmorphic overlays to show UI elements interacting with high-resolution food photography.