import React from "react"
import PortalSDK, { Link } from "@stacker/portal-sdk"
import { LogOut, User } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function Header() {
  const { user, hasRealUser, isLoading } = PortalSDK.useCurrentUser()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="home" className="text-xl font-semibold tracking-tight text-white hover:text-white/90 transition-colors">
            Scout
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-20 rounded-full bg-zinc-800 animate-pulse" />
            ) : hasRealUser ? (
              <>
                <div className="flex items-center gap-2 text-stone-300">
                  <User className="h-4 w-4 text-stone-400" />
                  <span className="text-sm font-medium truncate max-w-[120px]">{user?.name || "—"}</span>
                </div>
                <Button onClick={() => PortalSDK.logout()} variant="outline" size="sm" className="border-zinc-700 text-stone-300 hover:text-white hover:bg-zinc-800 gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link to="login" className="text-sm font-medium text-stone-300 hover:text-white transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}