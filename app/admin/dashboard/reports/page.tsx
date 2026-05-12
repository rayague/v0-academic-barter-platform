"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { CheckCircle, X, Loader2, ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  listing_id?: string
  report_type: string
  description: string
  status: string
  admin_notes?: string
  created_at: string
  profiles?: { full_name: string; email: string }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("reports")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (err) {
      console.error("Error fetching reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", sessionData.session?.user.id)
        .single()

      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          resolved_by: admin?.id,
          admin_notes: notes[id] || null,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", id)

      if (error) throw error

      setReports(reports.map(r => r.id === id ? {...r, status: newStatus} : r))
      setNotes({...notes, [id]: ""})
      setExpandedId(null)
    } catch (err) {
      console.error("Error updating report:", err)
    } finally {
      setUpdating(null)
    }
  }

  const getReportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      inappropriate_content: "Contenu inapproprié",
      fraud: "Fraude",
      harassment: "Harcèlement",
      fake_item: "Objet faux",
      other: "Autre",
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
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
            <h1 className="text-3xl font-bold">Gestion des Signalements</h1>
            <p className="text-muted-foreground">Révisez et gérez les signalements des utilisateurs</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-lg border border-border p-8 text-center">
              <p className="text-muted-foreground">Aucun signalement trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getReportTypeLabel(report.report_type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        Signalé par: {report.profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === report.id ? null : report.id)
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          expandedId === report.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {expandedId === report.id && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      <div>
                        <label className="text-sm font-medium">Notes d'administration</label>
                        <textarea
                          value={notes[report.id] || ""}
                          onChange={(e) =>
                            setNotes({...notes, [report.id]: e.target.value})
                          }
                          placeholder="Ajoutez vos notes..."
                          className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Select
                          value={report.status}
                          onValueChange={(value) =>
                            handleStatusChange(report.id, value)
                          }
                          disabled={updating === report.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Ouvert</SelectItem>
                            <SelectItem value="in_review">En révision</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                            <SelectItem value="dismissed">Rejeté</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={() => handleStatusChange(report.id, "resolved")}
                          disabled={updating === report.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Résoudre
                        </Button>

                        <Button
                          onClick={() => handleStatusChange(report.id, "dismissed")}
                          disabled={updating === report.id}
                          variant="outline"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
