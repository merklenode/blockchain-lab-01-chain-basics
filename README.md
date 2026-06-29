# Simple Blockchain Prototype

This project demonstrates how blocks are linked together and how SHA-256 hashing protects ledger integrity.

The web app now uses a native TypeScript blockchain core, so it can run in Next.js without compiling the C++ code to WebAssembly. The original C++ implementation remains in `/src` as a native/reference implementation.

## Features

- **TypeScript core for the web app**: Reusable block, blockchain, hashing, and validation modules under `nextjs-blockchain/src/blockchain`.
- **Next.js UI**: Interactive ledger visualizer under `nextjs-blockchain/app`.
- **C++ reference implementation**: Native CLI implementation under `/src`.

## Project Structure

```text
.
├── src/                         # C++ native/reference implementation
├── nextjs-blockchain/
│   ├── app/                     # Next.js route files
│   └── src/
│       ├── blockchain/          # TypeScript blockchain domain logic
│       └── components/          # Reusable React components
├── CMakeLists.txt               # Native C++ build configuration
└── README.md
```

---

## 1. Native Build (CLI)
To run the blockchain as a local CLI application:

```bash
mkdir build && cd build
cmake ..
make
./SimpleBlockchain
```

---

## 2. Next.js Build (Web)

```bash
cd nextjs-blockchain
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. **Genesis Block**: The chain starts with an initial block (Index 0).
2. **Mining**: When you "Mine Block", the data is added through the TypeScript blockchain core.
3. **Hashing**: Each block's hash is calculated using `Index + Timestamp + Data + PreviousHash`.
4. **Validation**: The TypeScript `validate()` method iterates through the chain to ensure no data has been tampered with.
