"use client"

import React, { ReactNode, Suspense } from "react"
import { usePathname } from "next/navigation"
import { AppProvider, useAppContext } from "@/context/AppContext"
import Header from "./Header"
import Footer from "./Footer"
import Toast from "./Toast"
import { Page } from "@/types"

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { toasts, dismissToast, favorites, navigate } = useAppContext()

  let currentPage: Page = "home"
  if (pathname?.startsWith("/cms")) {
    currentPage = "cms"
  } else if (pathname?.startsWith("/destination")) {
    currentPage = "detail"
  } else if (pathname?.startsWith("/explore")) {
    currentPage = "explore"
  } else if (pathname?.startsWith("/vote")) {
    currentPage = "vote"
  } else if (pathname?.startsWith("/guide")) {
    currentPage = "guide"
  }

  const isCms = currentPage === "cms"

  return (
    <div className="app-shell">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Header (hidden in CMS view) */}
      {!isCms && (
        <Header
          page={currentPage}
          setPage={navigate}
          favoritesCount={favorites.length}
        />
      )}

      {/* Main Page Content */}
      <main className="app-main-content">{children}</main>

      {/* Footer (hidden in CMS view) */}
      {!isCms && <Footer go={navigate} />}
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <Suspense fallback={<div className="app-shell"><main className="app-main-content">{children}</main></div>}>
        <AppShellInner>{children}</AppShellInner>
      </Suspense>
    </AppProvider>
  )
}
