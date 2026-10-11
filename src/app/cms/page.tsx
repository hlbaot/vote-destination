"use client"

import CMS from "@/views/CMS"
import AdminLogin from "@/components/AdminLogin"
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

  if (!currentAdmin) {
    return (
      <AdminLogin
        adminAccounts={adminAccounts}
        onLoginSuccess={handleLoginAdmin}
        go={navigate}
      />
    )
  }

  return (
    <CMS
      destinations={destinations}
      voteRecords={voteRecords}
      adminAccounts={adminAccounts}
      currentAdmin={currentAdmin}
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
