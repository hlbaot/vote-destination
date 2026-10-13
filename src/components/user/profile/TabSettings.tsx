"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/shared/Icon"
import { UserSettings } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"

interface TabSettingsProps {
  userId: string
}

export default function TabSettings({ userId }: TabSettingsProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const appContext = useAppContext()

  const [settings, setSettings] = useState<UserSettings>({
    notifyDailyReminder: true,
    notifyRankUp: true,
    notifyContestResults: true,
    language: "vi",
    publicLeaderboardName: true,
    partialAnonymity: true,
    linkedGoogleEmail: "",
  })

  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmDeleteText, setConfirmDeleteText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let mounted = true
    profileService.getSettings(userId).then((data) => {
      if (mounted) {
        setSettings(data)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [userId])

  const handleToggle = async (key: keyof UserSettings) => {
    const updatedValue = !settings[key]
    const updated = { ...settings, [key]: updatedValue }
    setSettings(updated)

    try {
      await profileService.updateSettings(userId, { [key]: updatedValue })
      appContext?.addToast?.("success", "Đã lưu cài đặt! ✓")
    } catch {
      appContext?.addToast?.("warning", "Không thể lưu cài đặt lúc này.")
    }
  }

  const handleLanguageChange = async (lang: "vi" | "en") => {
    const updated = { ...settings, language: lang }
    setSettings(updated)
    await profileService.updateSettings(userId, { language: lang })
    appContext?.addToast?.("info", `Đã chuyển ngôn ngữ sang ${lang === "vi" ? "Tiếng Việt" : "English"}`)
  }

  const handleLogoutAllDevices = async () => {
    await logout()
    appContext?.addToast?.("info", "Đã đăng xuất khỏi tất cả thiết bị thành công.")
    router.push("/")
  }

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== "XOA") return

    setIsDeleting(true)
    try {
      await profileService.deleteAccount(userId)
      appContext?.addToast?.("info", "Tài khoản và dữ liệu đã được xóa hoàn tất.")
      router.push("/")
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-panel-card" role="tabpanel">
        <div className="header-avatar-skeleton" style={{ width: "100%", height: 300, borderRadius: 16 }} />
      </div>
    )
  }

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-cai-dat"
      aria-labelledby="tab-cai-dat"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Cài đặt tài khoản & Quyền riêng tư</h2>
          <p>Tùy chỉnh thông báo nhắc nhở, tính ẩn danh trên bảng xếp hạng và quản lý tài khoản liên kết.</p>
        </div>
      </div>

      <div className="settings-blocks-container">
        {/* Khối 1: Thông báo */}
        <div className="settings-block-section">
          <h4>🔔 Thông báo & Nhắc nhở</h4>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Nhắc nhở bình chọn hằng ngày</strong>
              <small>Nhận thông báo khi 3 lượt bình chọn miễn phí được làm mới mỗi ngày (00:00 VN).</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyDailyReminder}
              aria-label="Nhắc nhở bình chọn hằng ngày"
              className="toggle-switch-btn"
              onClick={() => handleToggle("notifyDailyReminder")}
            >
              <span className="switch-knob" />
            </button>
          </div>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Thông báo khi điểm đến bạn vote thăng hạng</strong>
              <small>Cập nhật ngay khi cây điểm đến chuyển giai đoạn sinh trưởng mới hoặc vượt thứ hạng.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyRankUp}
              aria-label="Thông báo khi điểm đến thăng hạng"
              className="toggle-switch-btn"
              onClick={() => handleToggle("notifyRankUp")}
            >
              <span className="switch-knob" />
            </button>
          </div>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Kết quả chung cuộc hội thi 2026</strong>
              <small>Nhận thông báo khi Ban Tổ Chức công bố danh sách 10 điểm đến nông thôn tốt nhất.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyContestResults}
              aria-label="Thông báo kết quả chung cuộc"
              className="toggle-switch-btn"
              onClick={() => handleToggle("notifyContestResults")}
            >
              <span className="switch-knob" />
            </button>
          </div>
        </div>

        {/* Khối 2: Ngôn ngữ & Quyền riêng tư */}
        <div className="settings-block-section">
          <h4>🌐 Ngôn ngữ & Quyền riêng tư</h4>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Ngôn ngữ giao diện</strong>
              <small>Lựa chọn ngôn ngữ hiển thị trên toàn bộ cổng thông tin.</small>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className={`btn btn-secondary ${settings.language === "vi" ? "btn-primary" : ""}`}
                style={{ borderRadius: 100, padding: "5px 14px", fontSize: 12 }}
                onClick={() => handleLanguageChange("vi")}
              >
                Tiếng Việt
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${settings.language === "en" ? "btn-primary" : ""}`}
                style={{ borderRadius: 100, padding: "5px 14px", fontSize: 12 }}
                onClick={() => handleLanguageChange("en")}
              >
                English
              </button>
            </div>
          </div>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Ẩn danh một phần tên trên bảng xếp hạng</strong>
              <small>Hiển thị tên dưới dạng &apos;Nguyễn H***&apos; để bảo vệ danh tính cá nhân công khai.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.partialAnonymity}
              aria-label="Ẩn danh một phần tên"
              className="toggle-switch-btn"
              onClick={() => handleToggle("partialAnonymity")}
            >
              <span className="switch-knob" />
            </button>
          </div>

          <div className="switch-row-item">
            <div className="switch-label-meta">
              <strong>Cho phép hiển thị trên Bảng xếp hạng</strong>
              <small>Khi tắt, tài khoản của bạn sẽ không xuất hiện trên danh sách Top người ủng hộ.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.publicLeaderboardName}
              aria-label="Hiển thị trên bảng xếp hạng"
              className="toggle-switch-btn"
              onClick={() => handleToggle("publicLeaderboardName")}
            >
              <span className="switch-knob" />
            </button>
          </div>
        </div>

        {/* Khối 3: Tài khoản liên kết */}
        <div className="settings-block-section">
          <h4>🔗 Tài khoản liên kết</h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: "var(--color-surface-tint)",
              borderRadius: 14,
              border: "1px solid rgba(122, 201, 67, 0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <strong style={{ display: "block", fontSize: 13.5, color: "var(--color-text)" }}>
                  Tài khoản Google
                </strong>
                <small style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {settings.linkedGoogleEmail || "Đã liên kết"}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              disabled
              title="Phương thức đăng nhập duy nhất không thể ngắt kết nối"
              style={{ borderRadius: 100, fontSize: 11.5, opacity: 0.6 }}
            >
              🔒 Đang bảo vệ
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--color-text-muted)" }}>
            * Hệ thống xác thực bằng Google OAuth một chạm, không sử dụng mật khẩu lưu tại máy chủ.
          </p>
        </div>

        {/* Khối 4: Phiên đăng nhập */}
        <div className="settings-block-section">
          <h4>📱 Quản lý phiên đăng nhập</h4>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-muted)" }}>
            Nếu nghi ngờ có hành vi đăng nhập lạ, bạn có thể buộc đăng xuất phiên làm việc trên các thiết bị khác.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ borderRadius: 100, fontSize: 13 }}
            onClick={handleLogoutAllDevices}
          >
            Đăng xuất khỏi tất cả thiết bị
          </button>
        </div>

        {/* Khối 5: Vùng nguy hiểm */}
        <div className="danger-zone-box">
          <h4>⚠️ Vùng nguy hiểm</h4>
          <p>
            Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu lịch sử bình chọn, danh hiệu và điểm thưởng. Thao tác này không thể hoàn tác.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              borderColor: "#FEB2B2",
              color: "#C53030",
              background: "#FFFFFF",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 750,
            }}
            onClick={() => setDeleteModalOpen(true)}
          >
            Xóa tài khoản vĩnh viễn
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="profile-modal-backdrop"
          onClick={() => setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="profile-modal-card"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <h3 style={{ color: "#C53030" }}>Xác nhận xóa tài khoản</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDeleteModalOpen(false)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 13.5, color: "var(--color-text)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Vui lòng nhập chữ <strong>XOA</strong> vào ô bên dưới để xác nhận xóa vĩnh viễn tài khoản của bạn:
              </p>

              <input
                type="text"
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value.toUpperCase())}
                placeholder="Nhập chữ XOA"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #FEB2B2",
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  marginBottom: 16,
                }}
              />

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ borderRadius: 100 }}
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={confirmDeleteText !== "XOA" || isDeleting}
                  onClick={handleDeleteAccount}
                  style={{
                    borderRadius: 100,
                    background: confirmDeleteText === "XOA" ? "#C53030" : "#E2E8F0",
                    color: "#FFFFFF",
                    border: 0,
                    padding: "8px 20px",
                    fontWeight: 750,
                    cursor: confirmDeleteText === "XOA" ? "pointer" : "not-allowed",
                  }}
                >
                  {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
