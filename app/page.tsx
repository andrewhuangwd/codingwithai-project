"use client";
import { api } from "@/convex/_generated/api";
import { HomeDashboard } from "@/components/HomeDashboard";
import { NameSetupForm } from "@/components/NameSetupForm";
import { OnboardingDiagnostic } from "@/components/OnboardingDiagnostic";
import { useQuery } from "convex/react";

export default function HomePage() {
  const user = useQuery(api.users.getFirstUser);
  const profile = useQuery(
    api.onboarding.getByUser,
    user ? { userId: user._id } : "skip",
  );

  // Loading state
  if (user === undefined) {
    return (
      <main className="appShell">
        <div className="panel centered">
          <p>Loading…</p>
        </div>
      </main>
    );
  }

  // No user yet — show setup form
  if (user === null) {
    return (
      <main className="appShell">
        <NameSetupForm onCreated={() => {}} />
      </main>
    );
  }

  // User exists but profile loading
  if (profile === undefined) {
    return (
      <main className="appShell">
        <div className="panel centered">
          <p>Loading…</p>
        </div>
      </main>
    );
  }

  // User exists but no Day Zero profile — show onboarding
  if (profile === null) {
    return (
      <main className="appShell">
        <OnboardingDiagnostic userId={user._id} onComplete={() => {}} />
      </main>
    );
  }

  // Fully set up — show dashboard
  return <HomeDashboard userId={user._id} pluralName={user.pluralName} />;
}
