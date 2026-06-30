# Tech Stack

## Recommended Stack

- Next.js with App Router for the web app.
- TypeScript for domain logic and UI safety.
- React for interactive state-driven UI.
- Tailwind CSS for fast, consistent styling.
- Framer Motion for educational animations if CSS alone becomes hard to coordinate.
- Web Crypto API or a small SHA-256 package for hashing.
- Vitest for blockchain logic tests.
- Playwright for basic UI interaction tests.

## Architecture

Separate the project into two layers:

The lab is self-contained and does not need a backend for the first implementation. Treat data fetching, database storage, authentication, Server Actions, and API routes as out of scope unless a later lab explicitly adds them.

## Domain Layer

Pure TypeScript functions/classes:

- `createGenesisBlock()`
- `createBlock(data, previousBlock)`
- `calculateHash(blockInput)`
- `validateBlock(block, previousBlock)`
- `validateChain(chain)`
- `repairChain(chain, startIndex)`

This layer should not depend on React.

## UI Layer

React components:

- `BlockchainLabApp`
- `ControlPanel`
- `ChainCanvas`
- `BlockCard`
- `HashLink`
- `BlockInspector`
- `ActionTimeline`

The UI layer uses the domain layer and turns state changes into visual feedback.

## Next.js Client Boundary

- Keep `app/layout.tsx` and route shell code as Server Components where possible.
- Put `'use client'` only on the smallest interactive lab component subtree.
- Keep pure blockchain functions outside React components so they can be tested without rendering.
- If Web Crypto is used for SHA-256, isolate the async hashing boundary so UI components can show validating/repairing states instead of blocking or computing during render.

## State Management Guidance

Local React state is enough for the first implementation. Store the chain and selected block id. Derive validation results from the chain rather than storing parallel validity flags.

Use stable block ids as React keys. Do not use the array index as a React key for block cards.
