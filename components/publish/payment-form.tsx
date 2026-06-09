"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Check, Lock, Smartphone, AlertCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 120000

interface PaymentFormProps {
  userId: string
  listingId: string
}

type PaymentState = "idle" | "initiating" | "waiting_confirmation" | "completed" | "error"

export function PaymentForm({ userId, listingId }: PaymentFormProps) {
  const router = useRouter()
  const [state, setState] = useState<PaymentState>("idle")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }, [])

  const checkPaymentStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/payments/status?payment_id=${id}`)
      if (!res.ok) return

      const data = await res.json()

      if (data.payment?.status === "completed" && data.listingActive) {
        stopPolling()
        setState("completed")
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      console.error("Erreur vérification statut paiement:", err)
    }
  }, [router, stopPolling])

  const startPolling = useCallback((id: string) => {
    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus(id)
    }, POLL_INTERVAL)

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling()
      setState("error")
      setErrorMessage("Le paiement a pris trop de temps. Veuillez réessayer.")
    }, POLL_TIMEOUT)

    // Simulation automatique après 8 secondes (remplacer par l'appel API MTN réel)
    setTimeout(async () => {
      try {
        const res = await fetch("/api/payments/simulate-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: id }),
        })
        if (!res.ok) {
          const data = await res.json()
          console.error("Erreur simulation auto:", data.error || res.statusText)
        }
      } catch (err) {
        console.error("Erreur simulation auto:", err)
      }
    }, 8000)
  }, [checkPaymentStatus, stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const handlePayment = async () => {
    const phone = phoneNumber.trim()
    if (!phone || !/^\+?\d{7,15}$/.test(phone.replace(/[\s\-]/g, ''))) {
      setErrorMessage("Veuillez entrer un numéro MTN valide")
      return
    }

    setState("initiating")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/payments/initiate-mtn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, phoneNumber: phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur d'initiation du paiement")
      }

      setPaymentId(data.paymentId)
      setState("waiting_confirmation")
      startPolling(data.paymentId)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur inattendue s'est produite"
      setErrorMessage(message)
      setState("error")
    }
  }

  const simulateConfirmation = useCallback(async () => {
    if (!paymentId) return
    try {
      await fetch("/api/payments/simulate-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      })
    } catch (err) {
      console.error("Erreur simulation confirmation:", err)
    }
  }, [paymentId])

  const retryPayment = () => {
    stopPolling()
    setState("idle")
    setErrorMessage(null)
    setPaymentId(null)
  }

  if (state === "completed") {
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
      {state === "error" && (
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{errorMessage || "Une erreur est survenue"}</p>
            <Button variant="outline" size="sm" onClick={retryPayment} className="mt-2">
              Réessayer
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
          <span className="font-medium">Microtaxe de publication</span>
          <span className="text-lg font-bold">1 FCFA</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Cette microtaxe permet de maintenir la qualité de la plateforme.</span>
        </div>
      </div>

      <div className="rounded-xl border border-primary bg-primary/5 p-4 ring-1 ring-primary">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
            <Smartphone className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <span className="block font-medium">MTN Mobile Money</span>
            <span className="text-xs text-muted-foreground">Paiement sécurisé via MTN</span>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Numéro MTN Mobile Money
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="+229 XX XX XX XX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={state !== "idle"}
            className="pl-10"
          />
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={state === "initiating" || state === "waiting_confirmation" || (state === "idle" && !phoneNumber.trim())}
        className="w-full gap-2"
        size="lg"
      >
        {state === "initiating" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initialisation...
          </>
        ) : state === "waiting_confirmation" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmation en cours...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Payer 1 FCFA avec MTN
          </>
        )}
      </Button>

      {state === "waiting_confirmation" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-700">
            <p>Une demande de confirmation a été envoyée sur votre téléphone MTN.</p>
            <p className="mt-1 text-xs">Veuillez confirmer le paiement via votre téléphone dans les 2 minutes.</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3 text-center">
            <p className="text-xs text-blue-700 mb-2">
              Mode simulation — pas de clé API MTN configurée.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateConfirmation}
              className="gap-2"
            >
              Simuler la confirmation
            </Button>
          </div>
        </motion.div>
      )}

      {state === "idle" && (
        <p className="text-center text-xs text-muted-foreground">
          Une demande de confirmation sera envoyée sur votre numéro MTN.
        </p>
      )}
    </motion.div>
  )
}