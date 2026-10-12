"use client"

import React, { ReactNode, Suspense } from "react"
import { AppProvider, useAppContext } from "@/context/AppContext"
import Toast from "@/components/shared/Toast"

function AppShellInner({ children }: { children: ReactNode }) {
  const { toasts, dismissToast } = useAppContext()

  return (
    <div className="app-shell">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Main Page Content */}
      <main className="app-main-content">{children}</main>
    </div>
  )
}

export default function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AppProvider>
      <Suspense fallback={<div className="app-shell"><main className="app-main-content">{children}</main></div>}>
        <AppShellInner>{children}</AppShellInner>
      </Suspense>
    </AppProvider>
  )
}
