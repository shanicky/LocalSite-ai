# Changelog

## [0.5.1] - 2026-01-05

### Fixes
- **Fixed Ollama provider crash** - Replaced `ollama-ai-provider` with `ai-sdk-ollama@^2.2.0` for AI SDK v5 compatibility

## [0.5.0] - 2025-12-22

### Major Changes

#### Vercel AI SDK Migration
- **Migrated from `openai` SDK to Vercel AI SDK** (`ai` package)
- Using official SDK packages for all providers:
  - `@ai-sdk/deepseek`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/mistral`, `@ai-sdk/cerebras`
  - `@openrouter/ai-sdk-provider`, `ollama-ai-provider`, `@ai-sdk/openai-compatible`
- Unified streaming via `streamText()` and `fullStream` API

#### Universal Reasoning Support
- **Native reasoning models** now fully supported (e.g., `deepseek-reasoner`, `o1`)
  - SDK automatically extracts `reasoning_content` from API responses
  - Reasoning streamed as `reasoning-delta` chunks
- **Tag-based reasoning fallback** for models using `<think>` tags
  - Implemented via `extractReasoningMiddleware` with `wrapLanguageModel()`
- Backend now sends NDJSON stream with separate `text` and `reasoning` types
- Frontend parses unified stream format for both reasoning methods

### Refactor
- `lib/providers/provider.ts`: Complete rewrite using official SDK providers
- `app/api/generate-code/route.ts`: Custom `fullStream` handler for text + reasoning
- `hooks/use-code-generation.ts`: NDJSON parsing replaces manual `<think>` tag extraction
- OpenRouter `getModels()` now fetches all available models from API (400+)

### New Features
- **OpenRouter as dedicated provider** with own API key (`OPENROUTER_API_KEY`)
- **4 new official providers**: Anthropic, Google AI (Gemini), Mistral, Cerebras
- **`DISABLED_PROVIDERS` env var** to disable providers via comma-separated list

### Notes
- Provider packages still return `LanguageModelV1` (v4 API) while main SDK is v5
- Type casts can be removed when provider packages release v5-compatible updates



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
