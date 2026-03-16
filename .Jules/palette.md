## 2026-03-16 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons (like the ArrowRight icon in ManageMissions) lack context for screen reader users if they don't have explicit text. The `title` attribute provides a tooltip on hover, but an `aria-label` ensures explicit vocalization for assistive technologies.
**Action:** Always include `aria-label` on icon-only interactive elements, even if a `title` tooltip exists, to guarantee robust accessibility.
