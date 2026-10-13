/**
 * authService.ts – Service xác thực người dùng & quản trị viên.
 * Thiết kế theo dạng module trừu tượng (mock), sau này có thể thay thế bằng
 * Google OAuth thật (NextAuth.js / Auth.js / Supabase / Firebase) mà không cần sửa giao diện component.
 */

import { AuthUser, MockGoogleAccount } from "@/types"

const SESSION_STORAGE_KEY = "vote_auth_session_v2"
const REGISTERED_USERS_KEY = "vote_registered_users_v2"

export const MOCK_GOOGLE_ACCOUNTS: MockGoogleAccount[] = [
  {
    id: "g-user-01",
    name: "Nguyễn Hải Đăng",
    email: "haidang.nguyen@gmail.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
  },
  {
    id: "g-user-02",
    name: "Lê Thị Mai Anh",
    email: "maianh.le@gmail.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
  },
]

export const MOCK_ADMIN_ACCOUNT: AuthUser = {
  id: "adm-01",
  name: "Quản Trị Viên Hệ Thống",
  email: "admin@destination.vn",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=200",
  role: "admin",
}

// Khởi tạo danh sách người dùng đã đăng ký mẫu
function getRegisteredUsers(): AuthUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const initial: AuthUser[] = [
    {
      id: MOCK_GOOGLE_ACCOUNTS[0].id,
      name: MOCK_GOOGLE_ACCOUNTS[0].name,
      email: MOCK_GOOGLE_ACCOUNTS[0].email,
      avatarUrl: MOCK_GOOGLE_ACCOUNTS[0].avatarUrl,
      role: "user",
    },
  ]
  saveRegisteredUsers(initial)
  return initial
}

function saveRegisteredUsers(users: AuthUser[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
    } catch {}
  }
}

export const authService = {
  /**
   * Lấy phiên đăng nhập hiện tại từ localStorage
   */
  getSession(): AuthUser | null {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch {}
    return null
  },

  /**
   * Lưu phiên đăng nhập
   */
  setSession(user: AuthUser): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    } catch {}
  },

  /**
   * Xóa phiên đăng nhập
   */
  clearSession(): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {}
  },

  /**
   * Kiểm tra email đã đăng ký chưa
   */
  isEmailRegistered(email: string): boolean {
    const users = getRegisteredUsers()
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase())
  },

  /**
   * Đăng nhập bằng tài khoản Google (mock)
   */
  async loginWithGoogle(account: MockGoogleAccount): Promise<AuthUser> {
    // Giả lập thời gian phản hồi mạng
    await new Promise((r) => setTimeout(r, 350))

    const users = getRegisteredUsers()
    const existing = users.find(
      (u) => u.email.toLowerCase() === account.email.toLowerCase(),
    )

    const authUser: AuthUser = existing || {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      role: "user",
    }

    if (!existing) {
      saveRegisteredUsers([...users, authUser])
    }

    authService.setSession(authUser)
    return authUser
  },

  /**
   * Đăng ký bằng Google (chỉ đăng ký qua Google)
   */
  async registerWithGoogle(account: MockGoogleAccount): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 400))

    const users = getRegisteredUsers()
    const existing = users.find(
      (u) => u.email.toLowerCase() === account.email.toLowerCase(),
    )

    const authUser: AuthUser = existing || {
      id: account.id || `g-user-${Date.now()}`,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      role: "user",
    }

    if (!existing) {
      saveRegisteredUsers([...users, authUser])
    }

    authService.setSession(authUser)
    return authUser
  },

  /**
   * Đăng nhập Quản trị viên bằng email/tên tài khoản và mật khẩu
   */
  async loginAdmin(identifier: string, password: string): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 450))

    const normalized = identifier.trim().toLowerCase()
    const isMatched =
      (normalized === "admin@destination.vn" || normalized === "admin") &&
      password === "admin@2025"

    if (!isMatched) {
      throw new Error(
        "Email/tên tài khoản hoặc mật khẩu quản trị viên không chính xác.",
      )
    }

    authService.setSession(MOCK_ADMIN_ACCOUNT)
    return MOCK_ADMIN_ACCOUNT
  },

  /**
   * Vào nhanh với User (Demo)
   */
  async quickLoginUser(): Promise<AuthUser> {
    return authService.loginWithGoogle(MOCK_GOOGLE_ACCOUNTS[0])
  },

  /**
   * Vào nhanh với Admin (Demo)
   */
  async quickLoginAdmin(): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 200))
    authService.setSession(MOCK_ADMIN_ACCOUNT)
    return MOCK_ADMIN_ACCOUNT
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    authService.clearSession()
  },
}
