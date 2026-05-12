"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, CheckCircle, X, Loader2 } from "lucide-react"
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
      
      setListings(listings.map(l => l.id === id ? {...l, status: "active"} : l))
    } catch (err) {
      console.error("Error approving listing:", err)
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
      
      setListings(listings.map(l => l.id === id ? {...l, status: "archived"} : l))
    } catch (err) {
      console.error("Error archiving listing:", err)
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
      
      setListings(listings.filter(l => l.id !== id))
    } catch (err) {
      console.error("Error deleting listing:", err)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
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
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{listing.city}</td>
                      <td className="px-6 py-4 text-sm">{listing.views}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {listing.status === "pending_payment" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(listing.id)}
                              disabled={updating === listing.id}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArchive(listing.id)}
                            disabled={updating === listing.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                disabled={updating === listing.id}
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
