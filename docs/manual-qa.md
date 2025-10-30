# Manual QA - Deck Input Synchronization

To guard against regressions where editing the deck vector is immediately undone by prop-driven updates, exercise the following flow whenever we touch the deck input logic:

1. Load the app fresh and confirm the textarea starts empty.
2. Type a short sequence such as `1, 2, 3` and verify it stays intact while typing (no resets between keystrokes).
3. Click **Load ordered deck** and confirm the textarea populates with the ordered sequence.
4. Edit the populated text manually (e.g., change the first entry) and ensure the change persists.
5. Refresh the page to trigger the saved-deck restore and confirm the textarea adopts the stored value without wiping out in-progress edits.

These checks ensure local typing remains stable while genuine external updates (helper buttons, saved state) still flow into the field.
