module.exports = {
  // A function is used so lint-staged doesn't pass the list of files to Next.js
  // which notoriously breaks file resolution on Windows monorepo paths.
  // Instead, if any file changes, it runs the Next.js lint script over the whole app.
  "apps/web/**/*.{ts,tsx,js,jsx}": () => "bun --cwd apps/web run lint"
}
