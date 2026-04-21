# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install deps + prisma generate + db migrate
npm run dev         # Dev server with Turbopack (http://localhost:3000)
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Vitest unit tests
npm run db:reset    # Reset SQLite database
```

Run a single test file: `npx vitest run src/path/to/file.test.ts`

Requires `ANTHROPIC_API_KEY` in `.env` for real Claude responses; omit it and the mock provider kicks in automatically (generates a static demo component).

## Architecture

**UIGen** is a Next.js 15 (App Router) app that lets users describe React components in natural language and see them rendered live. The key insight is that all generated code lives in an **in-memory virtual filesystem** — nothing is written to disk.

### Request flow

```
User chat input
  → useChat() [Vercel AI SDK]
    → POST /api/chat/route.ts
      → Claude (claude-haiku-4-5 or mock) with two tools:
          str_replace_editor — create/edit file contents
          file_manager       — rename/delete files
        → VirtualFileSystem (in-memory Map)
          → persisted to SQLite via Prisma (authenticated users only)
```

### Key abstractions

**VirtualFileSystem** (`/src/lib/file-system.ts`) — The core of the app. An in-memory Map-based file tree that supports CRUD + serialize/deserialize. The AI operates on this exclusively; the iframe preview reads from it.

**Tool execution** happens in `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`). When the AI stream returns tool calls, this context intercepts them, runs them against VirtualFileSystem, and triggers re-renders.

**ChatContext** (`/src/lib/contexts/chat-context.tsx`) — Owns the `useChat()` hook and message state. Coordinates with FileSystemContext via shared file system instance.

**PreviewFrame** (`/src/components/preview/`) — An iframe that watches VirtualFileSystem for changes, detects the entry point (`/App.jsx`, `/App.tsx`, or `/index.jsx`), transforms JSX via Babel standalone, resolves imports through an esm.sh import map, and re-renders live.

**Provider** (`/src/lib/provider.ts`) — Returns either the Anthropic language model or the mock provider. All AI calls go through this single point.

**System prompt** (`/src/lib/prompts/generation.tsx`) — Defines how Claude generates components (tool usage instructions, file conventions, etc.). Edit here to change generation behavior.

### Auth & persistence

- JWT in httpOnly cookies (7-day), managed via `jose` in `/src/lib/auth.ts`
- Server Actions in `/src/actions/` handle sign-up, sign-in, sign-out, project CRUD
- Middleware (`/src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes
- Anonymous users: project state lives in localStorage only (`/src/lib/anon-work-tracker.ts`)
- Authenticated users: messages (JSON) + VirtualFileSystem snapshot (JSON) stored in SQLite `Project` table

### Database

Prisma with SQLite. Two models: `User` and `Project`. Schema at `/prisma/schema.prisma`. After changing the schema run `npx prisma migrate dev`.

### AI tool definitions

Zod schemas for the two Claude tools live in `/src/lib/tools/`. `str_replace_editor` supports `create`, `str_replace`, `insert`, and `view` operations. These schemas are passed directly to the AI SDK and must match what the system prompt instructs Claude to use.
