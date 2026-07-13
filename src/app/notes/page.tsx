"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Note = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [executedSql, setExecutedSql] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    const res = await fetch(
      `/api/notes/search?q=${encodeURIComponent(searchQuery)}`
    );
    const data = await res.json();
    setSearchResults(data.notes ?? []);
    setExecutedSql(data.sql_executed ?? "");
    setSearching(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewContent("");
      await fetchNotes();
    }
    setCreating(false);
  };

  const isInjection =
    searchResults !== null &&
    searchResults.some((n) => {
      const myNoteIds = notes.map((note) => note.id);
      return !myNoteIds.includes(n.id);
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
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
            <div className="flex-shrink-0 text-2xl mt-0.5">⚠️</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white uppercase tracking-widest">
                  Vulnerable
                </span>
                <span className="text-xs text-red-400 font-mono">OWASP A03 — SQL Injection via prisma.$queryRawUnsafe()</span>
              </div>
              <p className="text-sm text-red-200">
                The search below uses{" "}
                <code className="rounded bg-red-900/50 px-1.5 py-0.5 font-mono text-red-300">
                  $queryRawUnsafe()
                </code>{" "}
                with the query <strong>interpolated directly into SQL</strong>. The executed SQL is shown after each search so you can see the injection happen in real time.
              </p>
            </div>
          </div>
        </div>

        {/* How to exploit */}
        <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">
            🎯 How to exploit — SQL Injection payload
          </p>
          <div className="mb-3 rounded-lg border border-orange-500/20 bg-slate-900/60 px-4 py-2.5 font-mono text-base text-orange-300">
            {"' OR '1'='1"}
          </div>
          <p className="text-sm text-slate-400">
            Paste this into the search box. It escapes the{" "}
            <code className="text-slate-300">LIKE '...%'</code> string and injects a always-true condition,
            removing the <code className="text-slate-300">userId</code> filter and leaking{" "}
            <span className="text-orange-300 font-semibold">all notes from all users</span>.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Tip: Create notes as two different users first, then run the payload from either account — you&apos;ll see both users&apos; notes.
          </p>
        </div>

        {/* ── Vulnerable Search ── */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Search Notes</h2>
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
              SQLi vulnerable
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              id="sqli-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Try: normal text  OR  ' OR '1'='1`}
              className="flex-1 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-mono text-sm"
            />
            <button
              id="sqli-search-btn"
              type="submit"
              disabled={searching}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-60"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>

          {/* Executed SQL Display */}
          {executedSql && (
            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                SQL Executed on Server:
              </p>
              <code className="block text-xs font-mono text-yellow-300 leading-relaxed whitespace-pre-wrap break-all">
                {executedSql}
              </code>
            </div>
          )}

          {/* Injection Alert */}
          {isInjection && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3">
              <span className="text-xl">🚨</span>
              <div>
                <p className="text-sm font-bold text-red-300">SQL Injection Successful!</p>
                <p className="text-xs text-red-400 mt-0.5">
                  Results below include notes from <strong>other users</strong> — the userId filter was bypassed.
                </p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults !== null && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Results ({searchResults.length})
              </p>
              {searchResults.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">No results found.</p>
              )}
              {searchResults.map((note) => {
                const isOtherUser = !notes.some((n) => n.id === note.id);
                return (
                  <div
                    key={note.id}
                    className={`rounded-xl border p-4 ${
                      isOtherUser
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-slate-700/40 bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-white">{note.title}</p>
                      {isOtherUser && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white flex-shrink-0">
                          ⚠ Other User&apos;s Note
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{note.content}</p>
                    <p className="mt-2 font-mono text-xs text-slate-600">userId: {note.userId}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Create Note ── */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Create a Private Note</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title"
              required
              className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Note content — this is supposed to be private..."
              required
              rows={3}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60"
            >
              {creating ? "Saving..." : "Save Note"}
            </button>
          </form>
        </div>

        {/* ── My Notes ── */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">My Notes</h2>
          {loading && <p className="text-slate-500 text-sm">Loading...</p>}
          {!loading && notes.length === 0 && (
            <p className="text-slate-500 text-sm">No notes yet. Create one above.</p>
          )}
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                <p className="font-semibold text-white mb-1">{note.title}</p>
                <p className="text-sm text-slate-300">{note.content}</p>
                <p className="mt-2 font-mono text-xs text-slate-600">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── The Fix ── */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-bold text-green-400 uppercase tracking-widest">
              ✅ The Fix
            </span>
            <span className="text-xs text-slate-500">~30 seconds to explain</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Replace <code className="text-red-400 font-mono">$queryRawUnsafe()</code> with{" "}
            <code className="text-green-400 font-mono">$queryRaw</code> (tagged template) or the Prisma ORM API.
            Prisma escapes parameters automatically — user input can never alter query structure.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm font-mono leading-relaxed">
            <code>
              <span className="text-slate-500">{"// ❌ VULNERABLE — string interpolation\n"}</span>
              <span className="text-red-400">{"const sql = `SELECT * FROM Note\n"}</span>
              <span className="text-red-400">{"  WHERE userId = '${userId}'\n"}</span>
              <span className="text-red-400">{"  AND content LIKE '%${query}%'`;\n"}</span>
              <span className="text-red-400">{"await prisma.$queryRawUnsafe(sql);\n\n"}</span>
              <span className="text-slate-500">{"// ✅ FIXED — parameterized (Prisma ORM)\n"}</span>
              <span className="text-green-400">{"await prisma.note.findMany({\n"}</span>
              <span className="text-green-400">{"  where: {\n"}</span>
              <span className="text-green-400">{"    userId: userId,\n"}</span>
              <span className="text-green-400">{"    content: { contains: query },\n"}</span>
              <span className="text-green-400">{"  },\n"}</span>
              <span className="text-green-400">{"});"}</span>
            </code>
          </pre>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
}
