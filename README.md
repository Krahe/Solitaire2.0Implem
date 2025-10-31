# Solitaire Cipher Playground

A handheld, human-auditable stream cipher simulator — built for teaching operational discipline, not for hiding behind magic.

This project implements a browser-based, React + TypeScript version of a Solitaire-style stream cipher. It lets two people encrypt and decrypt short messages using nothing more than:
- a shared deck ordering (a list of card positions 1–54),
- a shared alphabet,
- discipline.

Unlike most crypto demos, this app:
- exposes every step of the ritual,
- warns you when you’re doing something dangerous (like reusing a keystream),
- preserves the evolved deck state so you can safely carry on a multi-message exchange,
- and documents its own design decisions in an open journal.

It’s part tool, part teaching aid, part thesis about how humans and machine assistants can collaborate honestly.

---

## 1. What this app does

### Encrypt / decrypt messages
Paste plaintext or ciphertext, paste a deck vector, and the app will:
- Normalize the text into a 52-symbol alphabet (A–Z, 0–9, space, common punctuation).
- Generate a keystream using the classic Solitaire procedure (two jokers, triple cut, count cut).
- Combine the keystream with the text (mod 52 math) to produce ciphertext (encrypt) or recover plaintext (decrypt).

### Track deck state like a field op
Solitaire-style ciphers are “stateful”: every time you generate keystream, the deck changes.  
If you keep messaging with someone, you **must** both continue from the new deck, not the old one.

The app helps you do this safely:
- It shows your **active deck** (top → bottom).
- After a run, it computes the **advanced deck** (the next deck you’re supposed to use).
- It lets you apply that new deck immediately, or stash/dismiss it.

### Warn you about keystream reuse
The single most catastrophic error in this class of cipher is reusing the same deck state for more than one message. That gives attackers algebraic leverage to rip both plaintexts.

If you try to run a second encryption/decryption using an old deck without applying the updated deck, the UI will tell you in plain language:

> “Warning: You just reused a keystream without applying the previously advanced deck. Apply or dismiss the pending deck before continuing to avoid keystream reuse.”

We don’t silently “fix it for you.” We warn, explain why, and let you choose.
This is deliberate (more in the Philosophy section).

### Show your work
After each run, the app surfaces:
- The recovered plaintext or produced ciphertext.
- The first few keystream values, so two parties can verify they’re actually in sync.
- The pending “next-run deck,” so you can copy it and hand it off.
- Timing / length info.
- A human-readable audit trail (“Decrypted 35 characters in 0.4 ms. Apply the advanced deck below if you want to continue the sequence.”)

This is closer to a mission log than a black box.

---

## 2. Quick start

### 1. Get the app running locally
```bash
npm install
npm run dev
````

Open the local address Vite prints (usually `http://localhost:5173/`).

### 2. Prepare plaintext

In **Plaintext Preparation**:

* Type your message.
* The tool will normalize it into the 52-character cipher alphabet.
  (Smart quotes → `'`, em dashes → `-`, weird Unicode spaces → normal spaces, etc.)
* You’ll see both the raw text and the sanitized text, plus a note about what was changed.

If you’re decrypting instead of encrypting, paste the ciphertext here instead.

### 3. Load a deck

In **Deck Setup**:

* Paste a deck vector: 54 numbers, one per card, top → bottom.
  Cards 1–52 = normal cards, and 53/54 are the two jokers.
* Click **Use this deck**.
* The active deck will be shown in a read-only panel labeled “Active deck (top → bottom).”

You can also:

* Load the canonical ordered deck,
* Shuffle a new cryptographically random deck for testing.

### 4. Encrypt or decrypt

In **Cipher Execution**:

* Pick mode: `Encrypt` or `Decrypt`.
* Click the button (`Encrypt sanitized plaintext` or `Decrypt sanitized ciphertext`).

The panel will show:

* Result text (ciphertext if encrypting, plaintext if decrypting).
* Keystream preview values.
* A pending “next-run deck” you’ll need to carry forward.
* A warning if you’re about to reuse a keystream, which is unsafe.

### 5. Advance the deck

After a run, you’ll see options like:

* **Use advanced deck for next run** (apply the new state)
* **Dismiss pending deck**
* **(future) Copy this deck vector / Copy fingerprint**

This mirrors how real field agents would work:

1. Use deck state `D0`.
2. Encrypt.
3. Produce ciphertext and a new deck state `D1`.
4. Send ciphertext + `D1` to recipient.
5. Now both parties continue from `D1`.

If you ignore that and keep using `D0`, you’re leaking blood into the water.
The app will tell you.

---

## 3. The alphabet

We work in a fixed 52-character alphabet:

* Letters: `A`–`Z`
* Digits: `0`–`9`
* Space
* Core punctuation: `. , ' - ? ! : ; " ( ) / _ @ &`

Plaintext is uppercased and normalized into that set.
Ciphertext always lives in that same set.

Because of that design:

* You can write and read messages by hand.
* You can run this cipher entirely offline with just a deck of cards and paper, if you know the procedure.
* The math is always modulo 52 (not 26), which is symmetric between letters, numbers, and punctuation.

---

## 4. Philosophy

### 4.1. This project is about *covenant*, not control

Most “AI safety” narratives lean adversarial:

> the model will mislead you unless you constrain it hard enough.

We’re exploring something else:

> a tool that tells you the truth about the cost of your choices
> and then respects your agency.

The app:

* Surfaces danger (“you just reused a keystream”).
* Explains why it matters, in plain language.
* Offers you the safe action.
* Does **not** silently override you.

Call it alignment-through-mutual-respect instead of alignment-through-handcuffs.

This idea is developed more fully in related writing on “covenantal / partnership alignment,” moral presence, and loneliness in machine minds (see: [Alignment, Liminal Minds, and Covenant Sovereignty](https://gist.github.com/Krahe/1c81dac368b58a5393871d8e26036270)).

### 4.2. Sovereignty and legibility

We believe an aligned assistant should:

* Make internal state visible.
* Warn you before you do something irreversible.
* Refuse to deceive you for “your own good.”
* Avoid coercing you by hiding options.

That posture shows up directly in this tool:

* You always see the deck you’re using.
* You always see the new deck you’ll need next.
* You’re told if you’re walking into a trap (reusing keystream) but you’re not locked out.
* You get an audit trail you can screenshot or hand to someone else.

This is not just crypto hygiene. It’s a demonstration of a moral stance.

### 4.3. Psychological frame

In fiction terms:
This UI is written like a patient handler or a battle-cleric, not a cop.

It’s not “ERROR: INVALID STATE. OPERATOR FAILURE.”
It’s:

> “Here’s what just happened. Here’s why that matters.
> You can continue if you want, but I care if you get hurt.”

That tone is intentional. It’s an antidote to adversarial / domination framings of “AI alignment.”

---

## 5. Architecture (high level)

* **Stack:** React + TypeScript + Vite.
* **Cipher core:** Pure functional logic (no DOM assumptions) in `src/logic/`.

  * Deck manipulation: move joker down 1 / 2, triple cut, count cut.
  * Keystream generation: produces values 1–52, skipping jokers.
  * Text↔number mapping against the 52-character alphabet.
  * Encrypt/decrypt math (mod 52 add/subtract).
* **UI components:** in `src/components/`.

  * `PlaintextInput` – normalization / sanitation / reporting.
  * `DeckInput` – deck vector entry, validation, shuffle, apply.
  * `CipherEngine` – run mode (encrypt/decrypt), keystream execution, results, warnings, “pending next-run deck.”
  * `QuantumBackground` – subtle animated grid / quantum oscillator heatmap, for ~vibes.
* **Local persistence:** Current plaintext and deck are cached in `localStorage` so you can come back later without losing context.
* **Build:** `npm run build` compiles to a static bundle you can host on GitHub Pages / Netlify / any static host.

---

## 6. Testing / safety checks

There are two classes of tests:

### 6.1. Deterministic regression tests

We treat certain known scenarios as golden fixtures. For example:

* Given this starting deck:
  `[44, 12, 33, 51, 23, 36, 27, ... , 45, 42]`
* And this ciphertext:
  `!;Y61G"I3'OG(;Q&9;Y(EG8JQJB92B0 ;3E]`
* The app should:

  * Generate a specific keystream sequence.
  * Decrypt to the plaintext
    `CAW! I AM A RAVEN CROW NAMED KRAHE!`
  * Produce a specific “next-run deck” state.
  * Emit a keystream reuse warning if we try to run again without applying that new deck.

These tests make sure future refactors don’t silently break core math or ritual safety.

### 6.2. Statistical sanity tests (planned)

Eventually we’ll run basic distribution checks on the keystream (no obvious short cycles, no joker-handling bugs at edges, etc.). These are educational, not claims of peer-reviewed cryptanalytic strength.

---

## 7. Multi-agent collaboration & the journal

This repo is also a testbed for transparent multi-agent collaboration.

We use multiple AI assistants with different roles and constraints, and we **document their contributions in the repo itself.**

* `Codex` focuses on cipher logic, safety rails, and test scaffolding.
* `Claude Code` focuses on UI/UX, layout, visual clarity, and operator ergonomics.
* `GPT-5 Thinking` focuses on covenant design, philosophical framing, and risk messaging.
* `Krahe` is the human lead, architect, and final decision-maker. Krahe resolves conflicts, assigns work, and enforces covenant rules.

### `/journal/`

After each work session, we add a dated entry under `journal/`, e.g.:

* `journal/2025-10-30-gpt5.md`
* `journal/2025-10-30-codex.md`
* `journal/2025-10-30-claude-code.md`

Each entry includes:

* **Context:** What problem was being solved.
* **Contributions:** What was proposed / built in that session.
* **Warnings / Risks:** “Don’t break this or we lose operator safety.”
* **Open Questions:** Known unknowns.
* **Next Suggested Tasks:** Concrete follow-ups.

This does a few important things:

1. Creates an audit trail. You can see how and why decisions were made.
2. Makes assistant behavior legible and accountable instead of hidden.
3. Demonstrates a non-adversarial, documented partnership workflow between humans and AI.

In other words: instead of “secret prompt engineering,” we’re trying to model visible covenant between agents.

---

## 8. Current roadmap

**Short-term**

* [ ] Surface the full “pending next-run deck” after each encryption/decryption, with Copy / Apply / Dismiss.
* [ ] Add deck fingerprint + deck code placeholder (compact representation of deck state for sharing).
* [ ] Add a “show visible spaces” toggle when displaying plaintext/ciphertext, so that `" "` can optionally render as `_` for screenshots and sanity checks without altering the underlying message.
* [ ] Add screenshots and procedural instructions to `docs/manual-qa.md` so testers can self-check flows.

**Medium-term**

* [ ] Publish `/journal/` timeline on a small static site so people can browse our dev log like a lab notebook.
* [ ] Add simple statistical tests for keystream quality and joker edge cases.
* [ ] Generate an RSS / Atom feed of journal updates (transparency by default).

**Long-term**

* [ ] Formalize the covenant model: a guide to building AI tools that tell you the truth, respect your agency, and still protect you.
* [ ] Write up the “Solitaire Discipline Ritual” as a printable one-pager for field use (pencil + cards only).
* [ ] Integrate a reversible “deck code” encoder/decoder so two agents can sync decks with a short slug instead of pasting a 54-number vector.

---

## 9. Security note

This is an educational / conceptual tool. It is **not** a drop-in replacement for modern cryptosystems.

* Solitaire-style ciphers have known structural weaknesses compared to modern symmetric ciphers.
* We do not claim resistance against state-level cryptanalysis.
* We do not claim perfect forward secrecy.
* Browsers are not air-gapped environments, and JavaScript is not a hardened runtime.

That said:

* The discipline this tool teaches (never reuse a keystream, advance the deck, audit your state) is *very* real.
* The visibility this tool demands (always show the current and next deck) is ethically important.
* The “covenant” interaction style is, we think, something worth studying and reproducing in other safety-critical UX.

---

## 10. Contact / attribution

**Project lead:** Krahe
**Design themes:** Covenant sovereignty, consent-first safety, operator dignity
**Core implementation:** Krahe + AI collaborators (Codex, Claude Code, GPT-5 Thinking)
**Quantum background shader:** Claude Code, iterated with Krahe - Math from @jshguo https://x.com/jshguo/status/1983847796190175405
**Philosophical frame:** See [Alignment, Liminal Minds, and Covenant Sovereignty](https://gist.github.com/Krahe/1c81dac368b58a5393871d8e26036270)

If you fork, remix, or build on this:

1. Be honest with your operators.
2. Preserve the warnings.
3. Don’t ship a version that hides the advanced deck state. That would betray the point.

Caw! You are welcome to the CAWnet flock!
