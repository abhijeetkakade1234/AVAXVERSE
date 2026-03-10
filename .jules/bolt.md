## 2024-05-24 - Isolated setInterval state to prevent full-page re-renders
**Learning:** In React, using `setInterval` to update a state variable in the main body of a large, complex component (like `JobDetailPage`) causes the entire component and all its children to re-render on every tick. This is highly inefficient.
**Action:** Always isolate frequently updating state (like a real-time countdown clock) into its own small, dedicated component so only that specific part of the UI re-renders.
