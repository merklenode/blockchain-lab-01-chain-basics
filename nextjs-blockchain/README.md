# Next.js Blockchain Visualizer

Interactive blockchain lab built with a native TypeScript core. No WebAssembly or external crypto libraries required.

## Structure

```text
app/
  layout.tsx
  page.tsx
src/
  blockchain/
    block.ts
    blockchain.ts
    hash.ts
    index.ts
    types.ts
  components/
    BlockchainVisualizer.tsx
e2e/
  main-flow.spec.ts
```

## Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test          # Vitest unit tests
pnpm test:watch    # Vitest in watch mode
pnpm test:e2e      # Playwright end-to-end tests (requires dev server on :3000)
```

## Lab controls

- **Mine Block** — add a transaction to the chain
- **Validate Chain** — explicitly verify integrity; shows exact failure location
- **Tamper** (per block) — corrupt a block's data, leaving the hash stale
- **Repair chain from block #N** — recalculate hashes in cascade from the broken point
- **Reset Chain** — return to genesis only
- **Speed** — control block entrance animation speed (Instant / Normal / Slow)
- Click any block to open the inspector panel with full hash details and stable ID
