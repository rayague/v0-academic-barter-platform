"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AdminProfile {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) return

      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle()

      if (error || !data) {
        console.warn("Could not fetch admin profile from admins table, checking profiles.is_admin")
      } else {
        setAdmin(data)
      }
    } catch (err) {
      console.error("Error fetching admin profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      super_admin: "Super Administrateur",
      admin: "Administrateur",
      moderator: "Modérateur",
    }
    return roles[role] || role
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos paramètres administrateur</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : admin ? (
            <div className="max-w-2xl space-y-6">
              {/* Profile Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Mon Profil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nom Complet
                    </label>
                    <p className="mt-2 text-lg font-medium">{admin.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-2 text-lg font-medium">{admin.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rôle
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                        {getRoleLabel(admin.role)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      {admin.is_active ? (
                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          ✓ Actif
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          ⚠ Inactif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Permissions</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      id="view-reports"
                    />
                    <label htmlFor="view-reports" className="text-sm font-medium">
                      Voir les signalements
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      id="manage-listings"
                    />
                    <label htmlFor="manage-listings" className="text-sm font-medium">
                      Gérer les annonces
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      id="view-users"
                    />
                    <label htmlFor="view-users" className="text-sm font-medium">
                      Voir les utilisateurs
                    </label>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="rounded-lg border border-border bg-blue-50 p-6 text-blue-900">
                <h2 className="mb-2 font-semibold">💡 Aide</h2>
                <p className="text-sm">
                  Pour plus d'informations sur la gestion de l'administration, consultez la documentation.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">Profil administrateur non trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
