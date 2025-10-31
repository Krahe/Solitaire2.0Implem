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
