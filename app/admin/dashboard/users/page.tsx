"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Ban, CheckCircle, Loader2, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  full_name: string
  email: string
  city: string
  average_rating: number
  total_exchanges: number
  created_at: string
  university?: string
  user_bans?: { id: string; reason: string; is_active: boolean }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [banReason, setBanReason] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_bans(id, reason, is_active)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      alert("Veuillez entrer une raison pour le ban")
      return
    }

    setUpdating(userId)
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", sessionData.session?.user.id)
        .single()

      const { error } = await supabase.from("user_bans").insert({
        user_id: userId,
        reason: reason,
        banned_by: admin?.id,
        is_active: true,
      })

      if (error) throw error

      setBanReason({...banReason, [userId]: ""})
      fetchUsers() // Refresh users list
    } catch (err) {
      console.error("Error banning user:", err)
    } finally {
      setUpdating(null)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    setUpdating(userId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("user_bans")
        .update({ is_active: false })
        .eq("user_id", userId)

      if (error) throw error
      fetchUsers() // Refresh users list
    } catch (err) {
      console.error("Error unbanning user:", err)
    } finally {
      setUpdating(null)
    }
  }

  const isBanned = (user: User) => {
    return user.user_bans?.some((ban) => ban.is_active)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Gestion des Comptes</h1>
            <p className="text-muted-foreground">Gérez les comptes utilisateurs et les bannissements</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Utilisateur</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Ville</th>
                    <th className="px-6 py-3 text-left font-medium">Note</th>
                    <th className="px-6 py-3 text-left font-medium">Échanges</th>
                    <th className="px-6 py-3 text-left font-medium">Statut</th>
                    <th className="px-6 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.city}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          ⭐ {user.average_rating?.toFixed(1) || "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.total_exchanges}</td>
                      <td className="px-6 py-4">
                        {isBanned(user) ? (
                          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                            ⛔ Banni
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            ✓ Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {isBanned(user) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              disabled={updating === user.id}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive"
                                  disabled={updating === user.id}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Bannir cet utilisateur ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Entrez une raison pour le bannissement
                                </AlertDialogDescription>
                                <textarea
                                  value={banReason[user.id] || ""}
                                  onChange={(e) =>
                                    setBanReason({...banReason, [user.id]: e.target.value})
                                  }
                                  placeholder="Raison du bannissement..."
                                  className="w-full rounded border p-2 text-sm"
                                  rows={3}
                                />
                                <div className="flex gap-3">
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleBanUser(user.id, banReason[user.id] || "")
                                    }
                                    className="bg-destructive"
                                  >
                                    Bannir
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
