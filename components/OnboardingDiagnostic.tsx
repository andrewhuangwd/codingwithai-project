"use client";
import { api } from "@/convex/_generated/api";
import type { OnboardingRecommendations } from "@/lib/aiSchemas";
import { useAction, useMutation } from "convex/react";
import { useRef, useState } from "react";
import { AndyEditor, type ReviewAndy } from "./AndyEditor";

const CORE_QUESTIONS = [
  "What are you hoping to grow or care for in the next 3 months?",
  "What does your current week typically look like?",
  "What tends to get in the way of taking care of yourself?",
  "What is one area where you feel proud of yourself lately?",
];

type Phase =
  | "core"
  | "clarifying"
  | "generating"
  | "review"
  | "saving"
  | "error";

type Props = {
  userId: string;
  onComplete: () => void;
};

let localCounter = 0;
function nextId() {
  return `local-${++localCounter}`;
}

export function OnboardingDiagnostic({ userId, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("core");
  const [coreAnswers, setCoreAnswers] = useState<string[]>(
    CORE_QUESTIONS.map(() => ""),
  );
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [clarifyingIndex, setClarifyingIndex] = useState(0);
  const [recommendations, setRecommendations] =
    useState<OnboardingRecommendations | null>(null);
  const [andies, setAndies] = useState<ReviewAndy[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const generateClarifying = useAction(api.ai.generateClarifyingQuestions);
  const generateRecommendations = useAction(
    api.ai.generateOnboardingRecommendations,
  );
  const saveResults = useMutation(api.onboarding.saveOnboardingResults);

  // --- Phase: core questions ---
  async function handleCoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = coreAnswers.every((a) => a.trim().length > 0);
    if (!filled) {
      setErrorMsg("Please answer all questions.");
      return;
    }
    setErrorMsg("");
    setPhase("clarifying");

    try {
      const result = (await (generateClarifying as any)({ coreAnswers })) as { questions: string[] };
      if (result.questions.length === 0) {
        await runGenerateRecommendations(coreAnswers, []);
      } else {
        setClarifyingQuestions(result.questions);
        setClarifyingAnswers(result.questions.map(() => ""));
        setClarifyingIndex(0);
      }
    } catch {
      await runGenerateRecommendations(coreAnswers, []);
    }
  }

  // --- Phase: clarifying questions (shown one at a time) ---
  async function handleClarifyingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const answer = clarifyingAnswers[clarifyingIndex]?.trim() ?? "";
    if (!answer) {
      setErrorMsg("Please answer the question.");
      return;
    }
    setErrorMsg("");

    if (clarifyingIndex < clarifyingQuestions.length - 1) {
      setClarifyingIndex(clarifyingIndex + 1);
    } else {
      await runGenerateRecommendations(coreAnswers, clarifyingAnswers);
    }
  }

  async function runGenerateRecommendations(
    coreAns: string[],
    clarifyAns: string[],
  ) {
    setPhase("generating");
    try {
      const result = (await (generateRecommendations as any)({
        coreAnswers: coreAns,
        clarifyingAnswers: clarifyAns,
      })) as OnboardingRecommendations;
      setRecommendations(result);
      setAndies(
        result.andies.map((a) => ({
          localId: nextId(),
          name: a.name,
          dimension: a.dimension,
          needs: a.needs.map((n) => ({
            localId: nextId(),
            title: n.title,
            type: n.type,
            weekdays: n.weekdays ?? [1, 3, 5],
            startTime: n.startTime ?? "09:00",
            durationMinutes: n.durationMinutes ?? 30,
          })),
        })),
      );
      setPhase("review");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to generate recommendations.",
      );
      setPhase("error");
    }
  }

  // --- Phase: review / edit ---
  async function handleAccept() {
    if (!recommendations) return;
    const hasEmpty = andies.some(
      (a) => !a.name.trim() || a.needs.some((n) => !n.title.trim()),
    );
    if (hasEmpty) {
      setErrorMsg("All Andy names and Need titles must be filled in.");
      return;
    }
    setErrorMsg("");
    setPhase("saving");

    try {
      await (saveResults as any)({
        userId,
        coreAnswers,
        clarifyingAnswers,
        summary: recommendations.summary,
        andies: andies.map((a) => ({
          name: a.name,
          dimension: a.dimension,
          needs: a.needs.map((n) => ({
            title: n.title,
            type: n.type,
            weekdays: n.type === "scheduled_recurring" ? n.weekdays : undefined,
            startTime:
              n.type === "scheduled_recurring" ? n.startTime : undefined,
            durationMinutes:
              n.type === "scheduled_recurring" ? n.durationMinutes : undefined,
          })),
        })),
        extractedDimensions: recommendations.extractedDimensions,
      });
      onComplete();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save.");
      setPhase("review");
    }
  }

  // --- Render ---
  if (phase === "core") {
    return (
      <form className="panel onboardingForm" onSubmit={handleCoreSubmit}>
        <p className="eyebrow">Day Zero</p>
        <h2>Tell us about yourself</h2>
        {CORE_QUESTIONS.map((q, i) => (
          <label key={i} className="fieldLabel">
            {q}
            <textarea
              className="fieldTextarea"
              value={coreAnswers[i]}
              onChange={(e) => {
                const next = [...coreAnswers];
                next[i] = e.target.value;
                setCoreAnswers(next);
              }}
              rows={3}
              placeholder="Your answer…"
            />
          </label>
        ))}
        {errorMsg && <p className="fieldError">{errorMsg}</p>}
        <button className="btn" type="submit">
          Continue
        </button>
      </form>
    );
  }

  if (phase === "clarifying" && clarifyingQuestions.length > 0) {
    const q = clarifyingQuestions[clarifyingIndex];
    return (
      <form className="panel onboardingForm" onSubmit={handleClarifyingSubmit}>
        <p className="eyebrow">
          Follow-up {clarifyingIndex + 1} / {clarifyingQuestions.length}
        </p>
        <h2>A quick clarifying question</h2>
        <label className="fieldLabel">
          {q}
          <textarea
            className="fieldTextarea"
            value={clarifyingAnswers[clarifyingIndex] ?? ""}
            onChange={(e) => {
              const next = [...clarifyingAnswers];
              next[clarifyingIndex] = e.target.value;
              setClarifyingAnswers(next);
            }}
            rows={3}
            placeholder="Your answer…"
          />
        </label>
        {errorMsg && <p className="fieldError">{errorMsg}</p>}
        <button className="btn" type="submit">
          {clarifyingIndex < clarifyingQuestions.length - 1
            ? "Next"
            : "Generate my Andies"}
        </button>
      </form>
    );
  }

  if (phase === "clarifying" || phase === "generating") {
    return (
      <div className="panel centered">
        <p>Building your Andies…</p>
      </div>
    );
  }

  if (phase === "saving") {
    return (
      <div className="panel centered">
        <p>Saving your Andies…</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="panel">
        <p className="fieldError">{errorMsg}</p>
        <button className="btn" onClick={() => setPhase("core")}>
          Start over
        </button>
      </div>
    );
  }

  // phase === "review"
  return (
    <div className="panel reviewPanel">
      <p className="eyebrow">Review</p>
      <h2>Your Andies</h2>
      {recommendations && (
        <p className="summaryText">{recommendations.summary}</p>
      )}
      <p className="helpText">
        Edit names, dimensions, and Needs before accepting.
      </p>

      <div className="andiesList">
        {andies.map((andy) => (
          <AndyEditor
            key={andy.localId}
            andy={andy}
            onChange={(updated) =>
              setAndies(andies.map((a) => (a.localId === updated.localId ? updated : a)))
            }
            onDelete={() =>
              setAndies(andies.filter((a) => a.localId !== andy.localId))
            }
            canAddMore={true}
          />
        ))}
      </div>

      {andies.length < 3 && (
        <button
          type="button"
          className="btnSmall"
          onClick={() => {
            setAndies([
              ...andies,
              {
                localId: nextId(),
                name: "",
                dimension: "General",
                needs: [],
              },
            ]);
          }}
        >
          + Add Andy
        </button>
      )}

      {errorMsg && <p className="fieldError">{errorMsg}</p>}

      <div className="reviewActions">
        <button className="btn" type="button" onClick={handleAccept}>
          Accept and start
        </button>
      </div>
    </div>
  );
}
