# Sequential Implementation Plan

## Phase 1: Clean App Foundation

Create the Next.js app shell with a lab-style interface. Add static placeholder data for three blocks.

Acceptance criteria:

- The app opens directly to the lab interface.
- Three block cards appear in a horizontal chain.
- The layout works on desktop and mobile.
- Valid/invalid labels use text and icon cues, not color alone.
- Keyboard focus order reaches controls, block cards, inspector, and timeline.

## Phase 2: Blockchain Domain Logic

Implement the pure TypeScript blockchain functions.

Acceptance criteria:

- Genesis block can be created.
- New blocks can be appended.
- Hashes are deterministic.
- Chain validation returns valid and invalid results correctly.
- Unit tests cover valid chain, tampered data, and broken previous hash.
- Hash input order, encoding, and algorithm match `docs/01-theory/core-concepts.md`.
- Validation results are derived from chain data.

## Phase 3: Add Block Interaction

Connect the form to real chain state.

Acceptance criteria:

- User can type data and add a block.
- New block uses the previous block hash.
- UI updates without page reload.
- The action timeline explains data entry, hash calculation, previous-hash copy, and append.

## Phase 4: Inspector and Selection

Allow users to click any block and inspect it.

Acceptance criteria:

- Selected block is visually highlighted.
- Inspector shows full fields.
- Inspector explains whether the block and previous link are valid.

## Phase 5: Tamper Mode

Add a mode where users can edit old block data.

Acceptance criteria:

- User can edit a block's data.
- The changed block hash updates or is shown as mismatched.
- The next link becomes invalid.
- The UI explains why the chain broke in causal language.
- The invalid state is announced to assistive technology.

## Phase 6: Validation Animation

Add visual validation scanning.

Acceptance criteria:

- Clicking validate animates left to right.
- Each block and link gets a status.
- The final result is obvious.
- Reduced-motion users get equivalent step highlights without moving scan animation.

## Phase 7: Repair Chain

Add recalculation from a selected block.

Acceptance criteria:

- User can repair the chain from the tampered block onward.
- Hashes and previous hashes update in sequence.
- Validation passes after repair.
- The timeline lists which blocks were recalculated.

## Phase 8: Polish and Tests

Improve responsiveness, accessibility, copy, and tests.

Acceptance criteria:

- Keyboard navigation works for core controls.
- Text does not overlap on mobile.
- Unit tests pass.
- Basic Playwright flow passes: add block, tamper, validate, repair.
- Playwright covers keyboard-only operation for the main flow.
- Playwright or component checks cover reduced-motion behavior.
- Accessibility checks cover labels, focus visibility, live-region status, and non-color state cues.
