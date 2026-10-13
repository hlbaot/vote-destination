"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Page } from "@/types"
import Icon from "@/components/shared/Icon"
import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"
import { useVotes } from "@/lib/store/useVotes"

export const pageLabels: Record<Page, string> = {
  home: "Trang chủ",
  explore: "Danh sách điểm đến",
  detail: "Chi tiết điểm đến",
  vote: "Bình chọn & kết quả",
  cms: "Quản trị nội dung",
  guide: "Hướng dẫn",
  profile: "Hồ sơ của tôi",
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const context = useAppContext()
  const { user, status, logout } = useAuth()
  const { remainingToday, totalQuota } = useVotes()
  const dropdownRef = useRef<HTMLDivElement>(null)


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
  } else if (pathname?.startsWith("/ho-so")) {
    detectedPage = "profile"
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

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false)
      }
    }
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [userDropdownOpen])

  const go = (next: Page) => {
    setPage(next)
    setOpen(false)
    setUserDropdownOpen(false)
  }

  const handleLogout = async () => {
    setUserDropdownOpen(false)
    setOpen(false)
    await logout()
    context?.addToast?.("info", "Đã đăng xuất thành công")
    if (pathname?.startsWith("/cms") || pathname?.startsWith("/ho-so")) {
      router.push("/")
    }
  }

  return (
    <header
      className={`site-header ${page === "home" ? "is-home-header" : ""} ${
        scrolled ? "is-scrolled" : "is-at-top"
      }`}
    >
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
          {/* Admin quick entry if user is admin */}
          {user?.role === "admin" && (
            <Link
              href="/cms"
              className="header-admin-quick-btn desktop-only"
              title="Đến hệ thống quản trị nội dung CMS"
            >
              <Icon name="shield" size={14} /> Quản trị CMS
            </Link>
          )}

          {/* Auth State Handling */}
          {status === "loading" ? (
            <div
              className="header-avatar-skeleton"
              aria-label="Đang kiểm tra phiên đăng nhập"
              title="Đang tải..."
            />
          ) : status === "authenticated" && user ? (
            <div className="header-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="header-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
                aria-label={`Tài khoản: ${user.name}`}
              >
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                  alt={user.name}
                  className="header-user-avatar"
                />
                <span className="header-user-name desktop-only">{user.name}</span>
                <span className="nav-dropdown-caret desktop-only">⌵</span>
              </button>

              {userDropdownOpen && (
                <div className="header-user-dropdown" role="menu">
                  <div className="dropdown-profile">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                      alt={user.name}
                      className="dropdown-avatar"
                    />
                    <div className="dropdown-info">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                      <span
                        className={`dropdown-role-badge role-${user.role}`}
                      >
                        {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-quota-banner">
                    <span>Lượt bình chọn hôm nay</span>
                    <strong>{remainingToday}/{totalQuota} lượt</strong>
                  </div>

                  <div className="dropdown-menu-list">
                    <Link
                      href="/ho-so"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Icon name="user" size={15} />
                      <span>Hồ sơ của tôi</span>
                    </Link>

                    <Link
                      href="/ho-so?tab=vote"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Icon name="spark" size={15} />
                      <span>Phiếu bình chọn của tôi</span>
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/cms"
                        className="dropdown-item"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Icon name="shield" size={15} />
                        <span>Vào trang quản trị</span>
                      </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item dropdown-item-danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <Icon name="x" size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth-group desktop-only">
              <Link href="/dang-nhap" className="header-login-btn">
                <Icon name="user" size={14} /> Đăng nhập
              </Link>
              <Link href="/dang-ky" className="header-register-btn">
                Đăng ký
              </Link>
            </div>
          )}

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
          {/* User Status in Mobile Nav */}
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                background: "var(--color-surface-tint)",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "2px solid var(--color-primary)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name}
                </strong>
                <small style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                  Còn {remainingToday}/{totalQuota} lượt vote hôm nay
                </small>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <Link
                href="/dang-nhap"
                className="header-login-btn"
                style={{ justifyContent: "center" }}
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                className="header-register-btn"
                style={{ justifyContent: "center" }}
                onClick={() => setOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
          )}

          {(["home", "explore", "vote"] as Page[]).map((item) => (
            <button key={item} onClick={() => go(item)}>
              <span>{pageLabels[item]}</span>
              <Icon name="arrow" size={18} />
            </button>
          ))}

          {user && (
            <Link
              href="/ho-so"
              className="dropdown-item"
              style={{ padding: "12px 14px", borderRadius: "8px" }}
              onClick={() => setOpen(false)}
            >
              <span>Hồ sơ của tôi</span>
              <Icon name="arrow" size={18} />
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/cms"
              className="mobile-admin-link"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                textDecoration: "none",
              }}
              onClick={() => setOpen(false)}
            >
              <span>Hệ thống quản trị CMS</span>
              <Icon name="arrow" size={18} />
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              style={{
                color: "#e53e3e",
                justifyContent: "space-between",
                marginTop: "4px",
              }}
            >
              <span>Đăng xuất</span>
              <Icon name="x" size={16} />
            </button>
          )}
        </nav>
      )}
    </header>
  )
}

