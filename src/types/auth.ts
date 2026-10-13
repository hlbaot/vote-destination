export type UserRole = "user" | "admin"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: UserRole
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface MockGoogleAccount {
  id: string
  name: string
  email: string
  avatarUrl: string
}
