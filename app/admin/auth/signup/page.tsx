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

export default function AdminSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message || "Erreur lors de la création du compte")
        return
      }

      if (authData.user) {
        // Create admin profile
        const { error: adminError } = await supabase
          .from("admins")
          .insert({
            user_id: authData.user.id,
            email,
            full_name: fullName,
            role: "moderator", // New admins start as moderators
            is_active: false, // Must be activated by super admin
          })

        if (adminError) {
          console.error("Admin profile error:", adminError)
          setError("Erreur lors de la création du profil administrateur")
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push("/admin/auth/login?message=signup_pending")
        }, 2000)
      }
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
              <h1 className="text-2xl font-bold">Créer un Compte Admin</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Demande d'accès administrateur
              </p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-green-500/10 p-4 text-center"
              >
                <p className="text-sm text-green-600">
                  ✓ Inscription réussie ! Redirection...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
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
                  <label className="text-sm font-medium">Nom Complet</label>
                  <Input
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="mt-1.5"
                    required
                  />
                </div>

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

                <div>
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="mt-1.5"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      Créer un Compte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Déjà inscrit ?{" "}
                <Link
                  href="/admin/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
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
