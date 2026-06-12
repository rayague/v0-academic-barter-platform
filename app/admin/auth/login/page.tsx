"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DyoLogo } from "@/components/dyo-logo"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Login with Supabase auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Email ou mot de passe incorrect")
        return
      }

      // Check if user is admin via profiles.is_admin
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user?.id)
        .single()

      if (profileError || !profileData?.is_admin) {
        await supabase.auth.signOut()
        setError("Accès refusé - Vous n'êtes pas administrateur")
        return
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch (err) {
      setError("Une erreur inattendue s'est produite")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 mesh-gradient opacity-50" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <div className="flex items-center gap-2">
                <DyoLogo size="lg" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                  <Lock className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Admin Portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Connectez-vous à votre compte administrateur
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mot de passe</label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Pas d'accès administrateur ?{" "}
                <Link
                  href="/"
                  className="font-medium text-primary hover:underline"
                >
                  Retour à l'accueil
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2024 DYO Admin Panel. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
