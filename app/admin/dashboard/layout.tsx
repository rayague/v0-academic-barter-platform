"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient()
        
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData.session) {
          router.push("/admin/auth/login")
          return
        }

        // Check if user is admin
        const { data: adminData, error } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", sessionData.session.user.id)
          .single()

        if (error || !adminData || !adminData.is_active) {
          router.push("/admin/auth/login")
          return
        }

        setIsAdmin(true)
      } catch (err) {
        console.error("Admin check error:", err)
        router.push("/admin/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
