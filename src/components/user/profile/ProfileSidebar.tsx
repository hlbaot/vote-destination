"use client"

import React, { useState, useRef } from "react"
import Icon from "@/components/shared/Icon"
import { UserProfile, ProfileTab } from "@/types/profile"
import AvatarCropModal from "./AvatarCropModal"

interface ProfileSidebarProps {
  profile: UserProfile
  activeTab: ProfileTab
  onSelectTab: (tab: ProfileTab) => void
  onProfileUpdated?: (updated: UserProfile) => void
}

const TABS: Array<{ id: ProfileTab; label: string; icon: string }> = [
  { id: "thong-tin", label: "Thông tin cá nhân", icon: "user" },
  { id: "vote", label: "Quản lý lượt vote", icon: "spark" },
  { id: "lich-su", label: "Lịch sử bình chọn", icon: "map" },
  { id: "quiz", label: "Lịch sử Quiz", icon: "shield" },
  { id: "xep-hang", label: "Thứ hạng & Huy hiệu", icon: "spark" },
  { id: "cai-dat", label: "Cài đặt tài khoản", icon: "lock" },
]

export default function ProfileSidebar({
  profile,
  activeTab,
  onSelectTab,
  onProfileUpdated,
}: ProfileSidebarProps) {
  const { levelProgress } = profile
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const avatarBtnRef = useRef<HTMLButtonElement>(null)

  const handleAvatarSuccess = (newAvatarUrl: string) => {
    onProfileUpdated?.({
      ...profile,
      avatarUrl: newAvatarUrl,
    })
  }

  return (
    <aside className="profile-sidebar">
      {/* Thẻ tóm tắt hồ sơ */}
      <div className="profile-summary-card">
        {/* Wrapper cha cố định 96px, chứa button tròn overflow: hidden và badge bên ngoài */}
        <div className="profile-avatar-outer">
          <button
            ref={avatarBtnRef}
            type="button"
            className="profile-avatar-btn"
            onClick={() => setIsCropModalOpen(true)}
            aria-label="Đổi ảnh đại diện"
            title="Đổi ảnh đại diện"
          >
            <img
              src={
                profile.avatarUrl ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
              }
              alt={profile.name}
              className="profile-avatar-img"
            />

            {/* Hover & Focus overlay kín hình tròn: chỉ có icon cây bút trắng 24px */}
            <div className="avatar-hover-overlay" aria-hidden="true">
              <Icon name="edit" size={24} />
            </div>

            {/* Touch fallback badge cho thiết bị cảm ứng */}
            <div className="avatar-touch-badge" aria-hidden="true">
              <Icon name="edit" size={13} />
            </div>
          </button>

          {/* Badge lá nhỏ/cấp độ nằm NGOÀI wrapper overflow, neo theo wrapper cha */}
          <div
            className="avatar-level-badge"
            title={`Cấp độ: ${profile.level}`}
            aria-hidden="true"
          >
            {profile.level === "Mầm"
              ? "🌱"
              : profile.level === "Cây non"
              ? "🌿"
              : profile.level === "Cây lớn"
              ? "🌳"
              : "🌸"}
          </div>
        </div>

        <div className="profile-user-titles">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <span className="profile-badge-role">
            <Icon name="check" size={12} /> Thành viên bình chọn
          </span>
          <span className="profile-join-date">
            Tham gia: {profile.joinedAt}
          </span>
        </div>

        {/* Khối Cấp độ & Thanh tiến trình */}
        <div className="profile-level-box">
          <div className="level-box-header">
            <span className="level-tag">
              <span>
                {profile.level === "Mầm"
                  ? "🌱"
                  : profile.level === "Cây non"
                  ? "🌿"
                  : profile.level === "Cây lớn"
                  ? "🌳"
                  : "🌸"}
              </span>
              <span>Cấp: {profile.level}</span>
            </span>
            <span className="level-pct">{levelProgress.percent}%</span>
          </div>

          <div
            className="level-progress-bar"
            role="progressbar"
            aria-valuenow={levelProgress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến trình cấp ${profile.level}`}
          >
            <div
              className="level-progress-fill"
              style={{ width: `${levelProgress.percent}%` }}
            />
          </div>

          <small className="level-hint-text">
            {levelProgress.nextLevel
              ? `Còn ${levelProgress.remainingToNext} lượt vote để lên cấp ${levelProgress.nextLevel}`
              : "Bạn đã đạt cấp độ cao nhất! 🌸"}
          </small>
        </div>

        {/* 3 Chỉ số nhanh */}
        <div className="profile-quick-stats-grid">
          <div className="quick-stat-item">
            <strong className="quick-stat-num">{profile.stats.totalVotes}</strong>
            <span className="quick-stat-lbl">Lượt đã vote</span>
          </div>
          <div className="quick-stat-item">
            <strong className="quick-stat-num">{profile.stats.totalDestinations}</strong>
            <span className="quick-stat-lbl">Điểm đến</span>
          </div>
          <div className="quick-stat-item">
            <strong className="quick-stat-num">#{profile.stats.myRank}</strong>
            <span className="quick-stat-lbl">Thứ hạng</span>
          </div>
        </div>
      </div>

      {/* Menu tab dọc */}
      <nav className="profile-tabs-sidebar" aria-label="Menu hồ sơ">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              id={`profile-tab-${tab.id}`}
              className={`profile-tab-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls="profile-tabpanel"
            >
              <span className="tab-icon-wrap" aria-hidden="true">
                <Icon name={tab.icon as any} size={16} />
              </span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Shared Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        currentAvatar={profile.avatarUrl}
        onClose={() => setIsCropModalOpen(false)}
        onSuccess={handleAvatarSuccess}
        triggerElementRef={avatarBtnRef}
      />
    </aside>
  )
}
