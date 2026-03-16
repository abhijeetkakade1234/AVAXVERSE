## 2024-05-18 - Wagmi hook re-renders inside list components
**Learning:** Components mapping over lists and making separate `useReadContract` calls for each item can cause massive performance bottlenecks (e.g. up to 100 expensive re-renders) on every keystroke when parent state (like search inputs or filter toggles) changes.
**Action:** Always wrap card components that contain `useReadContract` hooks within `React.memo()` if they are rendered inside a list where the parent maintains frequently-updating local state.
## 2024-05-18 - Stable callback references and React.memo
**Learning:** Wrapping a component in `React.memo()` is ineffective if any prop passed to it (such as a callback function) is recreated on every render. Inline functions like `onSelect={() => { onSelect(addr); setOpen(false) }}` break memoization, causing expensive re-renders (especially when the component contains `useReadContract` hooks).
**Action:** Always use `useCallback` in the parent component to provide stable function references to memoized list item components, ensuring that performance optimizations actually take effect.

## 2024-05-18 - Broken React.memo optimizations with inline callbacks
**Learning:** When using `React.memo` on list item components (like `ApplicantRow`), passing an inline anonymous callback function (e.g., `onClick={() => { onSelect(addr); setOpen(false) }}`) as a prop from the parent (`.map` loop) creates a new function reference on every single render. This forces the memoized child component to always re-render, completely breaking the `React.memo` optimization and causing massive performance issues (especially when the child uses expensive hooks like `useReadContract`).
**Action:** Always wrap callback props passed to list items in a `useCallback` hook in the parent component to ensure a stable reference is maintained across renders. Modify the child component to call the function with its own local data (e.g., its ID or `addr`) instead of capturing it in an inline closure.
## 2025-03-16 - Inline callbacks break React.memo() inside arrays
**Learning:** Using inline arrow functions in `.map()` blocks (like `onSelect={() => handleSelect(id)}`) directly defeats `React.memo()` optimizations because a new function reference is created on every render, causing the child to re-render.
**Action:** Always extract the callback using `useCallback()` and pass the stable reference. The child component can then call the stable function with its specific argument `onClick={() => onSelect(id)}`.

## 2025-03-16 - Inline callbacks break React.memo() inside arrays
**Learning:** Using inline arrow functions in `.map()` blocks (like `onSelect={() => handleSelect(id)}`) directly defeats `React.memo()` optimizations because a new function reference is created on every render, causing the child to re-render.
**Action:** Always extract the callback using `useCallback()` and pass the stable reference. The child component can then call the stable function with its specific argument `onClick={() => onSelect(id)}`.
## 2024-05-18 - Inline functions break React.memo()
**Learning:** Passing inline anonymous functions like `onSelect={() => ...}` to child components inside a list (`.map()`) creates a new reference on every parent render. This defeats `React.memo()`, causing all children to re-render unnecessarily.
**Action:** Always extract callbacks to the parent component and wrap them in `useCallback()` (or similar stable references) before passing them as props to memoized child components in a list.
