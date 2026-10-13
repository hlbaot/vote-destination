"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Icon from "@/components/shared/Icon"
import AuthBrandSide from "@/components/shared/AuthBrandSide"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"

function GoogleIcon() {
  return (
    <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
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
  )
}

function DangNhapForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || ""

  const {
    user,
    status,
    openGoogleModal,
    loginAdmin,
    quickLoginUser,
    quickLoginAdmin,
  } = useAuth()
  const appContext = useAppContext()

  const [activeTab, setActiveTab] = useState<"user" | "admin">("user")
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const isDemoEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" ||
    process.env.NODE_ENV !== "production"

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && user) {
      if (user.role === "admin") {
        router.push(returnTo || "/cms")
      } else {
        router.push(returnTo || "/")
      }
    }
  }, [status, user, returnTo, router])

  const handleGoogleLogin = () => {
    setErrorMsg("")
    openGoogleModal({ returnTo })
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setIsSubmitting(true)

    try {
      const adminUser = await loginAdmin(adminUsername, adminPassword)
      appContext?.addToast?.(
        "success",
        `Chào mừng quản trị viên ${adminUser.name}!`,
      )
      router.push(returnTo || "/cms")
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Tài khoản hoặc mật khẩu không chính xác."
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleQuickDemo = async (role: "user" | "admin") => {
    setErrorMsg("")
    if (role === "user") {
      const u = await quickLoginUser()
      appContext?.addToast?.("success", `Đã vào nhanh với tài khoản ${u.name}!`)
      router.push(returnTo || "/")
    } else {
      const a = await quickLoginAdmin()
      appContext?.addToast?.(
        "success",
        `Đã vào nhanh quản trị với ${a.name}!`,
      )
      router.push(returnTo || "/cms")
    }
  }

  return (
    <div className="auth-viewport-wrapper">
      {/* Animated ambient mesh blur circles */}
      <div className="auth-ambient-orbs" aria-hidden="true">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-card-container">
        {/* Left: Brand Illustration */}
        <AuthBrandSide />

        {/* Right: Form */}
        <div className="auth-form-side">
          <div>
            <div className="auth-top-nav">
              <Link href="/" className="auth-back-link">
                <Icon name="arrow" size={15} /> Về trang chủ
              </Link>
            </div>

            {/* Tabs switcher */}
            <div className="auth-tabs-nav" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "user"}
                className={`auth-tab-btn ${activeTab === "user" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("user")
                  setErrorMsg("")
                }}
              >
                Người dùng
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "admin"}
                className={`auth-tab-btn ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("admin")
                  setErrorMsg("")
                }}
              >
                Quản trị viên
              </button>
            </div>

            {/* Form Header */}
            <div className="auth-form-header">
              <h1>
                {activeTab === "user"
                  ? "Đăng nhập bình chọn"
                  : "Đăng nhập hệ thống CMS"}
              </h1>
              <p>
                {activeTab === "user"
                  ? "Đăng nhập để nhận ngay 3 lượt bình chọn mỗi ngày và chăm sóc cây điểm đến."
                  : "Khu vực dành riêng cho Ban tổ chức và Quản trị viên."}
              </p>
            </div>

            {/* Inline Error Alert */}
            {errorMsg && (
              <div
                className="auth-error-inline"
                role="alert"
                aria-live="polite"
              >
                <Icon name="x" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab 1: User Login via Google */}
            {activeTab === "user" && (
              <div>
                <button
                  type="button"
                  className="btn-google-auth"
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon />
                  <span>Tiếp tục với Google</span>
                </button>

                <p className="google-auth-disclaimer">
                  Chúng tôi chỉ dùng tên, email và ảnh đại diện từ tài khoản
                  Google của bạn.
                </p>

                <div className="auth-switch-link-row">
                  Chưa có tài khoản?
                  <Link href={`/dang-ky${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Admin Login */}
            {activeTab === "admin" && (
              <form onSubmit={handleAdminSubmit} noValidate>
                <div className="auth-input-group">
                  <label htmlFor="admin-username">Email hoặc tên tài khoản *</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Icon name="user" size={16} />
                    </span>
                    <input
                      id="admin-username"
                      type="text"
                      required
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin@destination.vn"
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="admin-password">Mật khẩu *</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left">
                      <Icon name="lock" size={16} />
                    </span>
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Nhập mật khẩu quản trị"
                    />
                    <button
                      type="button"
                      className="toggle-pwd-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      <Icon name={showPassword ? "eye" : "eye"} size={16} />
                    </button>
                  </div>
                </div>

                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !adminUsername.trim() || !adminPassword.trim()}
                  className="btn-primary-auth"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="spark" size={16} /> Đang xác thực...
                    </>
                  ) : (
                    <>
                      <Icon name="shield" size={16} /> Đăng nhập quản trị
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Demo Mode Box (Dev or NEXT_PUBLIC_ENABLE_DEMO_LOGIN) */}
          {isDemoEnabled && (
            <div className="auth-demo-box">
              <div className="demo-box-header">
                <span>Chế độ trải nghiệm (demo)</span>
                <span className="demo-badge-pill">DEMO</span>
              </div>
              <div className="demo-actions-grid">
                <button
                  type="button"
                  className="demo-btn-item"
                  onClick={() => handleQuickDemo("user")}
                  title="Đăng nhập ngay với tài khoản User mẫu"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop"
                    alt="User"
                  />
                  <div className="demo-btn-text">
                    <strong>Vào nhanh với User</strong>
                    <small>Bình chọn & làm nhiệm vụ</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn-item"
                  onClick={() => handleQuickDemo("admin")}
                  title="Đăng nhập ngay với tài khoản Quản trị viên"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop"
                    alt="Admin"
                  />
                  <div className="demo-btn-text">
                    <strong>Vào nhanh với Admin</strong>
                    <small>Toàn quyền quản trị CMS</small>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DangNhapPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-viewport-wrapper">
          <div className="header-avatar-skeleton" style={{ width: 60, height: 60 }} />
        </div>
      }
    >
      <DangNhapForm />
    </Suspense>
  )
}
