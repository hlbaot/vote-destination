"use client"

import CMS from "@/features/admin/cms"
import { useAppContext } from "@/context/AppContext"

export default function CMSPage() {
  const {
    currentAdmin,
    adminAccounts,
    handleLoginAdmin,
    handleLogoutAdmin,
    handleAddAdminAccount,
    handleToggleAdminStatus,
    destinations,
    voteRecords,
    handleAddDestination,
    handleToggleVisibility,
    handleDeleteDestination,
    handleExportCsv,
    handleResetData,
    navigate,
  } = useAppContext()

  const fallbackAdmin = currentAdmin || (adminAccounts[0] || {
    id: "admin-1",
    fullName: "Quản trị viên Hệ thống",
    username: "admin",
    email: "admin@destination.vn",
    role: "admin" as const,
    roleTitle: "Quản trị viên",
    department: "Ban Tổ Chức",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    lastLogin: "Vừa xong",
    status: "active" as const,
    passwordDemo: "admin@2025",
  })


  return (
    <CMS
      destinations={destinations}
      voteRecords={voteRecords}
      adminAccounts={adminAccounts}
      currentAdmin={fallbackAdmin}
      onSwitchAdmin={handleLoginAdmin}
      onLogout={handleLogoutAdmin}
      onAddAdminAccount={handleAddAdminAccount}
      onToggleAdminStatus={handleToggleAdminStatus}
      onAddDestination={handleAddDestination}
      onToggleVisibility={handleToggleVisibility}
      onDeleteDestination={handleDeleteDestination}
      onExportCsv={handleExportCsv}
      onResetData={handleResetData}
      go={navigate}
    />
  )
}
