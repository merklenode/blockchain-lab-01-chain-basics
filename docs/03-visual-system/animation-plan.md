# Animation Plan

## Animation Principles

Animations must explain the concept. Avoid decorative motion that does not teach anything.

## Key Animations

### Add Block Animation

Learner question: how does a new block get its hash and link to the previous block?

1. User enters data.
2. A draft block appears with empty hash fields.
3. The app highlights `index`, `timestamp`, `data`, and `previousHash`.
4. The hash field fills with a typing or counting animation.
5. A connector line draws from the previous block to the new block.

### Hash Change Animation

Learner question: why did editing old data change the chain?

When data changes:

1. Highlight the edited data field.
2. Pulse the block hash field.
3. Replace the old hash preview with a new hash preview.
4. Mark the next link as broken if its stored previous hash no longer matches.

### Validation Animation

Learner question: what exactly is validation checking?

When validating:

1. A scan indicator moves left to right.
2. Each block is checked.
3. Each link is checked.
4. Valid blocks show a `Valid` label, icon, and accessible state.
5. Broken blocks or links show a `Broken link` or `Hash changed` label, icon, and accessible state.
6. The final result appears in the inspector.

### Repair Animation

Learner question: how does recalculation restore the chain?

When repairing:

1. Start from the changed block.
2. Recalculate that block hash.
3. Update the next block's previous hash.
4. Continue until the end of the chain.
5. Mark the whole chain valid again.

## Recommended Libraries

Use CSS transitions for simple state changes. Use Framer Motion only if richer sequencing is needed.

## Reduced Motion

Honor `prefers-reduced-motion`. When reduced motion is enabled:

- Replace moving scan indicators with instant step highlights.
- Replace typing/counting hash effects with immediate value changes.
- Keep all explanatory state changes visible through labels, icons, and timeline messages.
- Do not remove the educational sequence; reduce the motion used to present it.
