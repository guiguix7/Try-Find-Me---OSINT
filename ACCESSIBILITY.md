# Accessibility

## Conformance Target

WCAG 2.1 Level AA.

## Requirements

- Sufficient color contrast (minimum 4.5:1 for normal text, 3:1 for large text).
- Keyboard navigable all interactive elements.
- Focus indicators visible.
- ARIA labels and live regions for dynamic content (`aria-live` for loading/assessment status).
- Risk never conveyed by color alone; always accompanied by text or icons.
- Responsive design for mobile, tablet, and desktop.
- Readable typography with scalable text.
- Clear error messages with suggestions for recovery.
- Form fields with associated labels.
- Alternative text for images.

## Testing

- Automated accessibility checks in frontend test suite.
- Manual keyboard navigation review.
- Screen reader compatibility review.
