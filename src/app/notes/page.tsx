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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl" />
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

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Search Notes</h2>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="flex-1 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              id="search-btn"
              type="submit"
              disabled={searching}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60"
            >
              {searching ? "..." : "Search"}
            </button>
          </form>

          {searchResults !== null && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Results ({searchResults.length})
              </p>
              {searchResults.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">No results found.</p>
              )}
              {searchResults.map((note) => (
                <div key={note.id} className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                  <p className="font-semibold text-white mb-1">{note.title}</p>
                  <p className="text-sm text-slate-300">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Note */}
        <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Create a Note</h2>
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
              placeholder="Note content..."
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
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {/* My Notes */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 backdrop-blur-xl">
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
      </div>
    </main>
  );
}
