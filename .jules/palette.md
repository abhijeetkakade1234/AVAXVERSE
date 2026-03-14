## 2024-05-19 - Semantic HTML for Custom Pagination
**Learning:** For custom pagination components, a semantic `nav` element and proper `aria-current="page"` attributes are crucial to properly inform screen readers of the active context, replacing visually obvious but semantically empty `div` containers.
**Action:** Always wrap pagination controls in a `<nav aria-label="Pagination">` and dynamically set `aria-current="page"` on the currently active item, plus supply `aria-label` for icon-only forward/back buttons.
## 2024-05-20 - Explicit Labeling for Form Accessibility
**Learning:** Implicit labeling (wrapping an input with a label) or visually positioning a label near an input without programmatic association is often insufficient for robust screen reader support. Explicitly linking `<label>` elements to their corresponding inputs using `htmlFor` and `id` ensures that assistive technologies can correctly identify and announce form fields, significantly improving form accessibility and usability.
**Action:** Always use the `htmlFor` attribute on `<label>` elements and a matching `id` attribute on form controls (`<input>`, `<textarea>`, `<select>`) to guarantee explicit, programmatic association.
## 2024-03-14 - Add aria-labels to icon-only buttons
**Learning:** Found multiple instances where close ("X") buttons for inputs or tags lacked context for screen reader users because they relied entirely on visual cues.
**Action:** When implementing an icon-only button, always pair it with an `aria-label` (e.g., `aria-label="Remove tag"` or `aria-label="Clear search"`) to ensure the intent is available to assistive technologies.
