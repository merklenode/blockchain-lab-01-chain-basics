# Learning Script

The app should guide users through this sequence:

Each step should have one primary action. Secondary controls can remain available, but the current recommended action should be visually clear.

## Step 1: See the Genesis Block

Show one block on screen. Explain that every chain begins with a first block.

## Step 2: Add a Block

The user types data and clicks `Add Block`. Animate a new block appearing to the right of the current chain.

## Step 3: Show Hash Creation

Highlight the block fields that are used to generate the hash. Then animate the final hash into the block's hash field.

## Step 4: Show the Link

Animate the previous block's hash moving into the new block's `previousHash` field.

## Step 5: Tamper With Data

Let the user edit data in an older block. Immediately show that the block hash changed and the next block link is broken.

## Step 6: Validate the Chain

The user clicks `Validate Chain`. The app scans from left to right and marks each block/link as valid or broken.

## Step 7: Repair the Chain

The user clicks `Repair from selected block`. The app updates hashes and previous-hash links from the edited block onward.

## End-to-End Flow

| Step | Primary action | Expected state | Learner should notice |
|---|---|---|---|
| 1 | Inspect genesis block | One valid genesis block | A chain starts from a first block. |
| 2 | Add block | Two valid blocks | The new block stores the previous hash. |
| 3 | Add another block | Three valid blocks | Links form a sequence, not isolated cards. |
| 4 | Enable tamper mode | Existing block data becomes editable | Editing old data is different from adding new data. |
| 5 | Edit block 1 data | Chain becomes invalid | The edited hash changed and the next link no longer matches. |
| 6 | Validate chain | Scan marks exact failures | Validation checks blocks and links from left to right. |
| 7 | Repair from edited block | Chain returns to valid | Repair cascades recalculation to later blocks. |
| 8 | Reset chain | Genesis-only state | Reset is the safe escape hatch. |

## Re-Entry Behavior

The first implementation does not persist progress. If the learner reloads the page, the app returns to the genesis-only state and the timeline shows the initial explanation.
