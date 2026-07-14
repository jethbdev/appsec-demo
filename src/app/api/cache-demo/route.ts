import { NextRequest, NextResponse } from "next/server";

// Simulated in-memory cache representing a CDN/proxy cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, { body: string; headers: HeadersInit; expiry: number }>();

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  // ❌ VULNERABILITY: The cache key only checks the URL path.
  // It completely ignores the X-Custom-Header when choosing what response to cache.
  const cacheKey = url.pathname;

  const now = Date.now();
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expiry > now) {
    return new NextResponse(cached.body, {
      headers: {
        "Content-Type": "text/html",
        "X-Cache": "HIT",
      },
    });
  }

  // Reflect an unkeyed header into the cached HTML
  const customHeader = request.headers.get("X-Custom-Header") || "Guest Guest";

  // Vulnerable HTML response reflecting unsanitized input
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Web Cache Poisoning Demo</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div class="w-full max-w-xl rounded-2xl border-2 border-red-500/40 bg-red-500/5 p-6 shadow-2xl backdrop-blur-xl">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">⚠️</span>
            <div>
              <h1 class="text-xl font-bold text-white">Web Cache Poisoning Demo (OWASP A06)</h1>
              <p class="text-xs text-red-400 font-mono">Unkeyed Input Reflected in Cache</p>
            </div>
          </div>
          
          <div class="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm mb-4">
            <p><span class="text-slate-500">Cache Status:</span> <span class="text-yellow-400 font-bold">MISS</span></p>
            <p><span class="text-slate-500">Cache Key:</span> <span class="text-purple-300">${cacheKey}</span></p>
            <p><span class="text-slate-500">Reflected Header:</span> <span class="text-emerald-400">${customHeader}</span></p>
          </div>

          <div class="text-sm text-slate-400 space-y-2">
            <p class="font-bold text-slate-300">Target Behavior:</p>
            <p>If you refresh this page within 30 seconds, it will return a <span class="text-yellow-400 font-semibold">HIT</span> and serve the cached HTML below.</p>
            <p>If an attacker sends a request first with an XSS script in <code class="bg-slate-800 text-slate-300 px-1 py-0.5 rounded">X-Custom-Header</code>, the cache gets poisoned, and subsequent users will execute the script.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Cache the response for 30 seconds
  cache.set(cacheKey, {
    body: htmlResponse.replace("MISS", "HIT"), // Cached versions show "HIT"
    headers: { "Content-Type": "text/html" },
    expiry: now + 30000,
  });

  return new NextResponse(htmlResponse, {
    headers: {
      "Content-Type": "text/html",
      "X-Cache": "MISS",
    },
  });
}
