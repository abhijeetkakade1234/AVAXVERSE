## 2024-05-24 - Layout Thrashing from Raw Scroll Listeners
**Learning:** Raw scroll event listeners executing DOM mutations (`style.setProperty`) block the main thread and cause layout thrashing, severely degrading scroll performance in React applications.
**Action:** Always throttle scroll event handlers using `requestAnimationFrame` and add the `{ passive: true }` option to the event listener so the browser doesn't wait for the JS execution to paint the scroll.
