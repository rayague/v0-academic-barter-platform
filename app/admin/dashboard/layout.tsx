"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.getElementById('admin-loading')?.remove()
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300" id="admin-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      {children}
    </>
  )
}
