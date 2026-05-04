"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, Loader2, Check, Lock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface PaymentFormProps {
  userId: string
  listingId: string
}

export function PaymentForm({ userId, listingId }: PaymentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!selectedMethod) return
    setLoading(true)

    try {
      const supabase = createClient()

      // Étape 1: Créer un paiement
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          listing_id: listingId,
          amount: 50,
          currency: "XOF",
          status: "completed", // Simulé pour l'instant - en production: 'pending' puis confirmation
          provider: selectedMethod,
        })
        .select("id")
        .single()

      if (paymentError) {
        throw paymentError
      }

      // Étape 2: Mettre à jour le statut de l'annonce à 'active'
      const { error: updateError } = await supabase
        .from("listings")
        .update({ status: "active" })
        .eq("id", listingId)
        .eq("user_id", userId)

      if (updateError) {
        throw updateError
      }

      // Étape 3: Créer une notification pour l'utilisateur
      await supabase.from("notifications").insert({
        recipient_id: userId,
        type: "listing_published",
        data: {
          listing_id: listingId,
          payment_id: payment?.id,
        },
      })

      // Succès
      setSuccess(true)
      
      // Rediriger vers le tableau de bord après 2s
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue"
      console.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Félicitations, votre annonce est en ligne !</h2>
        <p className="text-muted-foreground">
          Votre paiement a été confirmé. Redirection vers votre tableau de bord...
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 rounded-2xl border border-border bg-card p-6"
    >
      {/* Détails du paiement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
          <span className="font-medium">Publication d&apos;annonce</span>
          <span className="text-lg font-bold">50 FCFA</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Paiement sécurisé. Cette microtaxe permet de maintenir la qualité de la plateforme.</span>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Choisissez votre mode de paiement</p>
        
        <div className="grid gap-3">
          {/* Mobile Money - priorité pour l'Afrique */}
          <button
            type="button"
            onClick={() => setSelectedMethod("mobile_money")}
            disabled={loading}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedMethod === "mobile_money"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Smartphone className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <span className="block font-medium">Mobile Money</span>
              <span className="text-xs text-muted-foreground">MTN, Orange Money, Wave</span>
            </div>
            {selectedMethod === "mobile_money" && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>

          {/* Carte Bancaire */}
          <button
            type="button"
            onClick={() => setSelectedMethod("card")}
            disabled={loading}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              selectedMethod === "card"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <span className="block font-medium">Carte Bancaire</span>
              <span className="text-xs text-muted-foreground">Visa, Mastercard</span>
            </div>
            {selectedMethod === "card" && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bouton de confirmation */}
      <Button
        onClick={handlePayment}
        disabled={!selectedMethod || loading}
        className="w-full gap-2"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Validation en cours...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Payer 50 FCFA
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En validant, vous acceptez les conditions d&apos;utilisation. 
        Une demande de confirmation sera envoyée sur votre téléphone.
      </p>
    </motion.div>
  )
}
