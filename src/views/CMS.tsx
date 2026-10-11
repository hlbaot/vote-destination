"use client"

import { useState } from "react"
import {
  Destination,
  Page,
  VoteRecord,
  AdminAccount,
  AdminRole,
  IconName,
} from "../types"
import { Logo } from "../components/Header"
import Icon from "../components/Icon"
import AddDestinationModal from "../components/AddDestinationModal"

export type CMSTab = "Tổng quan" | "Điểm đến" | "Bình chọn" | "Tài khoản" | "Cử tri" | "Cài đặt"

export default function CMS({
  destinations,
  voteRecords,
  adminAccounts,
  currentAdmin,
  onSwitchAdmin,
  onLogout,
  onAddAdminAccount,
  onToggleAdminStatus,
  onAddDestination,
  onToggleVisibility,
  onDeleteDestination,
  onExportCsv,
  onResetData,
  go,
}: {
  destinations: Destination[]
  voteRecords: VoteRecord[]
  adminAccounts: AdminAccount[]
  currentAdmin: AdminAccount
  onSwitchAdmin: (account: AdminAccount) => void
  onLogout: () => void
  onAddAdminAccount: (newAcc: AdminAccount) => void
  onToggleAdminStatus: (id: string) => void
  onAddDestination: (newDest: Destination) => void
  onToggleVisibility: (id: string) => void
  onDeleteDestination: (id: string) => void
  onExportCsv: () => void
  onResetData: () => void
  go: (page: Page) => void
}) {
  const [tab, setTab] = useState<CMSTab>("Tổng quan")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)
  const [searchDest, setSearchDest] = useState("")
  const [searchAdmin, setSearchAdmin] = useState("")
  const [votingPortalActive, setVotingPortalActive] = useState(true)

  // New admin form state
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminUser, setNewAdminUser] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("pass@2025")
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("moderator")
  const [newAdminDept, setNewAdminDept] = useState("Tổ Kiểm Tra & Đối Soát")

  // Compute stats
  const totalVotesCount = destinations.reduce((acc, d) => acc + d.rawVotes, 0)
  const visibleDestCount = destinations.filter((d) => d.isVisible).length
  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDest.toLowerCase()) ||
      d.place.toLowerCase().includes(searchDest.toLowerCase()),
  )

  const filteredAdmins = adminAccounts.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      a.email.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      a.roleTitle.toLowerCase().includes(searchAdmin.toLowerCase()),
  )

  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminName.trim() || !newAdminEmail.trim()) return

    const roleTitleMap: Record<AdminRole, string> = {
      superadmin: "Tổng Quản Trị Cấp Cao",
      moderator: "Kiểm Duyệt Viên Phiếu Bầu",
      editor: "Biên Tập Viên Di Sản",
      operator: "Kỹ Sư An Toàn Hệ Thống",
    }

    const defaultPerms: Record<AdminRole, string[]> = {
      superadmin: [
        "Toàn quyền quản trị hệ thống",
        "Quản lý điểm đến",
        "Kiểm toán phiếu",
        "Cài đặt",
      ],
      moderator: [
        "Kiểm toán phiếu bầu",
        "Kiểm tra bot OTP",
        "Xuất báo cáo CSV",
      ],
      editor: ["Thêm & sửa điểm đến", "Tải ảnh danh thắng", "Biên tập lời dẫn"],
      operator: ["Cấu hình tường lửa", "Giám sát máy chủ", "Khôi phục dữ liệu"],
    }

    const newAccount: AdminAccount = {
      id: "adm-" + Date.now().toString().slice(-4),
      fullName: newAdminName.trim(),
      email: newAdminEmail.trim(),
      username:
        newAdminUser.trim() || newAdminEmail.split("@")[0] || "admin_new",
      passwordDemo: newAdminPassword.trim() || "pass@2025",
      role: newAdminRole,
      roleTitle: roleTitleMap[newAdminRole],
      department: newAdminDept.trim() || "Ban Quản Trị",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=200",
      status: "active",
      lastLogin: "Chưa đăng nhập",
      permissions: defaultPerms[newAdminRole],
    }

    onAddAdminAccount(newAccount)
    setIsAddAdminModalOpen(false)
    setNewAdminName("")
    setNewAdminEmail("")
    setNewAdminUser("")
  }

  return (
    <main className="cms-shell">
      {/* Sidebar */}
      <aside className="cms-sidebar">
        <div className="sidebar-top-brand">
          <Logo compact />
          <div className="cms-brand-title">
            <strong>QUẢN TRỊ NỘI DUNG</strong>
            <small>Hội thi bình chọn điểm đến 2025</small>
          </div>
        </div>

        {/* Back to Public Web */}
        <div className="cms-nav-back">
          <button
            type="button"
            className="btn btn-secondary w-full btn-back-web"
            onClick={() => go("home")}
          >
            <Icon name="arrow" size={15} /> Về cổng thông tin
          </button>
        </div>

        {/* CMS Navigation Tabs */}
        <nav className="cms-nav-menu">
          {([
            { id: "Tổng quan", label: "Tổng quan", icon: "eye" },
            { id: "Điểm đến", label: "Điểm đến", icon: "map" },
            { id: "Bình chọn", label: "Phiếu bình chọn", icon: "check" },
            { id: "Tài khoản", label: "Tài khoản quản trị", icon: "user" },
            { id: "Cử tri", label: "Cử tri & Thuê bao", icon: "shield" },
            { id: "Cài đặt", label: "Cài đặt hệ thống", icon: "filter" },
          ] satisfies { id: CMSTab; label: string; icon: IconName }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as CMSTab)}
              className={tab === item.id ? "active" : ""}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.id === "Tài khoản" && (
                <span className="cms-nav-count">{adminAccounts.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Current Logged-in Admin Card */}
        <div className="cms-current-user-card">
          <div className="user-card-head">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.fullName}
              className="user-avatar-img"
            />
            <div className="user-card-meta">
              <strong>{currentAdmin.fullName}</strong>
              <small className="user-role-tag">{currentAdmin.roleTitle}</small>
            </div>
          </div>
          <div className="user-card-email">
            <code>{currentAdmin.email}</code>
          </div>
          <button
            type="button"
            className="btn-cms-logout"
            onClick={onLogout}
            title="Đăng xuất khỏi phiên quản trị"
          >
            <Icon name="logout" size={14} /> Đăng xuất quản trị
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="cms-main">
        <header className="cms-topbar-header">
          <div className="topbar-left-meta">
            <small>HỆ THỐNG QUẢN TRỊ NỘI DUNG, HỒ SƠ VÀ BÌNH CHỌN</small>
            <h1>{tab}</h1>
          </div>

          <div className="header-cms-actions">
            {tab === "Điểm đến" && (
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                <Icon name="plus" size={16} /> Thêm điểm đến mới
              </button>
            )}
            {tab === "Tài khoản" && (
              <button
                className="btn btn-primary"
                onClick={() => setIsAddAdminModalOpen(true)}
              >
                <Icon name="plus" size={16} /> Thêm tài khoản quản trị
              </button>
            )}
            {tab === "Bình chọn" && (
              <button className="btn btn-secondary" onClick={onExportCsv}>
                <Icon name="share" size={16} /> Xuất file CSV
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-header-logout"
              onClick={onLogout}
              title="Đăng xuất"
            >
              <Icon name="logout" size={14} /> Đăng xuất
            </button>
          </div>
        </header>

        {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
        {tab === "Tổng quan" && (
          <div className="cms-tab-content">
            <div className="metric-grid">
              <div>
                <span>TỔNG LƯỢT BÌNH CHỌN</span>
                <strong>{totalVotesCount.toLocaleString("vi-VN")}</strong>
                <small>↑ 12,4% so với tuần trước</small>
              </div>
              <div>
                <span>HỒ SƠ ĐANG HIỂN THỊ</span>
                <strong>
                  {visibleDestCount} / {destinations.length}
                </strong>
                <small>63 tỉnh thành cả nước</small>
              </div>
              <div>
                <span>TÀI KHOẢN QUẢN TRỊ VIÊN</span>
                <strong>{adminAccounts.length} cán bộ</strong>
                <small>Đang đăng nhập: {currentAdmin.fullName}</small>
              </div>
              <div>
                <span>TỈ LỆ XÁC MINH BOT</span>
                <strong>99.8%</strong>
                <small>Turnstile ngăn chặn 1.420 bot</small>
              </div>
            </div>

            {/* Weekly activity chart */}
            <div className="cms-card mb-6">
              <div className="table-head">
                <div>
                  <h2>Biểu đồ lưu lượng bình chọn 7 ngày qua</h2>
                  <p>Số lượng phiếu bình chọn hợp lệ được ghi nhận theo ngày</p>
                </div>
                <span className="badge-demo">THỜI GIAN THỰC</span>
              </div>
              <div className="chart-bar-container">
                {[
                  { day: "Thứ 2", votes: "18.2K", height: "45%" },
                  { day: "Thứ 3", votes: "21.5K", height: "55%" },
                  { day: "Thứ 4", votes: "19.8K", height: "48%" },
                  { day: "Thứ 5", votes: "26.4K", height: "70%" },
                  { day: "Thứ 6", votes: "32.1K", height: "85%" },
                  { day: "Thứ 7", votes: "38.5K", height: "100%" },
                  { day: "CN (Hôm nay)", votes: "24.8K", height: "65%" },
                ].map((col) => (
                  <div key={col.day} className="chart-bar-item">
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{ height: col.height }}
                        title={`${col.day}: ${col.votes}`}
                      />
                    </div>
                    <strong>{col.votes}</strong>
                    <span>{col.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Leaderboard and Live Feed */}
            <div className="cms-grid-2">
              <div className="cms-content">
                <div className="table-head">
                  <div>
                    <h2>Top 5 Điểm đến dẫn đầu</h2>
                    <p>Cập nhật theo thứ hạng phiếu bầu hiện tại</p>
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setTab("Điểm đến")}
                  >
                    Xem tất cả →
                  </button>
                </div>

                <div className="data-table">
                  {destinations.slice(0, 5).map((d, i) => (
                    <div className="table-row" key={d.id}>
                      <span className="table-rank">#{i + 1}</span>
                      <img src={d.image} alt="" />
                      <div>
                        <strong>{d.name}</strong>
                        <small>{d.place}</small>
                      </div>
                      <span className="status">Đang hiển thị</span>
                      <strong>{d.votes}</strong>
                      <span className="text-tag">{d.tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live recent votes feed */}
              <div className="cms-content">
                <div className="table-head">
                  <div>
                    <h2>Nhật ký bình chọn vừa diễn ra</h2>
                    <p>Các giao dịch hợp lệ vừa được ghi nhận</p>
                  </div>
                  <span className="live-label">
                    <i /> LIVE FEED
                  </span>
                </div>
                <div className="feed-list">
                  {voteRecords.slice(0, 6).map((record) => (
                    <div key={record.id} className="feed-item">
                      <div className="feed-icon">
                        <Icon name="check" size={14} />
                      </div>
                      <div className="feed-info">
                        <strong>
                          {record.maskedPhone} đã bình chọn cho{" "}
                          <span>{record.destinationName}</span>
                        </strong>
                        <small>
                          Mã: {record.receiptCode} • {record.device}
                        </small>
                      </div>
                      <span className="feed-time">{record.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ĐIỂM ĐẾN (DESTINATIONS MANAGEMENT) */}
        {tab === "Điểm đến" && (
          <div className="cms-content">
            <div className="table-head">
              <div className="search-box-cms">
                <Icon name="search" size={16} />
                <input
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  placeholder="Tìm kiếm điểm đến theo tên, tỉnh thành..."
                />
              </div>
              <div className="table-head-info">
                <span>Tổng số: {destinations.length} hồ sơ</span>
              </div>
            </div>

            <div className="data-table">
              {filteredDestinations.map((d, i) => (
                <div className="table-row table-row-dest" key={d.id}>
                  <span className="table-rank">#{i + 1}</span>
                  <img src={d.image} alt="" />
                  <div>
                    <strong>{d.name}</strong>
                    <small>
                      {d.place} (Miền {d.region}) • {d.tag}
                      {d.gallery && d.gallery.length > 1 && (
                        <span className="gallery-count-pill">
                          {" "}
                          • {d.gallery.length} ảnh
                        </span>
                      )}
                    </small>
                  </div>
                  <div>
                    <button
                      className={`status-btn ${
                        d.isVisible ? "visible" : "hidden"
                      }`}
                      onClick={() => onToggleVisibility(d.id)}
                      title="Nhấn để bật/tắt hiển thị"
                    >
                      {d.isVisible ? "● Đang hiển thị" : "○ Tạm ẩn"}
                    </button>
                  </div>
                  <strong>{d.votes} vote</strong>
                  <div className="action-row">
                    <button
                      className="icon-action-btn delete"
                      onClick={() => onDeleteDestination(d.id)}
                      title="Xóa điểm đến"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BÌNH CHỌN (VOTES LOG) */}
        {tab === "Bình chọn" && (
          <div className="cms-content">
            <div className="table-head">
              <div>
                <h2>Danh sách biên nhận bình chọn</h2>
                <p>Tra cứu mã xác nhận, địa chỉ IP và trạng thái xác minh</p>
              </div>
              <button className="btn btn-secondary" onClick={onExportCsv}>
                <Icon name="share" size={16} /> Xuất CSV
              </button>
            </div>

            <div className="data-table">
              <div className="table-header-row">
                <span>MÃ BIÊN NHẬN</span>
                <span>ĐIỂM ĐẾN</span>
                <span>SỐ ĐIỆN THOẠI</span>
                <span>THỜI GIAN</span>
                <span>IP / THIẾT BỊ</span>
                <span>TRẠNG THÁI</span>
              </div>
              {voteRecords.map((r) => (
                <div className="table-row table-row-votes" key={r.id}>
                  <strong className="code-font">{r.receiptCode}</strong>
                  <span>{r.destinationName}</span>
                  <span className="masked-font">{r.maskedPhone}</span>
                  <small>{r.timestamp}</small>
                  <small>
                    {r.ip} • {r.device}
                  </small>
                  <span className="status verified">
                    <Icon name="shield" size={11} /> Đã xác thực
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TÀI KHOẢN QUẢN TRỊ (MOCK ADMIN ACCOUNTS MANAGEMENT) */}
        {tab === "Tài khoản" && (
          <div className="cms-content">
            <div className="table-head">
              <div>
                <h2>Danh sách Tài Khoản Quản Trị Hệ Thống (Mock Data)</h2>
                <p>
                  Các tài khoản được phân quyền điều hành cổng bình chọn quốc
                  gia 2025. Bạn có thể bấm &quot;Đổi vai trò&quot; để trải nghiệm các
                  quyền hạn khác nhau.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setIsAddAdminModalOpen(true)}
              >
                <Icon name="plus" size={15} /> Thêm tài khoản mới
              </button>
            </div>

            {/* Admin Stats */}
            <div className="metric-grid-users mb-4">
              <div className="user-kpi">
                <span>TỔNG TÀI KHOẢN MẪU</span>
                <strong>{adminAccounts.length} cán bộ</strong>
                <small>Đầy đủ 4 cấp phân quyền quản trị</small>
              </div>
              <div className="user-kpi">
                <span>TÀI KHOẢN ĐANG ĐĂNG NHẬP</span>
                <strong>{currentAdmin.fullName}</strong>
                <small>
                  Vai trò: {currentAdmin.roleTitle} ({currentAdmin.email})
                </small>
              </div>
            </div>

            {/* Search Admin Box */}
            <div className="search-admin-bar">
              <div className="search-box-cms">
                <Icon name="search" size={15} />
                <input
                  value={searchAdmin}
                  onChange={(e) => setSearchAdmin(e.target.value)}
                  placeholder="Tìm tài khoản theo tên, email, vai trò..."
                />
              </div>
            </div>

            {/* Admin Accounts Table */}
            <div className="data-table">
              <div className="table-header-row table-header-admins">
                <span>CÁN BỘ QUẢN TRỊ</span>
                <span>EMAIL & TÀI KHOẢN</span>
                <span>VAI TRÒ & PHÒNG BAN</span>
                <span>QUYỀN HẠN ĐƯỢC CẤP</span>
                <span>TRẠNG THÁI</span>
                <span>THAO TÁC</span>
              </div>

              {filteredAdmins.map((acc) => {
                const isCurrent = acc.id === currentAdmin.id
                const isLocked = acc.status === "locked"

                const roleBadgeClass =
                  acc.role === "superadmin"
                    ? "badge-super"
                    : acc.role === "moderator"
                      ? "badge-mod"
                      : acc.role === "editor"
                        ? "badge-editor"
                        : "badge-operator"

                return (
                  <div
                    key={acc.id}
                    className={`table-row table-row-admins ${
                      isCurrent ? "current-session-row" : ""
                    }`}
                  >
                    {/* User info */}
                    <div className="admin-profile-cell">
                      <img
                        src={acc.avatar}
                        alt={acc.fullName}
                        className="admin-avatar-thumb"
                      />
                      <div>
                        <strong>{acc.fullName}</strong>
                        {isCurrent ? (
                          <span className="current-user-badge">
                            ● Bạn đang đăng nhập
                          </span>
                        ) : (
                          <small>ID: {acc.id}</small>
                        )}
                      </div>
                    </div>

                    {/* Email & Username */}
                    <div className="admin-email-cell">
                      <code>{acc.email}</code>
                      <small>
                        User: {acc.username} • Pass: {acc.passwordDemo}
                      </small>
                    </div>

                    {/* Role & Dept */}
                    <div>
                      <span className={`role-badge ${roleBadgeClass}`}>
                        {acc.roleTitle}
                      </span>
                      <small className="dept-text">{acc.department}</small>
                    </div>

                    {/* Permissions list summary */}
                    <div className="perms-summary-cell">
                      <span>{acc.permissions.slice(0, 2).join(", ")}</span>
                      {acc.permissions.length > 2 && (
                        <small>+{acc.permissions.length - 2} quyền khác</small>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`status-pill ${
                          isLocked
                            ? "status-locked"
                            : acc.status === "active"
                              ? "status-active"
                              : "status-inactive"
                        }`}
                      >
                        {isLocked
                          ? "Tạm khóa"
                          : acc.status === "active"
                            ? "Hoạt động"
                            : "Ngoại tuyến"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="admin-actions-cell">
                      {!isCurrent && (
                        <button
                          type="button"
                          className="btn-switch-account"
                          onClick={() => onSwitchAdmin(acc)}
                          title="Chuyển ngay sang phiên làm việc của tài khoản này"
                        >
                          Đổi vai trò ⚡
                        </button>
                      )}
                      <button
                        type="button"
                        className={`btn-toggle-lock ${
                          isLocked ? "unlock" : "lock"
                        }`}
                        onClick={() => onToggleAdminStatus(acc.id)}
                        disabled={acc.role === "superadmin"}
                        title={
                          isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"
                        }
                      >
                        {isLocked ? "Mở" : "Khóa"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CỬ TRI (VOTERS / VOTER DATABASE) */}
        {tab === "Cử tri" && (
          <div className="cms-content">
            <div className="table-head">
              <div>
                <h2>Cơ sở dữ liệu cử tri tham gia</h2>
                <p>
                  Số điện thoại được hash một chiều bảo mật danh tính công dân
                </p>
              </div>
            </div>
            <div className="metric-grid-users">
              <div className="user-kpi">
                <span>TỔNG THUÊ BAO ĐÃ XÁC THỰC</span>
                <strong>892.410</strong>
                <small>Tăng 14.200 hôm nay</small>
              </div>
              <div className="user-kpi">
                <span>TỈ LỆ NHÀ MẠNG VIỄN THÔNG</span>
                <strong>Viettel: 54% • Vina: 28% • Mobi: 18%</strong>
                <small>Kết nối OTP SMS trực tiếp</small>
              </div>
            </div>

            <div className="data-table">
              <div className="table-header-row">
                <span>ID CỬ TRI</span>
                <span>SĐT ẨN DANH</span>
                <span>TỔNG LƯỢT VOTE</span>
                <span>VOTE GẦN NHẤT</span>
                <span>TRẠNG THÁI BẢO MẬT</span>
              </div>
              {[
                {
                  id: "USR-001",
                  phone: "098***4821",
                  count: "1",
                  date: "Hôm nay 10:24",
                  status: "Hợp lệ",
                },
                {
                  id: "USR-002",
                  phone: "091***9032",
                  count: "1",
                  date: "Hôm nay 10:23",
                  status: "Hợp lệ",
                },
                {
                  id: "USR-003",
                  phone: "090***6711",
                  count: "1",
                  date: "Hôm nay 10:22",
                  status: "Hợp lệ",
                },
                {
                  id: "USR-004",
                  phone: "097***1254",
                  count: "1",
                  date: "Hôm nay 10:21",
                  status: "Hợp lệ",
                },
                {
                  id: "USR-005",
                  phone: "094***3399",
                  count: "1",
                  date: "Hôm nay 10:19",
                  status: "Hợp lệ",
                },
              ].map((u) => (
                <div className="table-row table-row-users" key={u.id}>
                  <strong>{u.id}</strong>
                  <span className="masked-font">{u.phone}</span>
                  <span>{u.count} lượt/ngày</span>
                  <small>{u.date}</small>
                  <span className="status verified">Đã xác minh OTP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CÀI ĐẶT (SETTINGS) */}
        {tab === "Cài đặt" && (
          <div className="cms-card settings-card">
            <div className="table-head">
              <div>
                <h2>Cấu hình tham số cổng bình chọn</h2>
                <p>
                  Điều khiển trạng thái hoạt động của hệ thống thời gian thực
                </p>
              </div>
            </div>

            <div className="settings-section">
              <div className="setting-item">
                <div>
                  <strong>Trạng thái cổng bình chọn toàn quốc</strong>
                  <p>Bật hoặc tạm dừng tiếp nhận phiếu bầu từ công chúng</p>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${votingPortalActive ? "active" : ""}`}
                  onClick={() => setVotingPortalActive(!votingPortalActive)}
                >
                  {votingPortalActive ? "Đang mở cổng" : "Đã tạm dừng"}
                </button>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Giới hạn bình chọn theo thuê bao</strong>
                  <p>
                    Mỗi số điện thoại chỉ được bình chọn 01 lần trong vòng 24
                    giờ
                  </p>
                </div>
                <span className="badge-demo">BẮT BUỘC 01 LẦN/NGÀY</span>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Độ nhạy chống Bot (Cloudflare Turnstile)</strong>
                  <p>
                    Tự động yêu cầu CAPTCHA đối với các IP có lưu lượng bất
                    thường
                  </p>
                </div>
                <span className="badge-demo">TIÊU CHUẨN CAO</span>
              </div>

              <div className="setting-item">
                <div>
                  <strong>Dữ liệu & Khôi phục</strong>
                  <p>
                    Tải lại danh sách 12 điểm đến mẫu hoặc xuất file báo cáo
                  </p>
                </div>
                <div className="settings-btn-row">
                  <button className="btn btn-secondary" onClick={onExportCsv}>
                    <Icon name="share" size={16} /> Xuất file CSV
                  </button>
                  <button className="btn btn-secondary" onClick={onResetData}>
                    <Icon name="refresh" size={16} /> Khôi phục dữ liệu gốc
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Add Destination Modal */}
      <AddDestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddDestination}
      />

      {/* Add New Admin Account Modal */}
      {isAddAdminModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span className="eyebrow">TÀI KHOẢN MỚI</span>
                <h2>Tạo Tài Khoản Quản Trị Mới</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setIsAddAdminModalOpen(false)}
                aria-label="Đóng"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="modal-form">
              <div className="form-group">
                <label>Họ và tên cán bộ quản trị *</label>
                <input
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Đức"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email cơ quan *</label>
                  <input
                    required
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="duc.hm@destination.vn"
                  />
                </div>
                <div className="form-group">
                  <label>Tên đăng nhập (Username)</label>
                  <input
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    placeholder="duc_hm"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vai trò quản trị</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) =>
                      setNewAdminRole(e.target.value as AdminRole)
                    }
                  >
                    <option value="moderator">Kiểm Duyệt Viên Phiếu Bầu</option>
                    <option value="editor">Biên Tập Viên Di Sản</option>
                    <option value="operator">Kỹ Sư An Toàn Hệ Thống</option>
                    <option value="superadmin">Tổng Quản Trị Cấp Cao</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mật khẩu demo</label>
                  <input
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="duc@2025"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phòng ban / Đơn vị công tác</label>
                <input
                  value={newAdminDept}
                  onChange={(e) => setNewAdminDept(e.target.value)}
                  placeholder="Tổ Giám Sát Bình Chọn Khu Vực Miền Trung"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddAdminModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  <Icon name="plus" size={16} /> Lưu & Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
