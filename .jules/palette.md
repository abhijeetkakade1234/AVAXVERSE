## 2024-05-19 - Semantic HTML for Custom Pagination
**Learning:** For custom pagination components, a semantic `nav` element and proper `aria-current="page"` attributes are crucial to properly inform screen readers of the active context, replacing visually obvious but semantically empty `div` containers.
**Action:** Always wrap pagination controls in a `<nav aria-label="Pagination">` and dynamically set `aria-current="page"` on the currently active item, plus supply `aria-label` for icon-only forward/back buttons.
