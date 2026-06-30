# Core Concepts

## Block

A block is a record in the chain. In this lab, each block should contain:

- `index`: position in the chain.
- `timestamp`: creation time.
- `data`: user-entered message or transaction-like text.
- `previousHash`: hash of the block before it.
- `hash`: fingerprint generated from the block contents.

## Genesis Block

The genesis block is the first block. It has no real previous block, so its `previousHash` can be a fixed value such as `0`.

The UI should label this block clearly as `Genesis` so users understand it is the starting point.

## Hash

A hash is a deterministic fingerprint. The same input creates the same hash. Any small data change creates a different hash.

In this lab, a block hash must be calculated from this canonical input order:

```text
index + "|" + timestamp + "|" + data + "|" + previousHash
```

Use SHA-256 and display hashes as lowercase hexadecimal strings. If the implementation uses the browser Web Crypto API, hashing is asynchronous and must not be performed directly during React render. A small synchronous SHA-256 package is acceptable if it keeps the domain logic simpler and deterministic.

The same canonical input must always produce the same hash across the app, tests, and documentation examples.

## Previous Hash Link

Every block after the genesis block stores the previous block's hash. This creates the chain.

If block 2 stores block 1's hash, then changing block 1 makes block 2's stored `previousHash` outdated.

## Chain Validation

Validation checks two rules for every block:

1. The block's current hash still matches its contents.
2. The block's `previousHash` matches the actual hash of the previous block.

If either rule fails, the chain is invalid.

Validation status is derived from block data and links. Do not store separate `isValid` flags that can drift away from the chain contents.

## State and Data Model

Use one canonical block shape in the docs, domain layer, UI, and tests:

```ts
type Block = {
  id: string;
  index: number;
  timestamp: string;
  data: string;
  previousHash: string;
  hash: string;
};
```

Rules:

- `id` is a stable UI key and must not be the array index.
- `index` is the learner-facing position in the chain.
- `hash` is the stored hash at the time the block was created or repaired.
- The block's current calculated hash is derived from `index`, `timestamp`, `data`, and `previousHash`.
- A block is tampered when its stored `hash` no longer matches the current calculated hash.
- A link is broken when a block's stored `previousHash` does not match the previous block's current hash.

Recommended derived status values:

```ts
type BlockStatus = "valid" | "tampered" | "broken-link" | "genesis";
type ChainStatus = "valid" | "invalid" | "validating" | "repairing";
```

## Tamper and Repair Semantics

Tampering means editing the `data` field of an existing non-latest block without automatically rewriting later blocks. The edited block's current calculated hash changes, and the next block's stored `previousHash` no longer points to the edited block's current hash.

Repair from block `N` means:

1. Recalculate block `N`'s stored `hash`.
2. Copy that hash into block `N + 1` as `previousHash`.
3. Recalculate block `N + 1`'s stored `hash`.
4. Continue through the latest block.

After repair, validation must return `valid` for every block and link.

## Glossary

| Term | Use in this lab | Avoid |
|---|---|---|
| Block | A record in the chain. | Node, entry |
| Hash | A fingerprint of block contents. | Digest, checksum |
| Previous hash | The stored hash from the block before this one. | Parent hash |
| Genesis block | The first block in the chain. | Root block |
| Tamper | Edit existing block data without repairing links. | Hack, corrupt |
| Validate | Check block hashes and previous-hash links. | Verify form |
| Repair | Recalculate hashes and relink downstream blocks. | Re-mine |
