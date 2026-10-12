"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Page } from "@/types"
import Icon from "@/components/shared/Icon"
import { useAppContext } from "@/context/AppContext"

export const pageLabels: Record<Page, string> = {
  home: "Trang chủ",
  explore: "Danh sách điểm đến",
  detail: "Chi tiết điểm đến",
  vote: "Bình chọn & kết quả",
  cms: "Quản trị nội dung",
  guide: "Hướng dẫn",
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-wrap wander-logo-wrap">
      <div className="logo-mark wander-logo-mark">
        <img
          src="/logo.png"
          alt="Logo Điểm Đến Du Lịch Nông Thôn Việt Nam Tốt Nhất 2026"
          className="wander-logo-img"
        />
      </div>
      {!compact && (
        <div className="wander-brand-text">
          <strong className="wander-brand-name">
            ĐIỂM ĐẾN DU LỊCH NÔNG THÔN
          </strong>
          <small className="wander-brand-sub">
            VIỆT NAM TỐT NHẤT 2026
          </small>
        </div>
      )}
    </div>
  )
}

export default function Header({
  page: propPage,
  setPage: propSetPage,
}: {
  page?: Page
  setPage?: (page: Page) => void
  favoritesCount?: number
} = {}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const context = useAppContext()

  let detectedPage: Page = "home"
  if (pathname?.startsWith("/cms")) {
    detectedPage = "cms"
  } else if (pathname?.startsWith("/destination")) {
    detectedPage = "detail"
  } else if (pathname?.startsWith("/explore")) {
    detectedPage = "explore"
  } else if (pathname?.startsWith("/vote")) {
    detectedPage = "vote"
  } else if (pathname?.startsWith("/guide")) {
    detectedPage = "guide"
  }

  const page = propPage || detectedPage
  const setPage = propSetPage || context?.navigate || (() => { })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const go = (next: Page) => {
    setPage(next)
    setOpen(false)
  }

  return (
    <header
      className={`site-header ${page === "home" ? "is-home-header" : ""} ${scrolled ? "is-scrolled" : "is-at-top"
        }`}
    >
      {/* Dual Portal Switcher Topbar
      <div className="portal-switcher-strip">
        <div className="container portal-switcher-inner">
          <div className="portal-left-hint">
            <span className="live-pulse-dot" />
            <span>
              HỘI THI BÌNH CHỌN ĐIỂM ĐẾN • 68 HỒ SƠ ĐỀ CỬ
            </span>
          </div>

          <div className="portal-switch-buttons">
            <button
              type="button"
              className={`portal-tab-btn ${page !== "cms" ? "active" : ""}`}
              onClick={() => go("home")}
              title="Chuyển sang cổng thông tin và bình chọn dành cho công chúng"
            >
              <Icon name="spark" size={13} />
              <span>Cổng thông tin & bình chọn</span>
            </button>

            <button
              type="button"
              className={`portal-tab-btn ${page === "cms" ? "active" : ""}`}
              onClick={() => go("cms")}
              title="Chuyển sang hệ thống quản trị nội dung CMS"
            >
              <Icon name="lock" size={13} />
              <span>Hệ thống quản trị nội dung</span>
              <span className="cms-lock-badge">Bảo mật</span>
            </button>
          </div>
        </div>
      </div> */}

      <div className="container header-inner">
        <button className="logo-button" onClick={() => go("home")}>
          <Logo />
        </button>

        <nav className="desktop-nav wander-desktop-nav">
          {(["home", "explore", "vote"] as Page[]).map((item) => (
            <button
              key={item}
              onClick={() => go(item)}
              className={page === item ? "active" : ""}
            >
              {pageLabels[item]}
              {item === "explore" && (
                <span className="nav-dropdown-caret">⌵</span>
              )}
            </button>
          ))}
        </nav>

        <div className="header-actions">


          <button
            onClick={() => go("cms")}
            className="btn btn-secondary desktop-only admin-entry-btn"
            title="Đến hệ thống quản trị nội dung CMS"
          >
            <Icon name="lock" size={14} /> Quản trị CMS
          </button>

          <button
            onClick={() => go("vote")}
            className="wander-cta-pill desktop-only"
          >
            Vào bình chọn <Icon name="arrow" size={16} />
          </button>

          <button
            className="icon-button mobile-only"
            onClick={() => setOpen(!open)}
            aria-label="Mở menu"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav">
          <div className="mobile-portal-switch">
            <button
              className={`mobile-switch-btn ${page !== "cms" ? "active" : ""}`}
              onClick={() => go("home")}
            >
              Cổng thông tin & bình chọn
            </button>
            <button
              className={`mobile-switch-btn ${page === "cms" ? "active" : ""}`}
              onClick={() => go("cms")}
            >
              Hệ thống quản trị CMS
            </button>
          </div>

          {(["home", "explore", "vote"] as Page[]).map((item) => (
            <button key={item} onClick={() => go(item)}>
              <span>{pageLabels[item]}</span>
              <Icon name="arrow" size={18} />
            </button>
          ))}

          <button onClick={() => go("cms")} className="mobile-admin-link">
            <span>Đăng nhập hệ thống quản trị CMS</span>
            <Icon name="arrow" size={18} />
          </button>
        </nav>
      )}
    </header>
  )
}
