"use client";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

type Props = {
  onCreated: () => void;
};

export function NameSetupForm({ onCreated }: Props) {
  const [singular, setSingular] = useState("Andy");
  const [plural, setPlural] = useState("Andies");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const createUser = useMutation(api.users.createFirstUser);

  function handleSingularChange(value: string) {
    setSingular(value);
    if (!plural || plural === autoPlural(singular)) {
      setPlural(autoPlural(value));
    }
  }

  function autoPlural(s: string): string {
    if (!s) return "";
    const lower = s.toLowerCase();
    if (lower.endsWith("y")) return s.slice(0, -1) + "ies";
    if (lower.endsWith("s") || lower.endsWith("x") || lower.endsWith("z"))
      return s + "es";
    return s + "s";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!singular.trim() || !plural.trim()) {
      setError("Both names are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createUser({
        singularName: singular.trim(),
        pluralName: plural.trim(),
        hasProfilePhoto: false,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form className="setupForm panel" onSubmit={handleSubmit}>
      <p className="eyebrow">Welcome</p>
      <h1>What do you call your avatars?</h1>
      <p>
        Andies are the different dimensions of yourself you want to care for.
        Name them anything you like.
      </p>

      <label className="fieldLabel">
        Singular (one avatar)
        <input
          className="fieldInput"
          value={singular}
          onChange={(e) => handleSingularChange(e.target.value)}
          placeholder="Andy"
          maxLength={32}
          disabled={busy}
        />
      </label>

      <label className="fieldLabel">
        Plural (all avatars)
        <input
          className="fieldInput"
          value={plural}
          onChange={(e) => setPlural(e.target.value)}
          placeholder="Andies"
          maxLength={32}
          disabled={busy}
        />
      </label>

      {error && <p className="fieldError">{error}</p>}

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Setting up…" : "Get started"}
      </button>
    </form>
  );
}
