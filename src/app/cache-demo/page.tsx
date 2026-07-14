"use client";

import { useState } from "react";
import Link from "next/link";

export default function CacheDemoPage() {
  const [headerVal, setHeaderVal] = useState("");
  const [frameUrl, setFrameUrl] = useState("/api/cache-demo");
  const [reloadKey, setReloadKey] = useState(0);

  const triggerSearch = (isPoison: boolean) => {
    // We fetch the API with or without the custom header
    const headers: HeadersInit = {};
    if (isPoison) {
      headers["X-Custom-Header"] = headerVal || "<script>alert('Cache Poisoned!')</script>";
    }

    fetch("/api/cache-demo", { headers })
      .then((res) => {
        // Reload iframe to see current cache state
        setReloadKey((prev) => prev + 1);
      });
  };

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100">
      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* Vulnerability Banner */}
        <div className="mb-6 rounded-2xl border-2 border-red-500/60 bg-red-500/10 p-5 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="text-2xl mt-0.5">⚠️</div>
            <div className="flex-1">
              <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white uppercase tracking-widest mr-2">
                Vulnerable
              </span>
              <span className="text-xs text-red-400 font-mono">OWASP A06 — Web Cache Poisoning / XSS</span>
              <p className="text-sm text-red-200 mt-2">
                The cache engine ignores the request header <code className="bg-red-950 px-1 py-0.5 rounded text-red-300">X-Custom-Header</code> but the page reflects it in the HTML.
              </p>
            </div>
          </div>
        </div>

        {/* Live Playground */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Cache Controller</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                  Poisoning Payload Header (X-Custom-Header)
                </label>
                <input
                  type="text"
                  value={headerVal}
                  onChange={(e) => setHeaderVal(e.target.value)}
                  placeholder="<img src=x onerror=alert('XSS')>"
                  className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-white placeholder-slate-600 outline-none transition focus:border-red-500 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => triggerSearch(true)}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-500 transition active:scale-95"
                >
                  Send Poison Request
                </button>
                <button
                  onClick={() => triggerSearch(false)}
                  className="flex-1 rounded-xl bg-slate-700 py-2.5 font-semibold text-white hover:bg-slate-600 transition active:scale-95"
                >
                  Normal User Visit
                </button>
              </div>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="font-bold text-slate-400">Step-by-step Exploit:</p>
                <p>1. Type a script/image payload in the input above.</p>
                <p>2. Click <span className="text-red-400 font-semibold">Send Poison Request</span> (caches the payload).</p>
                <p>3. Click <span className="text-slate-300 font-semibold">Normal User Visit</span> (fetches from cache without sending any header).</p>
                <p>4. Observe the Alert dialog executing on the user page!</p>
              </div>
            </div>
          </div>

          {/* Simulated User Browser Frame */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 flex flex-col h-[340px]">
            <h2 className="text-lg font-semibold text-white mb-2">User Web Page (Live Cache Frame)</h2>
            <iframe
              key={reloadKey}
              src={frameUrl}
              className="w-full flex-1 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>

        {/* The Fix Code */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-bold text-green-400 uppercase tracking-widest">
              ✅ The Fix
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            To prevent cache poisoning, any headers reflected in the cached response must be part of the cache key:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm font-mono leading-relaxed">
            <code>
              <span className="text-slate-500">{"// ❌ Vulnerable (unkeyed header)\n"}</span>
              <span className="text-red-400">{"const cacheKey = url.pathname;\n\n"}</span>
              <span className="text-slate-500">{"// ✅ Fixed (keyed header)\n"}</span>
              <span className="text-green-400">{"const customHeader = request.headers.get('X-Custom-Header') || 'Default';\n"}</span>
              <span className="text-green-400">{"const cacheKey = `${url.pathname}::${customHeader}`;"}</span>
            </code>
          </pre>
        </div>
      </div>
    </main>
  );
}
