"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Search, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white hover:text-white/90 transition-colors">
            <Search className="h-5 w-5 text-emerald-400" />
            Scout
          </Link>
          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-20 rounded-full bg-zinc-800 animate-pulse" />
            ) : session ? (
              <>
                <div className="flex items-center gap-2 text-stone-300">
                  <User className="h-4 w-4 text-stone-400" />
                  <span className="text-sm font-medium truncate max-w-[120px]">{session.user?.name || "User"}</span>
                </div>
                <button onClick={() => signOut().then(() => router.push("/login"))} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-white transition-colors border border-zinc-700 rounded-full px-3 py-1.5 hover:bg-zinc-800">
                  <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-stone-300 hover:text-white transition-colors">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}