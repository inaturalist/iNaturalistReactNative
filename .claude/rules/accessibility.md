---
paths:
  - "**/src/components/**"
---

# Accessibility

Hint and role wording: `agent-docs/conventions/component-conventions.md`. Label *presence* is
enforced by `eslint-plugin-react-native-a11y` and cannot reach `main`, so it is never a review
finding. What follows is the WCAG AA half ESLint cannot check.

- Text contrast is at least 4.5:1; 3:1 suffices for text ≥18pt or bold, and for the boundary
  of a UI component — border, icon, focus ring.
- Every touchable is at least 44×44pt. Where the visual is smaller, reach it with `hitSlop`
  rather than padding the layout.
- Focus and reading order follow visual order. Absolute positioning and reversed flex
  direction desync the two.
- Text survives a large dynamic-type setting: no fixed-height container around text, no
  `numberOfLines` that truncates a label at scale. `useFontScale` reports scale > 1.3;
  `maxFontSizeMultiplier` caps growth only where a layout genuinely cannot flex.
- Non-essential animation respects `AccessibilityInfo.isReduceMotionEnabled`.
- A state change the user did not initiate — a load finishing, an error appearing — is
  announced, with `accessibilityLiveRegion` or `AccessibilityInfo.announceForAccessibility`.
