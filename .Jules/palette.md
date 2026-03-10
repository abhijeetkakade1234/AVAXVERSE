## 2024-05-24 - Accessible Filter Groups
**Learning:** Custom UI tab/filter groups without native radio buttons often lack screen reader feedback about which option is currently active.
**Action:** Always wrap custom filter buttons in a `role="group"` container with a descriptive `aria-label`, and use `aria-pressed="true"` on the active button to announce the state correctly to screen readers.
