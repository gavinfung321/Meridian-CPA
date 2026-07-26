# Premium HK CPA Website Optimization Plan

Implement the approved strategy and visual redesign for Meridian CPA & Advisory using a high-end editorial look inspired by the "Jones & Brown Legal" design.

## Proposed Changes

### Top Navigation & Localization
- [TopNavigationSection.tsx](file:///c:/Users/gavin/Coding/figma-bolt-Meridian-CPA/src/screens/Desktop/sections/TopNavigationSection/TopNavigationSection.tsx)
  - Add language state (English vs. Traditional Chinese).
  - Update logo design or alignment if needed.
  - Implement language switcher (EN / 繁).
  - Update menu items to change based on active language.

### Hero Section
- [LegalFirmHeroSection.tsx](file:///c:/Users/gavin/Coding/figma-bolt-Meridian-CPA/src/screens/Desktop/sections/LegalFirmHeroSection/LegalFirmHeroSection.tsx)
  - Update background layout, typography sizes, and text content (EN/TC translations).
  - Use high-quality visual styling with dark green and white typography.

### Main Content Section
- [LegalServicesContentSection.tsx](file:///c:/Users/gavin/Coding/figma-bolt-Meridian-CPA/src/screens/Desktop/sections/LegalServicesContentSection/LegalServicesContentSection.tsx)
  - Replace law firm mock data with CPA & Accounting services (Compliance, Growth, Corporate Services).
  - Implement language-based text rendering.
  - Create the layout inspired by the reference design:
    - Cream background for Welcome/Introduction.
    - Full-width modern banner image.
    - Deep green block for "What We Offer" with large typography lists.
    - Testimonial slider / carousel with local business feedback.
    - Bottom panoramic image placement.

### Footer
- [LegalFirmFooterSection.tsx](file:///c:/Users/gavin/Coding/figma-bolt-Meridian-CPA/src/screens/Desktop/sections/LegalFirmFooterSection/LegalFirmFooterSection.tsx)
  - Replace law firm details with HK-specific compliance signals (HKICPA, AFRC, TCSP registration, local addresses, no zip code).
  - Handle language translation (EN / TC).

### Global Style & Theme Configurations
- [tailwind.css](file:///c:/Users/gavin/Coding/figma-bolt-Meridian-CPA/tailwind.css)
  - Add specific color palettes (forest green `#0F2A1D`, warm cream `#F9F9F6`, etc.).

## Verification Plan
- Build and run the React web application locally to verify the layout, translation functionality, responsiveness, and aesthetic appeal.
