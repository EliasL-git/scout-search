"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import { Search, Loader2, AlertCircle, LogIn, ExternalLink } from "lucide-react";
import { Header } from "@/components/header";
import Link from "next/link";

interface SearchResult { title: string; url: string; snippet: string }

async function searchDuckDuckGo(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`DuckDuckGo returned ${resp.status}`);
  const html = await resp.text();
  const results: SearchResult[] = [];
  const rowRegex = /<tr[^>]*>.*?<\/tr>/gis;
  const rows = html.match(rowRegex) || [];
  for (const row of rows) {
    if (row.includes("ad_domain=")) continue;
    const linkMatch = row.match(/<a[^>]+href=["']([^"']*uddg=[^"']+)["'][^>]*>(.*?)<\/a>/is);
    if (!linkMatch) continue;
    const urlMatch = linkMatch[1].match(/[?&]uddg=([^&]+)/i);
    if (!urlMatch) continue;
    const resultUrl = decodeURIComponent(urlMatch[1]);
    const title = linkMatch[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const snippetMatch = row.match(/<td[^>]+class=['"]result-snippet['"][^>]*>(.*?)<\/td>/is);
    const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
    results.push({ title, url: resultUrl, snippet });
  }
  return results;
}

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSearch(e?: FormEvent) {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setIsLoading(true); setError(null); setHasSearched(true);
    try { setResults(await searchDuckDuckGo(trimmed, ctrl.signal)); }
    catch (err) { if (err instanceof DOMException && err.name === "AbortError") return; setResults([]); setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { return () => abortRef.current?.abort(); }, []);

  if (isPending) return <div className="min-h-screen"><Header /><div className="min-h-[calc(100vh-8rem)] flex items-center justify-center pt-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div></div>;

  if (!session) {
    return <div className="min-h-screen"><Header /><div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center pt-16 pb-12 px-4"><div className="w-full max-w-md mx-auto text-center"><div className="mb-8"><h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">Scout</h1><p className="text-lg text-stone-400">Free web search and scrape</p></div><div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 mb-6"><p className="text-stone-300 mb-6">Sign in to start searching the web.</p><Link href="/login" className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"><LogIn className="h-4 w-4" />Sign in</Link></div><p className="text-sm text-stone-500">Don&apos;t have an account? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">Sign up</Link></p></div></div></div>;
  }

  return <div className="min-h-screen"><Header /><div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center pt-16 pb-12"><div className="w-full max-w-2xl mx-auto text-center px-4"><div className="mb-10"><h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-3">Scout</h1><p className="text-lg text-stone-400">Free web search and scrape</p></div><form onSubmit={handleSearch} className="relative mb-8"><div className="relative flex items-center"><input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for anything..." className="w-full h-14 pl-5 pr-28 text-base md:text-lg rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xl" autoFocus disabled={isLoading} /><button type="submit" disabled={isLoading || !query.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button></div></form>{error && <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" /><p className="text-sm text-red-200">{error}</p></div>}{isLoading && <div className="flex items-center justify-center gap-2 text-stone-400 py-8"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Searching the web...</span></div>}{!isLoading && hasSearched && results.length === 0 && !error && <p className="text-stone-500 py-8">No results found.</p>}{!isLoading && results.length > 0 && <div className="text-left space-y-4 mt-4">{results.map((r, i) => <article key={`${r.url}-${i}`} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"><a href={r.url || "#"} target="_blank" rel="noopener noreferrer" className="group block"><h2 className="text-lg font-medium text-blue-400 group-hover:text-blue-300 group-hover:underline mb-1 truncate">{r.title || "Untitled"}</h2><p className="text-sm text-emerald-500 mb-2 truncate flex items-center gap-1">{r.url || "No URL"}<ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p></a>{r.snippet && <p className="text-sm text-stone-300 leading-relaxed line-clamp-3">{r.snippet}</p>}</article>)}</div>}</div></div></div>;
}