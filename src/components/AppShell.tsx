"use client"

import React, { ReactNode, Suspense } from "react"
import { usePathname } from "next/navigation"
import { AppProvider, useAppContext } from "@/context/AppContext"
import Header from "./Header"
import Footer from "./Footer"
import Toast from "./Toast"

function AppShellInner({
  children,
  header,
  footer,
}: {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}) {
  const pathname = usePathname()
  const { toasts, dismissToast, navigate } = useAppContext()

  const isCms = pathname?.startsWith("/cms")

  return (
    <div className="app-shell">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header (hidden in CMS view) */}
      {!isCms && (header || <Header />)}

      {/* Main Page Content */}
      <main className="app-main-content">{children}</main>

      {/* Footer (hidden in CMS view) */}
      {!isCms && (footer || <Footer go={navigate} />)}
    </div>
  )
}

export default function AppShell({
  children,
  header,
  footer,
}: {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}) {
  return (
    <AppProvider>
      <Suspense fallback={<div className="app-shell"><main className="app-main-content">{children}</main></div>}>
        <AppShellInner header={header} footer={footer}>
          {children}
        </AppShellInner>
      </Suspense>
    </AppProvider>
  )
}
