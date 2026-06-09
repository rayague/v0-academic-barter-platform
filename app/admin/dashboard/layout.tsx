"use client"

import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware handles admin authentication and redirects
  // This component just shows a brief loading state on initial render
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300" id="admin-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Hide loading overlay once page is interactive
            document.getElementById('admin-loading')?.remove();
          `
        }}
      />
      {children}
    </>
  )
}
