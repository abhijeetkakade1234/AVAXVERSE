## 2024-05-18 - Wagmi hook re-renders inside list components
**Learning:** Components mapping over lists and making separate `useReadContract` calls for each item can cause massive performance bottlenecks (e.g. up to 100 expensive re-renders) on every keystroke when parent state (like search inputs or filter toggles) changes.
**Action:** Always wrap card components that contain `useReadContract` hooks within `React.memo()` if they are rendered inside a list where the parent maintains frequently-updating local state.
## 2024-05-18 - Stable callback references and React.memo
**Learning:** Wrapping a component in `React.memo()` is ineffective if any prop passed to it (such as a callback function) is recreated on every render. Inline functions like `onSelect={() => { onSelect(addr); setOpen(false) }}` break memoization, causing expensive re-renders (especially when the component contains `useReadContract` hooks).
**Action:** Always use `useCallback` in the parent component to provide stable function references to memoized list item components, ensuring that performance optimizations actually take effect.
