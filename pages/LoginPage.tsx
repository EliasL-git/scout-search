import React, { useState, useEffect } from "react"
import PortalSDK from "@stacker/portal-sdk"
import { Loader2, CheckCircle, Mail, ArrowRight, AlertCircle, XCircle, Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type LoginStatus = "idle" | "loading" | "success" | "not_found" | "inactive" | "error"

export default function LoginPage() {
  const { navigate } = PortalSDK.useRouter()
  const { user, isLoading: authLoading } = PortalSDK.useCurrentUser()

  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<LoginStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      navigate("home")
    }
  }, [authLoading, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setStatus("loading")

    try {
      const result = await PortalSDK.requestMagicLink(email)

      if (result.success) {
        setStatus("success")
      } else {
        const errorResult = result as { code?: string; error?: string }
        if (errorResult.code === "EMAIL_NOT_FOUND") {
          setStatus("not_found")
        } else if (errorResult.code === "ACCOUNT_INACTIVE") {
          setStatus("inactive")
          setErrorMessage(errorResult.error || "Your account is not active.")
        } else {
          setStatus("error")
          setErrorMessage(errorResult.error || "Something went wrong. Please try again.")
        }
      }
    } catch (_err) {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
    }
  }

  const resetForm = () => {
    setStatus("idle")
    setEmail("")
    setErrorMessage(null)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-5">
            <Search className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Scout</h1>
          <p className="text-sm text-stone-400 mt-1">Sign in to search the web</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          {status === "success" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-stone-400 text-sm mb-2">We've sent a sign-in link to</p>
              <p className="font-semibold text-white mb-6 truncate">{email}</p>
              <div className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-4 mb-6">
                <p className="text-sm text-emerald-300">
                  Click the link in your email to sign in. The link expires in 15 minutes.
                </p>
              </div>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Use a different email
              </Button>
            </div>
          )}

          {status === "not_found" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto mb-5">
                <XCircle className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account not found</h2>
              <p className="text-stone-400 text-sm mb-2">We couldn't find an account for</p>
              <p className="font-semibold text-white mb-6">{email}</p>
              <div className="rounded-xl bg-amber-600/10 border border-amber-500/20 p-4 mb-6">
                <p className="text-sm text-amber-300">
                  Don't have an account? <button type="button" onClick={() => navigate("register")} className="underline font-medium hover:text-amber-200">Create one here</button>.
                </p>
              </div>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Try again
              </Button>
            </div>
          )}

          {status === "inactive" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account inactive</h2>
              <p className="text-stone-400 text-sm mb-6">{errorMessage || "Your account is not currently active."}</p>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Try a different email</Button>
            </div>
          )}

          {status === "error" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-stone-400 text-sm mb-6">{errorMessage || "We couldn't process your request."}</p>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Try again</Button>
            </div>
          )}

          {(status === "idle" || status === "loading") && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white">Welcome back</h2>
                <p className="text-sm text-stone-400 mt-1">Enter your email to sign in instantly</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-300">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={status === "loading"} placeholder="you@example.com" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:ring-emerald-500/20" autoComplete="email" autoFocus />
                  </div>
                </div>
                <Button type="submit" disabled={status === "loading" || !email} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2">
                  {status === "loading" ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending link...</>) : (<><span>Sign in</span><ArrowRight className="h-4 w-4" /></>)}
                </Button>
              </form>
              <p className="text-xs text-stone-500 text-center mt-4">We'll send you a magic link for instant, password-free sign in.</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            Don't have an account? <button type="button" onClick={() => navigate("register")} className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  )
}