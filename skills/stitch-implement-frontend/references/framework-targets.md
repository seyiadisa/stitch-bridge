# Framework Targets

Use the target framework's normal conventions:

- `Next.js`: App Router, server/client boundaries only where needed, preserve file-based routing
- `Nuxt`: file-based routes, composables, and Vue conventions
- `React + Vite`: explicit router setup when multiple screens need routes
- `Vue + Vite`: Vue single-file component conventions and router-based screens

Respect existing package-manager signals in the target app instead of switching package managers silently.
