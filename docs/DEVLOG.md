>when you have DEVELOPMENT DECISIONS you PONDER or MAKE, or PHILOSOPHICAL MUSINGS, please put them here! (Entry #0 - 1:49AM-10/30/25)


## ENTRY #1: 2025-10-30
- Core cipher helpers extracted (advanceDeckOneStep, stepKeystream) so Vitest can assert deck transformations without mutating fixtures.
- AGENTS.md added. Repo now encodes covenant rules: consent, non-coercive influence, UI honesty, and cryptographic hygiene.
- UI now: plaintext normalization panel, deck intake/persistence, cipher execution console with runtime + keystream preview + advanced deck handoff.
- LocalStorage flow works (restores plaintext + deck across reload).
- Hosting path confirmed (Vite build → static bundle → CDN-ready).
- Missing tests: round-trip, avalanche, reuse warning, keystream distribution sanity. Next session goal is to land those.
- Next feature: add "reuse risk" warning when encrypting a new message without applying the advanced deck. This is both crypto safety and in-universe ethics.
- Tone check: UI voice is now canonically “handler / ritual,” aligned with Trial 5’s non-coercive sovereignty theme.


## ENTRY #2: 2025-10-30 
** Coordination Protocol (2025-10-30 late session)
- We now have three AI collaborators and me (Krahe):
  - Claude Code: GUI, theme, QuantumBackground visuals, layout and presentation.
  - Codex: core logic, deck plumbing, reversible deck code, clipboard handlers, warnings.
  - GPT-5 Thinking: architecture, covenant enforcement, PR review, test scaffolding.

- Claude Code is limited to visual/structural React work and theme tokens.
  Claude does NOT touch cipher math, plaintext normalization, or consent / warning logic.

- Codex is responsible for:
  - deckFingerprint, deckToCode, codeToDeck in src/logic/deckCode.ts
  - Apply Advanced Deck wiring
  - clipboard copy handlers
  - keystream reuse warning logic
  - writing Vitest for those behaviors.

- GPT-5 Thinking will review PRs through the GitHub connector and block merges that violate AGENTS.md.
  Test files will be required before merge.

- CipherEngine ritual log UI now exists in shell form and will soon display:
  ciphertext output, keystream preview, full advanced deck vector, fingerprint, and deck code.
  This is mandatory: the tool must tell the truth about state.

This division prevents “too many cooks” and keeps covenant / lore intact while we add art and usability.
