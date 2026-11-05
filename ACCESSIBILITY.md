# Accessibility

## Conformance Target

WCAG 2.2 Level AA.

## Requirements

- Sufficient color contrast (minimum 4.5:1 for normal text, 3:1 for large text and non-text UI).
- Keyboard-navigable interactive elements with a visible focus indicator.
- Semantic landmarks, headings, lists, tables and form labels.
- ARIA labels and live regions for dynamic content (verification, assessment and copy status).
- Risk and status never conveyed by color alone; text and icons accompany every tone.
- Responsive layout that reflows without loss of content at 320 CSS pixels and at 200% zoom.
- Readable typography with scalable text and system font fallbacks.
- Clear error messages with a recovery action appropriate to the step.
- Form fields with associated labels, hints and `aria-describedby` error text.
- Decorative SVG marked `aria-hidden`; the brand mark has an accessible name.
- Reduced-motion support for transitions and animations.

## Implemented in the Obsidian Grid frontend

- Skip link to `#main-content`, a banner, one `main` landmark, and a contentinfo footer.
- Focus-visible outlines on buttons, links, inputs, checkboxes and the inline confirmation control.
- Step indicator exposed as an ordered list named “Assessment progress”; the current step uses `aria-current="step"`.
- Errors use an alert region with a step-specific title and a retry action. Verification errors remain on the challenge screen so the DNS record is not lost.
- The copy buttons announce “Copied” in a polite live region.
- Verification and assessment progress use text status alongside an indeterminate progress bar; no fabricated per-source progress is announced.
- Rate-limit errors announce the remaining time and disable the retry button until the countdown ends.
- Every badge, status dot and risk card includes a text label, not color alone.
- Tables have header cells with `scope="col"` and a horizontally scrollable container; the layout does not rely on hover.
- The report includes a point-in-time callout, explicit limitations, and empty versus source-unavailable states.
- `prefers-reduced-motion: reduce` removes smooth scrolling and transition durations.
- Print styles hide navigation and app chrome, use black-on-white output, and keep evidence cards from breaking across pages.

## Testing

- Automated component and flow tests assert labels, roles, disabled states, keyboard-reachable controls, live-region text, context-aware errors and untrusted-value rendering (`npx vitest run`).
- Manual review covered keyboard focus order, zoom/reflow at a 390 px viewport, the challenge and report screens, and the print stylesheet.
- A formal screen-reader audit and an automated axe pass have **not** been completed and remain release gates.

## Known limitations

- The step indicator shows numbers only at narrow widths; the current step is also stated in the page eyebrow and heading.
- The report data table scrolls horizontally on small screens; the page itself must not scroll horizontally.
- Print output depends on the browser's print dialog and page size. Review the preview before saving a PDF.
