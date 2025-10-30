import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { CipherEngine } from "../CipherEngine";
import { createOrderedDeck } from "../../logic/deck";

describe("CipherEngine", () => {
  it("drops stale pending decks when a new manual deck arrives", async () => {
    const onDeckUpdate = vi.fn();
    const initialDeck = createOrderedDeck();

    const { rerender } = render(
      <CipherEngine
        sanitizedText="HELLO"
        deck={initialDeck}
        onDeckUpdate={onDeckUpdate}
        manualDeckVersion={0}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /encrypt sanitized plaintext/i }));

    await screen.findByRole("button", { name: /use advanced deck for next run/i });

    rerender(
      <CipherEngine
        sanitizedText="HELLO"
        deck={createOrderedDeck()}
        onDeckUpdate={onDeckUpdate}
        manualDeckVersion={1}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /use advanced deck for next run/i })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: /encrypt sanitized plaintext/i }));

    await screen.findByRole("button", { name: /use advanced deck for next run/i });

    await waitFor(() => {
      expect(screen.queryByText(/Warning: You just reused a keystream/i)).toBeNull();
    });
  });
});
