---
name: Clinical Precision
colors:
  surface: '#0d141d'
  surface-dim: '#0d141d'
  surface-bright: '#333a44'
  surface-container-lowest: '#080f17'
  surface-container-low: '#151c25'
  surface-container: '#192029'
  surface-container-high: '#232a34'
  surface-container-highest: '#2e353f'
  on-surface: '#dce3f0'
  on-surface-variant: '#c2c6d5'
  inverse-surface: '#dce3f0'
  inverse-on-surface: '#2a313b'
  outline: '#8c909e'
  outline-variant: '#424753'
  surface-tint: '#acc7ff'
  primary: '#acc7ff'
  on-primary: '#002f68'
  primary-container: '#508ff8'
  on-primary-container: '#00285b'
  inverse-primary: '#005bbf'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004492'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0d141d'
  on-background: '#dce3f0'
  surface-variant: '#2e353f'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-small:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  max_width: 1200px
  columns: '12'
  gutter: 24px
  margin_mobile: 16px
  margin_desktop: 40px
  base_unit: 4px
---

## Brand & Style
The design system is engineered for "clinical precision," targeting professionals who require high-performance tools for career optimization. The aesthetic draws heavily from high-end developer environments and productivity software, prioritizing clarity, technical density, and a premium "dark-mode-first" experience.

The visual narrative is built on a foundation of **Minimalism** and **Modern Corporate** styles, utilizing deep navy-blacks and sharp, high-contrast typography to evoke a sense of authority and reliability. This design system avoids decorative fluff, favoring functional data visualization and structural integrity. Every element is intentional, designed to make the complex process of resume optimization feel like a scientific operation.

## Colors
This design system utilizes a high-contrast, dark-centric palette. The background is a deep, immersive navy-black that serves as a canvas for "electric" functional accents. 

- **Primary Accent:** Used for primary actions, focus states, and key navigational highlights.
- **Secondary Accent:** Reserved for success states, high match scores, and the terminal point of progress gradients.
- **Surface Hierarchy:** Depth is communicated through subtle shifts in grey-navy tones rather than shadows. 
- **Borders:** Subtle 1px borders define the structure, with a secondary "accent" border used for hover states and active inputs to provide tactile feedback without visual clutter.

## Typography
The typography strategy employs a three-tier font system to balance personality, readability, and technical precision.

1.  **Plus Jakarta Sans:** Used for headlines and hero sections to provide a modern, geometric feel that softens the technical nature of the tool.
2.  **Inter:** The workhorse for all body copy and user input, chosen for its exceptional legibility and neutral character in dark interfaces.
3.  **JetBrains Mono:** Dedicated to "Clinical Data"—ATS scores, keyword lists, and technical metadata. Its monospaced nature reinforces the developer-tool aesthetic and ensures alignment in dense data grids.

Labels should always be set in `label-mono` with uppercase styling and increased tracking for a distinct, functional appearance.

## Layout & Spacing
The layout follows a strict 12-column fluid grid with a maximum container width of 1200px to ensure readability on ultra-wide monitors. 

**Spacing Rhythm:**
- A 4px base unit governs all padding and margins. 
- Use larger vertical rhythm (64px+) between sections to allow the dark UI to "breathe."
- Content cards and data modules should use consistent 24px internal padding.

**Responsiveness:**
- **Desktop:** 12 columns, 24px gutters, 40px side margins.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

## Elevation & Depth
This design system eschews traditional soft shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**. Depth is created by stacking surfaces of increasing brightness.

- **Level 0 (Background):** #0A0E1A (Base layer)
- **Level 1 (Cards/Sidebar):** #111827 with a 1px #1F2937 border.
- **Level 2 (Modals/Popovers):** #1C2333 with a 1px #374151 border.

**Interaction States:**
For primary actions, use a subtle "glow" effect instead of a shadow—a low-spread `0 0 12px` box-shadow using the primary color at 30% opacity on hover. This simulates a backlit hardware interface.

## Shapes
The shape language is precise and disciplined. Rounded corners are used to provide a modern touch, but they are kept tight to maintain a professional, slightly sharp appearance.

- **Cards:** 8px radius for main content containers.
- **Buttons:** 6px radius for a distinct, clickable feel.
- **Inputs:** 4px radius to emphasize functional rigidity.
- **Modals:** 16px radius for high-level overlays to distinguish them from the background grid.
- **Chips:** 4px radius (never fully pill-shaped) to maintain the "blocky" developer aesthetic.

## Components
Consistent component styling is critical to the "precision tool" feel.

- **Primary Buttons:** Solid #4F8EF7 background, 6px radius, uppercase JetBrains Mono labels. On hover: Increase brightness slightly and add the subtle blue glow.
- **Secondary Buttons:** Ghost style with #1F2937 border and #F9FAFB text.
- **Input Fields:** #111827 background, 4px radius, 1px #1F2937 border. Active state: 1px #4F8EF7 border with no outer glow.
- **Cards:** 8px radius, #111827 background, 1px #1F2937 border.
- **Signature Progress Bar:** The "Pulse Gradient." A linear gradient from #4F8EF7 to #10B981. The bar should feature a subtle "pulse" animation (opacity shift from 0.8 to 1.0) to indicate active processing.
- **Keyword Chips:** Small, 4px rounded boxes with #1C2333 background and #9CA3AF text. If "matched," change background to #10B981 (20% opacity) and text to #10B981.
- **Data Lists:** Use JetBrains Mono for all numeric values. Alternate row colors are not used; use subtle 1px horizontal dividers instead.