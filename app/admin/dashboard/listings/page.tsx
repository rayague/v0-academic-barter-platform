"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, CheckCircle, X, Loader2, ThumbsUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Listing {
  id: string
  title: string
  user_id: string
  status: string
  created_at: string
  condition: string
  exchange_type: string
  city: string
  views: number
  profiles?: { full_name: string; email: string }
}

export default function AdminListingsPage() {
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("listings")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setListings(data || [])
    } catch (err) {
      console.error("Error fetching listings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setUpdating(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("listings")
        .update({ status: "active" })
        .eq("id", id)

      if (error) throw error

      toast({ title: "Annonce approuvée", description: "L'annonce est maintenant visible sur la plateforme." })
      setListings(listings.map(l => l.id === id ? {...l, status: "active"} : l))
    } catch (err) {
      console.error("Error approving listing:", err)
      toast({ title: "Erreur", description: "Impossible d'approuver l'annonce.", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const handleArchive = async (id: string) => {
    setUpdating(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("listings")
        .update({ status: "archived" })
        .eq("id", id)

      if (error) throw error

      toast({ title: "Annonce archivée", description: "L'annonce a été masquée de la plateforme." })
      setListings(listings.map(l => l.id === id ? {...l, status: "archived"} : l))
    } catch (err) {
      console.error("Error archiving listing:", err)
      toast({ title: "Erreur", description: "Impossible d'archiver l'annonce.", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    setUpdating(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({ title: "Annonce supprimée", description: "L'annonce a été définitivement supprimée." })
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error("Error deleting listing:", err)
      toast({ title: "Erreur", description: "Impossible de supprimer l'annonce.", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Active",
      archived: "Archivée",
      reserved: "Réservée",
      completed: "Terminée",
      pending_payment: "En attente de paiement",
      pending: "En attente",
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "reserved":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "pending_payment":
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Gestion des Annonces</h1>
            <p className="text-muted-foreground">Approuvez, modifiez ou supprimez les annonces</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">Aucune annonce trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Titre</th>
                    <th className="px-6 py-3 text-left font-medium">Utilisateur</th>
                    <th className="px-6 py-3 text-left font-medium">Statut</th>
                    <th className="px-6 py-3 text-left font-medium">Ville</th>
                    <th className="px-6 py-3 text-left font-medium">Vues</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(listing.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{listing.profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{listing.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{listing.city}</td>
                      <td className="px-6 py-4 text-sm">{listing.views}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {listing.status === "pending_payment" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={updating === listing.id}
                                  aria-label="Approuver l'annonce"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Approuver l'annonce ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  L'annonce sera rendue visible sur la plateforme.
                                </AlertDialogDescription>
                                <div className="flex gap-3">
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApprove(listing.id)}>
                                    Approuver
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updating === listing.id}
                                aria-label="Archiver l'annonce"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Archiver l'annonce ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                L'annonce sera masquée de la plateforme. Vous pourrez la réactiver plus tard.
                              </AlertDialogDescription>
                              <div className="flex gap-3">
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleArchive(listing.id)}>
                                  Archiver
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                disabled={updating === listing.id}
                                aria-label="Supprimer l'annonce"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Supprimer l'annonce ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. L'annonce sera définitivement supprimée.
                              </AlertDialogDescription>
                              <div className="flex gap-3">
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(listing.id)}
                                  className="bg-destructive"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
