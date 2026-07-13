import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center px-4">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 mb-8 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          Powered by Better Auth &amp; Prisma
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
          Secure Auth,{" "}
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            done right.
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
          A Next.js starter with Better Auth, Prisma, and beautiful UI. Sign up
          or log in to explore the protected dashboard.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3.5 text-white font-semibold shadow-lg shadow-purple-900/40 transition-all duration-200 hover:shadow-purple-900/60 hover:scale-105 active:scale-100"
          >
            Get Started
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-slate-300 font-semibold backdrop-blur-sm transition-all duration-200 hover:border-purple-500/50 hover:text-white hover:bg-slate-800 active:scale-95"
          >
            View Dashboard
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: "🔐",
              title: "Email & Password",
              desc: "Secure credential-based authentication out of the box.",
            },
            {
              icon: "🗄️",
              title: "Prisma ORM",
              desc: "Type-safe database access with automatic migrations.",
            },
            {
              icon: "⚡",
              title: "Next.js 15",
              desc: "App Router, Server Components, and Middleware support.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
