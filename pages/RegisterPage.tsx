import React, { useState, useEffect } from "react"
import PortalSDK from "@stacker/portal-sdk"
import { Loader2, CheckCircle, Mail, User, ArrowRight, AlertCircle, Search, Lock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type RegisterStatus = "idle" | "loading" | "success" | "already_registered" | "error"

export default function RegisterPage() {
  const { navigate } = PortalSDK.useRouter()
  const { user, isLoading: authLoading } = PortalSDK.useCurrentUser()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<RegisterStatus>("idle")
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
      const fields: Record<string, unknown> = { username: username.trim() }
      if (password.trim()) { fields.password = password.trim() }

      const result = await PortalSDK.register(email, fields)

      if (result.success) {
        await PortalSDK.requestMagicLink(email)
        setStatus("success")
      } else {
        const errorResult = result as { code?: string; error?: string }
        if (errorResult.code === "EMAIL_ALREADY_EXISTS") {
          await PortalSDK.requestMagicLink(email)
          setStatus("already_registered")
        } else if (errorResult.code === "REGISTRATION_DISABLED") {
          setStatus("error")
          setErrorMessage("Registration is not available at this time.")
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
    setUsername("")
    setPassword("")
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
          <p className="text-sm text-stone-400 mt-1">Create your account</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          {status === "success" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account created!</h2>
              <p className="text-stone-400 text-sm mb-2">We've sent a sign-in link to</p>
              <p className="font-semibold text-white mb-6 break-all">{email}</p>
              <div className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-4 mb-6">
                <p className="text-sm text-emerald-300">Click the link in your email to sign in. The link expires in 15 minutes.</p>
              </div>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Use a different email</Button>
            </div>
          )}

          {status === "already_registered" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-5">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You already have an account</h2>
              <p className="text-stone-400 text-sm mb-2">We've sent a sign-in link to</p>
              <p className="font-semibold text-white mb-6">{email}</p>
              <div className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-4 mb-6">
                <p className="text-sm text-blue-300">Click the link in your email to sign in. The link expires in 15 minutes.</p>
              </div>
              <Button onClick={() => navigate("login")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Back to sign in</Button>
            </div>
          )}

          {status === "error" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-stone-400 text-sm mb-6">{errorMessage || "We couldn't create your account."}</p>
              <Button onClick={resetForm} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Try again</Button>
            </div>
          )}

          {(status === "idle" || status === "loading") && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-white">Create your account</h2>
                <p className="text-sm text-stone-400 mt-1">Get started in a few seconds</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-stone-300">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={status === "loading"} placeholder="scout_user" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:ring-emerald-500/20" autoFocus />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-stone-300">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={status === "loading"} placeholder="you@example.com" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:ring-emerald-500/20" autoComplete="email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={status === "loading"} placeholder="••••••••" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:ring-emerald-500/20" autoComplete="new-password" />
                  </div>
                </div>

                <Button type="submit" disabled={status === "loading" || !email || !username || !password} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2">
                  {status === "loading" ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>) : (<><span>Create account</span><ArrowRight className="h-4 w-4" /></>)}
                </Button>
              </form>

              <p className="text-xs text-stone-500 text-center mt-4">After creating your account, we'll send you a magic link to sign in.</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            Already have an account? <button type="button" onClick={() => navigate("login")} className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}