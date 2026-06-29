# Next.js Blockchain Visualizer

This app renders an interactive blockchain ledger using a native TypeScript core. It does not need the C++ WebAssembly build path to run.

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
```

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```
