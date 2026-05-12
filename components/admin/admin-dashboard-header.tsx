"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, List, AlertCircle, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalListings: number
  activeListings: number
  totalReports: number
  pendingReports: number
  totalExchanges: number
}

export function AdminDashboardHeader() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalReports: 0,
    pendingReports: 0,
    totalExchanges: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Fetch total users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        // Fetch total listings
        const { count: listingsCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })

        // Fetch active listings
        const { count: activeCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")

        // Fetch total reports
        const { count: reportsCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })

        // Fetch pending reports
        const { count: pendingReportsCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "open")

        // Fetch exchanges
        const { count: exchangesCount } = await supabase
          .from("exchanges")
          .select("*", { count: "exact", head: true })

        setStats({
          totalUsers: usersCount || 0,
          totalListings: listingsCount || 0,
          activeListings: activeCount || 0,
          totalReports: reportsCount || 0,
          pendingReports: pendingReportsCount || 0,
          totalExchanges: exchangesCount || 0,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Utilisateurs",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Annonces",
      value: stats.totalListings,
      icon: List,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Annonces Actives",
      value: stats.activeListings,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Signalements",
      value: stats.totalReports,
      icon: AlertCircle,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Signalements en Attente",
      value: stats.pendingReports,
      icon: AlertCircle,
      color: "bg-red-500/10 text-red-600",
    },
    {
      label: "Échanges",
      value: stats.totalExchanges,
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenue dans le panneau d'administration</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold">
                    {loading ? "..." : card.value}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
