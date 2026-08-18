"use client";

interface Props {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
  configured: boolean;
}

export default function SignInScreen({ onSignIn, loading, error, configured }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          t
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          tiimeo
        </h1>
        <p className="max-w-xs text-sm" style={{ color: "var(--text-secondary)" }}>
          A live countdown for what&apos;s happening now and what&apos;s next, synced from
          your Google Calendar.
        </p>
      </div>

      {!configured ? (
        <p className="max-w-xs text-sm" style={{ color: "var(--series-8)" }}>
          Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Set it in your environment and reload.
        </p>
      ) : (
        <button
          onClick={onSignIn}
          disabled={loading}
          className="rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          {loading ? "Connecting…" : "Connect Google Calendar"}
        </button>
      )}

      {error ? (
        <p className="max-w-xs text-sm" style={{ color: "var(--series-8)" }}>
          {error}
        </p>
      ) : null}

      <p className="max-w-xs text-xs" style={{ color: "var(--text-muted)" }}>
        Read-only access. Your calendar data stays in this browser tab.
      </p>
    </div>
  );
}
