"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header"

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <AdminDashboardHeader />
        </div>
      </div>
    </div>
  )
}
