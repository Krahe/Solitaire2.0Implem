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

