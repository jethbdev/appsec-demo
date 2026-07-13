import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-10">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white">AppSec Demo</span>
          </div>
          <SignOutButton />
        </header>

        {/* Welcome card */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-purple-900/40">
              {initials}
            </div>
            <div className="flex-1">
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Authenticated
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {user.name || "User"}!
              </h1>
              <p className="mt-1 text-slate-400">
                You&apos;re viewing a protected page. Only authenticated users
                can see this.
              </p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Email",
              value: user.email,
              icon: (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ),
            },
            {
              label: "User ID",
              value: user.id.slice(0, 8) + "…",
              icon: (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2"
                  />
                </svg>
              ),
            },
            {
              label: "Member Since",
              value: joinedDate,
              icon: (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                {item.icon}
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 font-semibold text-white truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>


        {/* ═══ AppSec Demo Vulnerabilities ═══ */}
        <div className="mt-6 rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-lg">
              🔓
            </div>
            <div>
              <h2 className="font-bold text-white">AppSec Demo — Intentional Vulnerabilities</h2>
              <p className="text-xs text-slate-500 mt-0.5">Educational only. These vulnerabilities are deliberately introduced for demonstration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* IDOR Card */}
            <a
              href={`/profile/${user.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-red-500/30 bg-slate-900/60 p-5 transition-all duration-200 hover:border-red-400/60 hover:bg-red-500/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/15 text-xl">
                  🔁
                </div>
                <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                  OWASP A01
                </span>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">IDOR — Broken Access Control</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  View your profile, then swap the ID in the URL to see another user&apos;s private data. No auth check on the server.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-red-400 group-hover:text-red-300 transition-colors mt-auto">
                Try it now
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>

            {/* SQL Injection Card */}
            <a
              href="/notes"
              className="group flex flex-col gap-3 rounded-xl border border-orange-500/30 bg-slate-900/60 p-5 transition-all duration-200 hover:border-orange-400/60 hover:bg-orange-500/5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-xl">
                  💉
                </div>
                <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                  OWASP A03
                </span>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">SQL Injection — Data Exfiltration</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Create private notes, then inject{" "}
                  <code className="font-mono text-orange-300">{"' OR '1'='1"}</code>{" "}
                  into the search to leak all users&apos; notes via <code className="font-mono text-orange-300">$queryRawUnsafe()</code>.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-400 group-hover:text-orange-300 transition-colors mt-auto">
                Try it now
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
