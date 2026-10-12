export type PortalType = "public" | "admin"

export type AdminRole = "superadmin" | "moderator" | "editor" | "operator"

export interface AdminAccount {
  id: string
  username: string
  email: string
  passwordDemo: string
  fullName: string
  role: AdminRole
  roleTitle: string
  department: string
  avatar: string
  status: "active" | "inactive" | "locked"
  lastLogin: string
  permissions: string[]
}
