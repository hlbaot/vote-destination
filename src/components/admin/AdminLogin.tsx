"use client"

import React, { useState } from "react"
import { AdminAccount, Page } from "@/types"
import { Logo } from "@/components/user/layout/Header"
import Icon from "@/components/shared/Icon"

export default function AdminLogin({
  adminAccounts,
  onLoginSuccess,
  go,
}: {
  adminAccounts: AdminAccount[]
  onLoginSuccess: (account: AdminAccount) => void
  go: (page: Page) => void
}) {
  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const normalizedEmail = emailInput.trim().toLowerCase()
    const found = adminAccounts.find(
      (a) =>
        (a.email.toLowerCase() === normalizedEmail ||
          a.username.toLowerCase() === normalizedEmail) &&
        (a.passwordDemo === passwordInput ||
          passwordInput === "123456" ||
          passwordInput === "admin"),
    )

    if (found) {
      if (found.status === "locked") {
        setErrorMsg(
          "Tài khoản này hiện đang bị khóa tạm thời. Vui lòng liên hệ Super Admin.",
        )
        return
      }
      onLoginSuccess(found)
    } else {
      setErrorMsg(
        "Email/Tên đăng nhập hoặc mật khẩu không chính xác. Bạn có thể bấm chọn tài khoản mẫu bên dưới để đăng nhập ngay.",
      )
    }
  }

  const handleQuickLogin = (account: AdminAccount) => {
    setEmailInput(account.email)
    setPasswordInput(account.passwordDemo)
    setErrorMsg("")
    onLoginSuccess(account)
  }

  return (
    <div className="admin-login-wrapper">
      {/* Background Decor */}
      <div className="login-backdrop-decor">
        <div className="decor-circle-1" />
        <div className="decor-circle-2" />
      </div>

      <div className="admin-login-container">
        {/* Top bar with back to public button */}
        <div className="login-top-bar">
          <button
            type="button"
            className="btn-back-to-public"
            onClick={() => go("home")}
          >
            <Icon name="arrow" size={16} /> Về Trang Bình Chọn Công Chúng
          </button>

          <span className="portal-badge-indicator">
            <Icon name="shield" size={14} /> CỔNG QUẢN TRỊ TRUNG ƯƠNG
          </span>
        </div>

        <div className="login-grid-card">
          {/* LEFT: LOGIN FORM */}
          <div className="login-form-side">
            <div className="login-brand-header">
              <Logo compact />
              <div>
                <h2>Đăng Nhập Quản Trị</h2>
                <p>Hệ thống Kiểm toán & Giám sát Bình chọn Quốc gia 2025</p>
              </div>
            </div>

            {errorMsg && (
              <div className="login-error-alert">
                <Icon name="x" size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="login-input-form">
              <div className="login-field-group">
                <label>Email hoặc Tên tài khoản *</label>
                <div className="input-icon-box">
                  <Icon name="user" size={16} />
                  <input
                    required
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Ví dụ: admin@destination.vn hoặc admin"
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label>Mật khẩu quản trị *</label>
                <div className="input-icon-box">
                  <Icon name="lock" size={16} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu (hoặc bấm chọn demo bên phải)"
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </div>

              <div className="login-remember-row">
                <label className="checkbox-wrap">
                  <input type="checkbox" defaultChecked />
                  <span>Ghi nhớ phiên đăng nhập trên thiết bị này</span>
                </label>
                <span className="security-tag">
                  <Icon name="shield" size={12} /> TLS 1.3 256-bit
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-submit-login"
              >
                Xác thực & Truy cập CMS <Icon name="arrow" size={16} />
              </button>
            </form>

            <div className="login-footer-security">
              <small>
                Cổng bảo mật dành riêng cho Ban Tổ Chức & Đoàn Kiểm Toán. Mọi
                truy cập bất hợp pháp đều được ghi nhận địa chỉ IP và xử lý theo
                quy định pháp luật.
              </small>
            </div>
          </div>

          {/* RIGHT: MOCK DATA DEMO ACCOUNTS QUICK-LOGIN */}
          <div className="login-accounts-side">
            <div className="accounts-side-header">
              <div className="header-badge-tag">
                MOCK DATA TÀI KHOẢN QUẢN TRỊ
              </div>
              <h3>Chọn tài khoản mẫu để trải nghiệm</h3>
              <p>
                Nhấp vào tài khoản bất kỳ bên dưới để tự động điền thông tin và
                đăng nhập ngay với phân quyền tương ứng:
              </p>
            </div>

            <div className="mock-accounts-list">
              {adminAccounts.map((account) => {
                const isSuper = account.role === "superadmin"
                const isMod = account.role === "moderator"
                const isEditor = account.role === "editor"

                const roleColorClass = isSuper
                  ? "role-super"
                  : isMod
                    ? "role-mod"
                    : isEditor
                      ? "role-editor"
                      : "role-operator"

                return (
                  <div
                    key={account.id}
                    className={`mock-account-card ${roleColorClass}`}
                    onClick={() => handleQuickLogin(account)}
                    title={`Nhấp để đăng nhập ngay với tài khoản ${account.fullName}`}
                  >
                    <div className="account-card-left">
                      <img
                        src={account.avatar}
                        alt={account.fullName}
                        className="account-card-avatar"
                      />
                      <div className="account-card-text">
                        <div className="account-name-line">
                          <strong>{account.fullName}</strong>
                          <span className={`role-pill ${roleColorClass}`}>
                            {account.roleTitle}
                          </span>
                        </div>
                        <span className="account-dept-line">
                          {account.department}
                        </span>
                        <div className="account-cred-details">
                          <code>{account.email}</code>
                          <span className="pwd-hint">
                            Pass: <strong>{account.passwordDemo}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-quick-login-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickLogin(account)
                      }}
                    >
                      Đăng nhập <Icon name="arrow" size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
