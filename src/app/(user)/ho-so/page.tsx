"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Icon from "@/components/shared/Icon"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"
import { UserProfile, ProfileTab } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"

import ProfileSidebar from "@/components/user/profile/ProfileSidebar"
import TabPersonalInfo from "@/components/user/profile/TabPersonalInfo"
import TabVoteManagement from "@/components/user/profile/TabVoteManagement"
import TabVoteHistory from "@/components/user/profile/TabVoteHistory"
import TabQuizHistory from "@/components/user/profile/TabQuizHistory"
import TabRanking from "@/components/user/profile/TabRanking"
import TabSettings from "@/components/user/profile/TabSettings"

const VALID_TABS: ProfileTab[] = [
  "thong-tin",
  "vote",
  "lich-su",
  "quiz",
  "xep-hang",
  "cai-dat",
]

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, status } = useAuth()
  const appContext = useAppContext()

  // Deep link tab param
  const tabParam = searchParams.get("tab") as ProfileTab | null
  const initialTab: ProfileTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "thong-tin"

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync tab with URL parameter if it changes from outside (e.g. forward/backward or link)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  // Access Control: Role "user" only
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dang-nhap?returnTo=/ho-so")
      return
    }

    if (status === "authenticated" && user?.role === "admin") {
      appContext?.addToast?.("warning", "Trang này dành cho người dùng")
      router.push("/admin")
    }
  }, [status, user, router, appContext])

  // Load Profile Data
  const loadProfile = useCallback(async () => {
    if (!user || user.role !== "user") return
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getProfile(user.id)
      setProfile(data)
    } catch (err) {
      console.error("Failed to load profile:", err)
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (status === "authenticated" && user && user.role === "user") {
      loadProfile()
    }
  }, [status, user, loadProfile])

  // Handle Tab Switch & Update URL without full reload
  const handleSelectTab = (tab: ProfileTab) => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", tab)
      window.history.replaceState(null, "", url.pathname + url.search)
    }
  }

  // Handle profile update from TabPersonalInfo
  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated)
  }

  // Unauthenticated or Admin redirecting state
  if (status === "loading" || status === "unauthenticated" || !user || user.role === "admin") {
    return (
      <div className="profile-hub-page">
        <div className="profile-hub-layout" style={{ justifyContent: "center", gridTemplateColumns: "1fr" }}>
          <div className="profile-panel-card" style={{ maxWidth: 460, margin: "40px auto", textAlign: "center" }}>
            <div className="header-avatar-skeleton" style={{ width: 64, height: 64, margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Đang chuyển hướng và tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="profile-hub-page">
        <nav className="profile-hub-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Hồ sơ của tôi</span>
        </nav>
        <div className="profile-hub-layout">
          <aside className="profile-sidebar">
            <div className="profile-summary-card">
              <div className="header-avatar-skeleton" style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 14px" }} />
              <div className="header-avatar-skeleton" style={{ width: 140, height: 20, margin: "0 auto 8px" }} />
              <div className="header-avatar-skeleton" style={{ width: 180, height: 14, margin: "0 auto" }} />
            </div>
          </aside>
          <main className="profile-main-content">
            <div className="profile-panel-card">
              <div className="header-avatar-skeleton" style={{ width: 220, height: 26, marginBottom: 16 }} />
              <div className="header-avatar-skeleton" style={{ width: "100%", height: 180, borderRadius: 14 }} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="profile-hub-page">
        <div className="profile-hub-layout" style={{ justifyContent: "center", gridTemplateColumns: "1fr" }}>
          <div className="profile-panel-card" style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text)", marginBottom: 8 }}>
              {error || "Không tìm thấy thông tin hồ sơ"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>
              Đã có lỗi xảy ra khi truy xuất dữ liệu từ hệ thống.
            </p>
            <button
              type="button"
              onClick={loadProfile}
              className="btn btn-primary"
              style={{ borderRadius: 100 }}
            >
              <Icon name="spark" size={16} /> Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-hub-page">
      {/* Breadcrumb */}
      <nav className="profile-hub-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Hồ sơ của tôi</span>
      </nav>

      {/* Main 2-column Layout */}
      <div className="profile-hub-layout">
        {/* Left Sticky Column (300px) */}
        <ProfileSidebar
          profile={profile}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onProfileUpdated={handleProfileUpdated}
        />

        {/* Right Content Area */}
        <main
          className="profile-main-content"
          id="profile-tabpanel"
          role="tabpanel"
          aria-labelledby={`profile-tab-${activeTab}`}
        >
          {activeTab === "thong-tin" && (
            <TabPersonalInfo
              profile={profile}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {activeTab === "vote" && (
            <TabVoteManagement userId={user.id} />
          )}

          {activeTab === "lich-su" && (
            <TabVoteHistory userId={user.id} />
          )}

          {activeTab === "quiz" && (
            <TabQuizHistory userId={user.id} />
          )}

          {activeTab === "xep-hang" && (
            <TabRanking userId={user.id} profile={profile} />
          )}

          {activeTab === "cai-dat" && (
            <TabSettings userId={user.id} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function HoSoPage() {
  return (
    <Suspense
      fallback={
        <div className="profile-hub-page">
          <div className="profile-hub-layout" style={{ justifyContent: "center", gridTemplateColumns: "1fr" }}>
            <div className="profile-panel-card" style={{ maxWidth: 460, margin: "40px auto", textAlign: "center" }}>
              <div className="header-avatar-skeleton" style={{ width: 64, height: 64, margin: "0 auto 16px" }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Đang tải Hồ sơ của tôi...</p>
            </div>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
