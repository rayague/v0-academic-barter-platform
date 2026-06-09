"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

type NotificationRow = {
  id: string
  recipient_id: string
  actor_id: string | null
  type: string
  data: unknown
  read_at: string | null
  created_at: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key]
  return typeof v === "string" ? v : null
}

function formatDate(dateIso: string) {
  const d = new Date(dateIso)
  return d.toLocaleString("fr-FR")
}

export function NotificationsList({
  initialNotifications,
  userId,
}: {
  initialNotifications: NotificationRow[]
  userId: string
}) {
  const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications)
  const [selectedNotif, setSelectedNotif] = useState<NotificationRow | null>(null)
  const [actorProfile, setActorProfile] = useState<{
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null>(null)
  const [respondLoading, setRespondLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:list:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newRow = payload.new as NotificationRow
          setNotifications((prev) => [newRow, ...prev])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const updatedRow = payload.new as NotificationRow
          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedRow.id ? updatedRow : n))
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const markAsRead = async (id: string) => {
    const readAt = new Date().toISOString()

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: readAt } : n)),
    )

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id)
      .eq("recipient_id", userId)

    if (error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: null } : n)))
    }
  }

  const markAllAsRead = async () => {
    const readAt = new Date().toISOString()

    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id)
    if (unreadIds.length === 0) return

    setNotifications((prev) => prev.map((n) => (!n.read_at ? { ...n, read_at: readAt } : n)))

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("recipient_id", userId)
      .is("read_at", null)

    if (error) {
      setNotifications((prev) => prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read_at: null } : n)))
    }
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedNotif(null)
      setActorProfile(null)
    }
  }

  const respondToExchange = async (accept: boolean) => {
    if (!selectedNotif) return

    setRespondLoading(true)
    try {
      const data = isRecord(selectedNotif.data) ? selectedNotif.data : {}
      const exchangeId = getString(data, "exchange_id")

      if (!exchangeId) {
        throw new Error("Erreur: ID d'échange manquant")
      }

      // Mettre à jour l'échange
      const { error: updateError } = await supabase
        .from("exchanges")
        .update({
          status: accept ? "accepted" : "cancelled",
        })
        .eq("id", exchangeId)

      if (updateError) throw updateError

      // Créer une notification pour l'autre utilisateur
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          recipient_id: selectedNotif.actor_id,
          actor_id: userId,
          type: accept ? "exchange_accepted" : "exchange_rejected",
          data: {
            exchange_id: exchangeId,
            listing_id: getString(data, "listing_id"),
            listing_title: getString(data, "listing_title"),
          },
        })

      if (notifError) {
        console.error("Erreur lors de la notification de réponse:", notifError)
      }

      // Marquer comme lue et fermer
      await markAsRead(selectedNotif.id)
      setSelectedNotif(null)
      setActorProfile(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      console.error(message)
    } finally {
      setRespondLoading(false)
    }
  }

  const handleOpenResponseDialog = async (n: NotificationRow) => {
    setSelectedNotif(n)
    
    // Charger le profil du demandeur
    if (n.actor_id) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("id", n.actor_id)
          .single()

        setActorProfile(profile || null)
      } catch (err) {
        console.error("Erreur chargement profil:", err)
        setActorProfile(null)
      }
    }
  }

  const unreadCount = notifications.reduce((acc, n) => acc + (n.read_at ? 0 : 1), 0)

  if (!notifications.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Vous n'avez aucune notification pour le moment.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Tout est lu"}
          </p>
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Tout marquer comme lu
          </Button>
        </div>

        <div className="space-y-2">
          {notifications.map((n) => {
            const data = isRecord(n.data) ? n.data : {}
            const listingId = getString(data, "listing_id")
            const listingTitle = getString(data, "listing_title")

            let title = "Notification"
            let description = "Vous avez une nouvelle notification."
            let isProposal = false

            if (n.type === "exchange_proposed") {
              title = "Nouvelle proposition d'échange"
              description = `Quelqu'un a proposé un échange sur votre annonce${listingTitle ? ` : ${listingTitle}` : ""}.`
              isProposal = true
            } else if (n.type === "exchange_accepted") {
              title = "Proposition acceptée ✅"
              description = `Votre proposition d'échange a été acceptée pour : ${listingTitle || "l'annonce"}.`
            } else if (n.type === "exchange_rejected") {
              title = "Proposition refusée ❌"
              description = `Votre proposition d'échange a été refusée pour : ${listingTitle || "l'annonce"}.`
            } else if (n.type === "listing_published") {
              title = "Annonce publiée ✅"
              description = `Votre annonce "${listingTitle || ""}" a été publiée avec succès et est maintenant visible.`
            } else if (n.type === "new_message") {
              title = "Nouveau message"
              description = `Vous avez reçu un nouveau message${listingTitle ? ` concernant : ${listingTitle}` : ""}.`
            }

            const href = listingId ? `/listing/${listingId}` : "/dashboard"

            return (
              <div
                key={n.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 transition-colors cursor-pointer hover:bg-accent",
                  !n.read_at && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(n.created_at)}</p>

                    <div className="mt-3 flex items-center gap-2">
                      {isProposal ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenResponseDialog(n)}
                        >
                          Répondre
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={href}>Voir</Link>
                        </Button>
                      )}

                      {!n.read_at && !isProposal && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>

                  {!n.read_at && (
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dialog pour accepter/refuser */}
      <Dialog open={!!selectedNotif} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Répondre à la proposition d'échange</DialogTitle>
          <DialogDescription>
            Acceptez ou refusez cette offre d'échange
          </DialogDescription>
        </DialogHeader>

        {selectedNotif && isRecord(selectedNotif.data) && (
          <div className="space-y-4">
            {/* Section: Demandeur */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Demandeur</p>
              <div className="space-y-1">
                <p className="font-semibold text-base">
                  {actorProfile?.full_name || "Utilisateur"}
                </p>
                {actorProfile?.email && (
                  <p className="text-sm text-muted-foreground break-all">
                    📧 {actorProfile.email}
                  </p>
                )}
                {(getString(selectedNotif.data, "contact_email") || getString(selectedNotif.data, "contact_phone")) && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    <strong>Contact fourni:</strong> {getString(selectedNotif.data, "contact_email") || getString(selectedNotif.data, "contact_phone")}
                  </p>
                )}
              </div>
            </div>

            {/* Section: Offre d'échange */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Offre d'échange</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Votre annonce:</p>
                  <p className="font-medium text-base">
                    {getString(selectedNotif.data, "listing_title") || "Annonce"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Son offre:</p>
                  <p className="font-medium text-base">
                    {getString(selectedNotif.data, "proposed_article_id") 
                      ? `Article proposé (ID: ${getString(selectedNotif.data, "proposed_article_id")})`
                      : "Détails non disponibles"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => respondToExchange(false)}
                disabled={respondLoading}
              >
                {respondLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Refuser
              </Button>
              <Button
                className="flex-1"
                onClick={() => respondToExchange(true)}
                disabled={respondLoading}
              >
                {respondLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Accepter
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
