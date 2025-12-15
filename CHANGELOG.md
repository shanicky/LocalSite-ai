# Changelog

## [0.4.0] - 2025-12-15

### Refactor
- Centralized generation logic into custom `useCodeGeneration` hook.
- Modularized `GenerationView` into reusable components for cleaner architecture.

### Security
- Updated Next.js to patch critical vulnerabilities (including React2Shell).

### Fixes
- Improved Ollama stream parsing (added buffering) to prevent crashes on split JSON chunks.

### Chore
- Centralized system prompt management in the backend.
- Removed unused Shadcn UI components and dependencies.
