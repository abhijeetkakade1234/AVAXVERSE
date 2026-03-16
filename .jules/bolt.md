## 2024-05-18 - Wagmi hook re-renders inside list components
**Learning:** Components mapping over lists and making separate `useReadContract` calls for each item can cause massive performance bottlenecks (e.g. up to 100 expensive re-renders) on every keystroke when parent state (like search inputs or filter toggles) changes.
**Action:** Always wrap card components that contain `useReadContract` hooks within `React.memo()` if they are rendered inside a list where the parent maintains frequently-updating local state.
## 2025-03-16 - Inline callbacks break React.memo() inside arrays
**Learning:** Using inline arrow functions in `.map()` blocks (like `onSelect={() => handleSelect(id)}`) directly defeats `React.memo()` optimizations because a new function reference is created on every render, causing the child to re-render.
**Action:** Always extract the callback using `useCallback()` and pass the stable reference. The child component can then call the stable function with its specific argument `onClick={() => onSelect(id)}`.

## 2025-03-16 - Inline callbacks break React.memo() inside arrays
**Learning:** Using inline arrow functions in `.map()` blocks (like `onSelect={() => handleSelect(id)}`) directly defeats `React.memo()` optimizations because a new function reference is created on every render, causing the child to re-render.
**Action:** Always extract the callback using `useCallback()` and pass the stable reference. The child component can then call the stable function with its specific argument `onClick={() => onSelect(id)}`.
