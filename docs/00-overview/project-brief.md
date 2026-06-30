# Project Brief

## Purpose

Build an interactive learning website for the simplest blockchain concept: a linked chain of blocks protected by hashes.

This project should not try to teach cryptocurrency, proof of work, wallets, tokens, mining rewards, smart contracts, or decentralized networks. Those are later labs. This lab focuses only on chain structure and data integrity.

## Target Learner

The target user is a beginner who has heard the word blockchain but does not yet understand what a block, hash, previous hash, or validation means.

The user should learn by interacting with the page, not by reading a long article first.

## Core Learning Outcome

After using the site, the user should be able to explain:

- A block stores data and metadata.
- A hash is a fingerprint of block contents.
- Each block stores the previous block hash.
- Changing one block changes its hash.
- A changed hash breaks the connection to the next block.
- Validation means checking all hashes and links from genesis to latest block.

## Learning Outcomes and Success Signals

| Concept | Learner can do this | UI success signal |
|---|---|---|
| Block | Point to the data and metadata stored in a block. | Inspector labels `data`, `timestamp`, `previousHash`, and `hash` for the selected block. |
| Hash | Predict that changing block contents changes the hash. | Editing `data` updates the shown hash and displays `Hash changed`. |
| Previous hash | Explain that each block points to the block before it. | Connector labels show the previous block hash copied into the next block's `previousHash`. |
| Tampering | Explain why an old edit breaks later links. | The edited block and downstream links show an invalid text label and icon, not color alone. |
| Validation | Describe validation as checking every block and link. | The validation scan reports each block/link result and a final chain status. |
| Repair | Explain that repair recalculates hashes and relinks later blocks. | `Repair from selected block` returns the chain to `Valid chain` and lists changed blocks. |

## Product Shape

The app should feel like a focused visual lab:

- Left panel: user controls.
- Center: animated chain visualization.
- Right panel: selected block inspector and validation result.
- Bottom or side timeline: step-by-step explanation of the latest action.

No landing page is needed. The first screen should be the actual learning tool.

## Scope Decisions

- The lab starts with a genesis block already visible.
- Lab state is in-memory only for the first implementation. Reloading the page resets the chain to the genesis block.
- The app teaches chain integrity only. It must not introduce proof of work, mining, wallets, balances, consensus, gas, or smart contracts.
- The word `validation` means chain-integrity validation, not form validation.

## Definition of Done

- A beginner can complete the add, tamper, validate, and repair flow without reading an article first.
- Every chain state has visible feedback: initial, valid, tampered, validating, repairing, repaired, and reset.
- Validity is never communicated by color alone.
- The layout is usable at 390px, 768px, and 1440px widths.
- Unit tests cover domain rules, and Playwright covers the main learner flow plus keyboard operation.
