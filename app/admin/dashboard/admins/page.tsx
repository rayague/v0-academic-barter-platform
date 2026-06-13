"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, ShieldCheck, ShieldX } from "lucide-react"

interface Admin {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  profiles?: { is_admin: boolean }
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      setCurrentUserId(sessionData.session?.user.id || null)

      const { data, error } = await supabase
        .from("admins")
        .select("*, profiles(is_admin)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (err) {
      console.error("Error fetching admins:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (adminId: string, isActive: boolean) => {
    setUpdating(adminId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("admins")
        .update({ is_active: !isActive })
        .eq("id", adminId)

      if (error) throw error

      // Also update profiles.is_admin
      const admin = admins.find(a => a.id === adminId)
      if (admin) {
        await supabase
          .from("profiles")
          .update({ is_admin: !isActive })
          .eq("id", admin.user_id)
      }

      fetchAdmins()
    } catch (err) {
      console.error("Error toggling admin status:", err)
    } finally {
      setUpdating(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-amber-100 text-amber-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "moderator":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      moderator: "Modérateur",
    }
    return labels[role] || role
  }

  const isSuperAdmin = admins.some(a => a.user_id === currentUserId && a.role === "super_admin")

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Administrateurs</h1>
            <p className="text-muted-foreground">Gérez les comptes administrateurs</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun administrateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Admin</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">Rôle</th>
                    <th className="px-6 py-3 text-left font-medium">Statut</th>
                    <th className="px-6 py-3 text-left font-medium">Inscrit le</th>
                    {isSuperAdmin && <th className="px-6 py-3 text-left font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Shield className={`h-5 w-5 ${admin.is_active ? "text-amber-600" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">{admin.full_name || "Non renseigné"}</p>
                            <p className="text-xs text-muted-foreground">ID: {admin.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getRoleBadge(admin.role)}`}>
                          {getRoleLabel(admin.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {admin.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <ShieldCheck className="h-4 w-4" /> Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <ShieldX className="h-4 w-4" /> Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      {isSuperAdmin && admin.user_id !== currentUserId && (
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant={admin.is_active ? "outline" : "default"}
                            onClick={() => handleToggleActive(admin.id, admin.is_active)}
                            disabled={updating === admin.id}
                          >
                            {admin.is_active ? "Désactiver" : "Activer"}
                          </Button>
                        </td>
                      )}
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
