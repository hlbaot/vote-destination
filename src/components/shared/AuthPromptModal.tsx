"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"

export default function AuthPromptModal() {
  const {
    isAuthPromptModalOpen,
    closeAuthPromptModal,
    authPromptOptions,
    openGoogleModal,
    quickLogin,
  } = useAuth()
  const { addToast } = useAppContext()

  // Esc listener
  useEffect(() => {
    if (!isAuthPromptModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthPromptModal()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isAuthPromptModalOpen, closeAuthPromptModal])

  if (!isAuthPromptModalOpen) return null

  const reason = authPromptOptions?.reason || "bình chọn"
  const isDemoEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" ||
    process.env.NODE_ENV !== "production"

  const handleContinueGoogle = () => {
    closeAuthPromptModal()
    openGoogleModal({
      returnTo: authPromptOptions?.returnTo,
    })
  }

  const handleDemoUser = async () => {
    try {
      const u = await quickLogin("user")
      addToast("success", `Chào mừng ${u.name} (Demo User) đã vào nhanh! 🌿`)
    } catch {
      addToast("warning", "Không thể đăng nhập demo.")
    }
  }

  const handleDemoAdmin = async () => {
    try {
      const u = await quickLogin("admin")
      addToast("success", `Chào mừng ${u.name} (Demo Admin) đã vào nhanh! 🛡️`)
    } catch {
      addToast("warning", "Không thể đăng nhập demo.")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      onClick={closeAuthPromptModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-7 relative overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthPromptModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center text-sm transition-colors"
          aria-label="Đóng hộp thoại"
        >
          ✕
        </button>

        {/* Brand Icon Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-linear-to-br from-[var(--color-surface-tint)] to-[var(--color-secondary)]/20 border border-[var(--color-border)] flex items-center justify-center text-3xl shadow-xs mb-3">
            🌿
          </div>
          <h2
            id="auth-prompt-title"
            className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)]"
          >
            Đăng nhập để {reason}
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-xs mx-auto">
            Mỗi tài khoản được cấp{" "}
            <strong className="text-[var(--color-primary)] font-semibold">
              3 lượt bình chọn mỗi ngày
            </strong>{" "}
            để đồng hành cùng các điểm đến du lịch nông thôn Việt Nam.
          </p>
        </div>

        {/* Primary Action: Google */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleContinueGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50/80 text-gray-700 font-semibold text-sm shadow-xs hover:shadow-md transition-all duration-150 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          {/* Links to auth pages */}
          <div className="flex items-center justify-between text-xs px-1 text-[var(--color-text-muted)] pt-1">
            <Link
              href="/dang-ky"
              onClick={closeAuthPromptModal}
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Chưa có tài khoản? Đăng ký
            </Link>
            <Link
              href="/dang-nhap?tab=admin"
              onClick={closeAuthPromptModal}
              className="hover:text-[var(--color-primary-dark)] hover:underline"
            >
              Cổng Quản trị viên →
            </Link>
          </div>
        </div>

        {/* Demo Fast Logins */}
        {isDemoEnabled && (
          <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Chế độ trải nghiệm (Demo)
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.2 rounded-sm font-semibold">
                DEV
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoUser}
                className="py-2 px-2.5 rounded-xl border border-dashed border-green-400 bg-green-50/60 hover:bg-green-100/70 text-green-800 text-xs font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <span>👤</span>
                <span className="truncate">Vào nhanh với User</span>
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="py-2 px-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <span>🛡️</span>
                <span className="truncate">Vào nhanh với Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
