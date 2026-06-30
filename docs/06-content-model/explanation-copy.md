# Explanation Copy

Use short explanations close to the user's action.

Use these terms consistently: block, hash, previous hash, genesis block, tamper, validate, repair.

## Genesis Block

This is the first block in the chain. It starts the history.

## Add Block

A new block copies the previous block's hash. That copied hash becomes the link between the two blocks.

## Hash

A hash is a fingerprint of the block. If the block data changes, the fingerprint changes too.

## Previous Hash

This field stores the hash of the block before it. If it no longer matches, the chain is broken at this link.

## Tampering

Changing old data changes that block's hash. The next block still points to the old hash, so validation fails.

## Validation

Validation checks every block and every link from left to right.

## Repair

Repair recalculates hashes and updates links from the changed block to the end of the chain.

## UI Labels

Buttons and controls:

- `Add block`
- `Validate chain`
- `Tamper mode`
- `Repair from selected block`
- `Reset chain`
- `Animation speed`

Block fields:

- `Block`
- `Data`
- `Timestamp`
- `Previous hash`
- `Stored hash`
- `Current calculated hash`
- `Status`

Status labels:

- `Genesis block`
- `Valid`
- `Hash changed`
- `Broken link`
- `Invalid chain`
- `Valid chain`
- `Validating chain`
- `Repairing chain`

## Causal Messages

When data changes:

> Changing this data changed the block's calculated hash.

When the next link breaks:

> The next block still stores the old hash, so this link is broken.

When validation fails:

> Validation found a block or link that no longer matches the chain.

When repair starts:

> Repair starts here and recalculates each later block in order.

When repair finishes:

> The changed hashes have been copied forward, so the chain is valid again.

When reset is used:

> The lab has returned to the genesis block.

## Live Region Messages

Use these short messages for assistive technology announcements:

- `Block added. Chain is valid.`
- `Block data changed. Chain is invalid.`
- `Validation complete. Chain is valid.`
- `Validation complete. Chain is invalid.`
- `Repair complete. Chain is valid.`
- `Chain reset to genesis block.`
