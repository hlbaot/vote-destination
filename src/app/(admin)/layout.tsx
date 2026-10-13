"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, status } = useAuth()
  const router = useRouter()
  const appContext = useAppContext()

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/dang-nhap?returnTo=/cms")
      return
    }

    if (user && user.role !== "admin") {
      appContext?.addToast?.("warning", "Bạn không có quyền truy cập")
      router.push("/")
    }
  }, [user, status, router, appContext])

  const isAuthorized = status === "authenticated" && user?.role === "admin"

  return (
    <>
      {!isAuthorized && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "var(--color-surface-tint)",
            fontFamily: "inherit",
          }}
        >
          <div className="header-avatar-skeleton" style={{ width: 56, height: 56 }} />
          <span style={{ fontSize: "14px", color: "var(--color-text-muted)", fontWeight: 600 }}>
            Đang kiểm tra quyền quản trị viên...
          </span>
        </div>
      )}
      <div style={{ visibility: isAuthorized ? "visible" : "hidden" }}>
        {children}
      </div>
    </>
  )
}

