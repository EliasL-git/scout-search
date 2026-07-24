"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Search, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn.email({ email, password });
    if (result.error) { setError(result.error.message || "Invalid email or password"); setLoading(false); }
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-5"><Search className="h-7 w-7 text-emerald-400" /></Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Scout</h1>
          <p className="text-sm text-stone-400 mt-1">Sign in to your account</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} placeholder="you@example.com" className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" autoFocus autoComplete="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder="********" className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" autoComplete="current-password" />
              </div>
            </div>
            {error && <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" /><p className="text-sm text-red-200">{error}</p></div>}
            <button type="submit" disabled={loading || !email || !password} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium flex items-center justify-center gap-2 transition-colors">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}</button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-stone-500">Don&apos;t have an account? <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">Sign up</Link></p>
      </div>
    </div>
  );
}