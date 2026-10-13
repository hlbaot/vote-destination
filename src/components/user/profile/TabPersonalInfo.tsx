"use client"

import React, { useState, useRef } from "react"
import Icon from "@/components/shared/Icon"
import { UserProfile } from "@/types/profile"
import { VIETNAM_PROVINCES } from "@/config/profile"
import { profileService } from "@/lib/profile/profileService"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"
import AvatarCropModal from "./AvatarCropModal"

interface TabPersonalInfoProps {
  profile: UserProfile
  onProfileUpdated: (updated: UserProfile) => void
}

export default function TabPersonalInfo({
  profile,
  onProfileUpdated,
}: TabPersonalInfoProps) {
  const { updateCurrentUser, user } = useAuth()
  const appContext = useAppContext()

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone || "")
  const [province, setProvince] = useState(profile.province || "Hà Nội")
  const [bio, setBio] = useState(profile.bio || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameError, setNameError] = useState("")

  // Modal đổi ảnh dùng chung
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const changePicBtnRef = useRef<HTMLButtonElement>(null)

  const hasChanged =
    name !== profile.name ||
    phone !== (profile.phone || "") ||
    province !== (profile.province || "") ||
    bio !== (profile.bio || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError("")

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên hiển thị.")
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await profileService.updateProfile(profile.id, {
        name: name.trim(),
        phone: phone.trim(),
        province,
        bio: bio.trim(),
      })

      // Update auth context so Header name refreshes instantly
      updateCurrentUser({ name: updated.name })
      onProfileUpdated(updated)
      appContext?.addToast?.("success", "Đã lưu thông tin cá nhân thành công! 🎉")
    } catch {
      appContext?.addToast?.("warning", "Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setName(profile.name)
    setPhone(profile.phone || "")
    setProvince(profile.province || "Hà Nội")
    setBio(profile.bio || "")
    setNameError("")
  }

  const handleAvatarSuccess = (newAvatarUrl: string) => {
    onProfileUpdated({
      ...profile,
      avatarUrl: newAvatarUrl,
    })
  }

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-thong-tin"
      aria-labelledby="tab-thong-tin"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Thông tin cá nhân</h2>
          <p>Quản lý tên hiển thị, địa phương và lời tự bạch của bạn trên hệ thống bình chọn.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="personal-info-form" noValidate>
        {/* Hàng đổi ảnh tinh gọn (Avatar tròn 72px + Nút Đổi ảnh + Chú thích 2MB) */}
        <div className="profile-avatar-compact-row">
          <img
            src={
              profile.avatarUrl ||
              user?.avatarUrl ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
            }
            alt={profile.name}
            className="avatar-compact-img"
            onClick={() => setIsCropModalOpen(true)}
            title="Bấm để đổi ảnh đại diện"
          />

          <div className="avatar-compact-meta">
            <button
              ref={changePicBtnRef}
              type="button"
              className="btn-change-picture"
              onClick={() => setIsCropModalOpen(true)}
              aria-label="Đổi ảnh đại diện"
            >
              <Icon name="edit" size={16} />
              <span>Đổi ảnh</span>
            </button>
            <span className="avatar-compact-note">
              JPG, PNG hoặc WebP, tối đa 2MB
            </span>
          </div>
        </div>

        {/* Email & Google Status (Locked) */}
        <div className="form-row-2col">
          <div className="form-group-item">
            <label htmlFor="user-email">Địa chỉ Email</label>
            <input
              id="user-email"
              type="email"
              value={profile.email}
              disabled
              aria-describedby="email-desc"
            />
            <span id="email-desc" className="field-hint-text">
              🔒 Được đồng bộ và bảo mật từ tài khoản Google
            </span>
          </div>

          <div className="form-group-item">
            <label htmlFor="user-joined">Ngày gia nhập</label>
            <input
              id="user-joined"
              type="text"
              value={profile.joinedAt}
              disabled
            />
            <span className="field-hint-text">
              Thời gian khởi tạo hồ sơ bình chọn
            </span>
          </div>
        </div>

        {/* Tên hiển thị & Số điện thoại */}
        <div className="form-row-2col">
          <div className="form-group-item">
            <label htmlFor="user-name">Tên hiển thị *</label>
            <input
              id="user-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError("")
              }}
              placeholder="Nhập tên hiển thị của bạn"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            {nameError ? (
              <span id="name-error" className="field-hint-text" style={{ color: "#e53e3e" }}>
                {nameError}
              </span>
            ) : (
              <span className="field-hint-text">
                Tên sẽ xuất hiện trên bảng vinh danh và bình luận
              </span>
            )}
          </div>

          <div className="form-group-item">
            <label htmlFor="user-phone">Số điện thoại (tùy chọn)</label>
            <input
              id="user-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
            />
            <span className="field-hint-text">
              Dùng để liên hệ trao giải khi thắng bình chọn
            </span>
          </div>
        </div>

        {/* Tỉnh/thành phố */}
        <div className="form-group-item">
          <label htmlFor="user-province">Tỉnh / Thành phố đang sinh sống</label>
          <select
            id="user-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {VIETNAM_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="field-hint-text">
            Giúp hệ thống giới thiệu các điểm đến nông thôn gần bạn nhất
          </span>
        </div>

        {/* Lời giới thiệu ngắn (Giới hạn 120 ký tự) */}
        <div className="form-group-item">
          <label htmlFor="user-bio">Lời tự bạch ngắn (Bio)</label>
          <textarea
            id="user-bio"
            maxLength={120}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Chia sẻ niềm yêu thích của bạn về quê hương và du lịch nông thôn..."
          />
          <div className="field-hint-text">
            <span>Tối đa 120 ký tự</span>
            <span>{bio.length}/120</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="form-actions-row">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!hasChanged || isSubmitting}
            onClick={handleReset}
            style={{ borderRadius: 100 }}
          >
            Hủy thay đổi
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!hasChanged || isSubmitting}
            style={{ borderRadius: 100 }}
          >
            {isSubmitting ? (
              <>
                <Icon name="spark" size={16} /> Đang lưu...
              </>
            ) : (
              <>
                <Icon name="check" size={16} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>

      {/* Shared Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        currentAvatar={profile.avatarUrl}
        onClose={() => setIsCropModalOpen(false)}
        onSuccess={handleAvatarSuccess}
        triggerElementRef={changePicBtnRef}
      />
    </div>
  )
}
