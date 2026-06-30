# Testing Strategy

## Unit Tests

Test the blockchain domain layer first.

Required tests:

- Creates a genesis block.
- Adds a block with the correct previous hash.
- Produces the same hash for the same block input.
- Changes the hash when any hashed field changes.
- Detects tampered block data.
- Detects broken previous-hash links.
- Repairs a chain after tampering.
- Derives validation status from chain data rather than stored UI flags.
- Uses stable block ids that can serve as React keys.

## UI Tests

Use Playwright for the main learning flow.

Required flow:

1. Open the lab.
2. Add a block.
3. Select the new block.
4. Tamper with the first user-created block.
5. Run validation and see an invalid result.
6. Repair the chain.
7. Run validation and see a valid result.

Additional learner-task assertions:

- Keyboard-only user can add, select, tamper, validate, repair, and reset.
- Invalid status appears as text/icon and not only as color.
- Status changes are announced through a live region.
- Reduced-motion mode still shows validation and repair progress without movement-heavy animation.
- Long hash text does not overlap at 390px, 768px, or 1440px widths.

## Visual Checks

Check these viewports:

- Mobile: 390px width.
- Tablet: 768px width.
- Desktop: 1440px width.

The chain should remain readable, controls should not overlap, and block hash text should wrap or truncate cleanly.

## Acceptance Criteria

- Freshly created chains validate as `Valid chain`.
- Editing block `N` data marks block `N` as `Hash changed` and marks the next affected link as `Broken link`.
- Validation scans all blocks from genesis to latest and reports exact failing blocks or links.
- Repair from block `N` recalculates block `N` and all downstream blocks, then validation passes.
- Reloading the page returns to the genesis-only state for the first implementation.
- All interactive controls have accessible names and visible focus states.
