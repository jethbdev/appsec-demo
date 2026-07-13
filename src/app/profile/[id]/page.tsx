"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
    fetchProfile(params.id);
  }, [params.id]);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch profile");
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 px-4 py-10">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* ═══ VULNERABILITY BANNER ═══ */}
        <div className="mb-6 rounded-2xl border-2 border-red-500/60 bg-red-500/10 p-5 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white uppercase tracking-widest">
                  Vulnerable
                </span>
                <span className="text-xs text-red-400 font-mono">OWASP A01 — Broken Access Control / IDOR</span>
              </div>
              <p className="text-sm text-red-200 mt-2">
                This page fetches{" "}
                <code className="rounded bg-red-900/50 px-1.5 py-0.5 font-mono text-red-300">
                  /api/users/[id]
                </code>{" "}
                with <strong>no ownership check</strong>. Any authenticated user can change the ID in the URL to view any other user's profile.
              </p>
            </div>
          </div>
        </div>

        {/* How to exploit */}
        <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">
            🎯 How to exploit — live demo steps
          </p>
          <ol className="space-y-1.5 text-sm text-slate-300 list-decimal list-inside">
            <li>Note the User ID shown below (this is your own profile).</li>
            <li>Register a second account in another browser tab.</li>
            <li>Copy that second user's ID from their dashboard.</li>
            <li>Replace the ID in the URL above with the second user's ID.</li>
            <li>
              You are now reading{" "}
              <span className="text-orange-300 font-semibold">someone else's data</span> — without their permission.
            </li>
          </ol>
        </div>

        {/* Current URL display */}
        <div className="mb-6 rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 font-mono text-sm text-slate-400">
          <span className="text-slate-600">GET </span>
          <span className="text-purple-400">{url || "loading..."}</span>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-white">User Profile</h1>
            <span className="ml-auto rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
              No access control
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <svg className="h-6 w-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching user data...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {profile && (
            <div className="space-y-4">
              {[
                { label: "User ID", value: profile.id, mono: true },
                { label: "Name", value: profile.name },
                { label: "Email", value: profile.email },
                { label: "Member Since", value: new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">{field.label}</p>
                  <p className={`text-white font-medium ${field.mono ? "font-mono text-sm" : ""}`}>{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The Fix */}
        <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-bold text-green-400 uppercase tracking-widest">
              ✅ The Fix
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Add a single ownership check on the server before returning data. The secure endpoint at{" "}
            <code className="rounded bg-green-900/30 px-1.5 py-0.5 font-mono text-green-300 text-xs">
              /api/users/[id]/secure
            </code>{" "}
            returns{" "}
            <span className="text-green-300 font-semibold">403 Forbidden</span> if the session user doesn't match the requested ID.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm font-mono leading-relaxed">
            <code>
              <span className="text-slate-500">{"// ❌ Vulnerable (no check)\n"}</span>
              <span className="text-red-400">{"const user = await prisma.user.findUnique({ where: { id } });\n\n"}</span>
              <span className="text-slate-500">{"// ✅ Fixed (ownership enforced)\n"}</span>
              <span className="text-green-400">{"if (session.user.id !== id) {\n"}</span>
              <span className="text-green-400">{"  return NextResponse.json(\n"}</span>
              <span className="text-green-400">{'    { error: "Forbidden" }, { status: 403 }\n'}</span>
              <span className="text-green-400">{"  );\n"}</span>
              <span className="text-green-400">{"}\n"}</span>
              <span className="text-slate-300">{"const user = await prisma.user.findUnique({ where: { id } });"}</span>
            </code>
          </pre>
        </div>
      </div>
    </main>
  );
}
