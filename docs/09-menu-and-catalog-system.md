# Menu and Catalog System

## Current State
- **Items:** Belongs to a restaurant.
- **Features:** `isVeg`, `isAvailable`, `showInMenu`.
- **Customization:** `variants` (name, price), `addOns` (name, price, image).
- **Tags:** `isJain`, `isSpicy`, `isBestseller`, `isRecommended`.

## Findings
Well-structured for typical food delivery variants.

## Recommended Architecture
Keep pricing calculations strictly server-side based on these models.
