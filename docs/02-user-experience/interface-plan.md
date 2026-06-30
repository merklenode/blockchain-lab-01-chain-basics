# Interface Plan

## Primary Layout

Use a three-zone app layout.

## Left Panel: Controls

Controls should include:

- Add block input.
- `Add block` button.
- `Validate chain` button.
- Tamper mode toggle.
- `Repair from selected block` button.
- `Reset chain` button.
- Animation speed control.

## Center Area: Chain Canvas

The center area is the main learning surface. It should show block cards connected by animated links.

Each block card should show:

- Block number.
- Short data preview.
- Hash preview.
- Previous hash preview.
- Valid or invalid state.
- Status icon and text label. Do not rely on color alone.

## Right Panel: Inspector

When a user selects a block, show:

- Full data.
- Full hash.
- Full previous hash.
- Hash input formula.
- Whether the block contents are valid.
- Whether the previous-hash link is valid.

## Action Timeline

After every action, show a short sequence of what happened. Example:

1. New data was added.
2. A hash was calculated.
3. The previous hash was copied from the last block.
4. The new block was appended to the chain.

## Screen States

| State | Visible signal | Available primary action |
|---|---|---|
| Initial | Genesis block selected, inspector explains `Genesis block`. | Add block |
| Valid chain | Blocks show `Valid` with icon and text. | Add block or tamper |
| Tamper mode | Editable data fields are clearly marked. | Edit an existing block |
| Invalid chain | Affected blocks/links show `Invalid` or `Broken link` with icon and text. | Validate chain |
| Validating | Scan indicator moves through blocks; controls that would change the chain are disabled. | Wait for result |
| Repairing | Changed blocks are updated in sequence and announced in the timeline. | Wait for repair |
| Repaired | Chain shows `Valid chain`; timeline lists recalculated blocks. | Add block or tamper again |
| Reset | Chain returns to genesis block only. | Add block |

Every state change should update the timeline and a screen-reader live region.

## Responsive Behavior

- Desktop: use the three-zone layout with controls, chain canvas, and inspector visible.
- Tablet: keep controls and inspector available, but allow the chain canvas to use horizontal scrolling.
- Mobile: stack controls, chain canvas, inspector, and timeline vertically. The chain may become a horizontal scroll region with clear overflow affordance.
- Touch targets should be at least 44px high and wide.
- Long hashes should wrap or truncate with a full value available in the inspector.
- The first implementation may cap the visible learner chain at a small number of blocks, such as 8, to keep animation and layout understandable.

## Accessibility Requirements

- Use real buttons, inputs, labels, and form controls.
- All controls and block cards must be reachable by keyboard with visible focus.
- Icon-only controls need accessible names.
- Valid/invalid states need text plus icon, not only red/green color.
- Chain status changes must be announced through a live region.
- Tampered editable fields should use `aria-invalid` and `aria-describedby` when a field causes a broken chain.
- Text contrast should meet WCAG AA: 4.5:1 for normal text and 3:1 for meaningful UI indicators.
