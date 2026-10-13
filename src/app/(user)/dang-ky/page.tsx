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

function DangKyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || ""

  const {
    user,
    status,
    openGoogleModal,
    quickLoginUser,
    quickLoginAdmin,
  } = useAuth()
  const appContext = useAppContext()

  const [agreeTerms, setAgreeTerms] = useState(false)
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

  const handleGoogleRegister = () => {
    if (!agreeTerms) return
    openGoogleModal({ isRegister: true, returnTo })
  }


  const handleQuickDemo = async (role: "user" | "admin") => {
    if (role === "user") {
      const u = await quickLoginUser()
      appContext?.addToast?.("success", `Chào mừng bạn ${u.name}!`)
      router.push(returnTo || "/")
    } else {
      const a = await quickLoginAdmin()
      appContext?.addToast?.(
        "success",
        `Chào mừng quản trị viên ${a.name}!`,
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

        {/* Right: Register Form */}
        <div className="auth-form-side">
          <div>
            <div className="auth-top-nav">
              <Link href="/" className="auth-back-link">
                <Icon name="arrow" size={15} /> Về trang chủ
              </Link>
            </div>

            <div className="auth-form-header">
              <h1>Tạo tài khoản</h1>
              <p>
                Đăng ký nhanh chỉ với một cú bấm bằng Google. Không cần mật khẩu rườm rà.
              </p>
            </div>

            {/* 3 Steps summary card */}
            <div className="register-steps-card">
              <div className="step-row">
                <span className="step-badge">1</span>
                <span>Đăng ký nhanh qua tài khoản Google</span>
              </div>
              <div className="step-row">
                <span className="step-badge">2</span>
                <span>Nhận ngay 3 lượt bình chọn mỗi ngày</span>
              </div>
              <div className="step-row">
                <span className="step-badge">3</span>
                <span>Trồng cây số hóa cho điểm đến bạn yêu thích</span>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="auth-terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                Tôi đồng ý với{" "}
                <a href="#dieu-khoan" onClick={(e) => e.preventDefault()}>
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#chinh-sach" onClick={(e) => e.preventDefault()}>
                  Chính sách quyền riêng tư
                </a>{" "}
                của chương trình bình chọn.
              </span>
            </label>

            {/* Google Registration Button */}
            <button
              type="button"
              className="btn-google-auth"
              disabled={!agreeTerms}
              onClick={handleGoogleRegister}
              title={
                !agreeTerms
                  ? "Vui lòng đồng ý với điều khoản sử dụng trước"
                  : "Đăng ký tài khoản với Google"
              }
            >
              <GoogleIcon />
              <span>Đăng ký bằng Google</span>
            </button>

            <p className="google-auth-disclaimer">
              Chúng tôi chỉ nhận thông tin cơ bản: Tên, Email và Ảnh đại diện công khai.
            </p>

            <div className="auth-switch-link-row">
              Đã có tài khoản?
              <Link href={`/dang-nhap${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>
                Đăng nhập
              </Link>
            </div>
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

export default function DangKyPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-viewport-wrapper">
          <div className="header-avatar-skeleton" style={{ width: 60, height: 60 }} />
        </div>
      }
    >
      <DangKyForm />
    </Suspense>
  )
}
