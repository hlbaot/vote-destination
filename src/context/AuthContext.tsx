"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { AuthUser, AuthStatus, MockGoogleAccount } from "@/types"
import { authService, MOCK_GOOGLE_ACCOUNTS } from "@/lib/auth/authService"

interface GoogleModalOptions {
  isRegister?: boolean
  returnTo?: string
  onSuccess?: (user: AuthUser) => void
}

interface AuthPromptOptions {
  reason?: string
  returnTo?: string
  onPendingAction?: () => void
}

interface AuthContextType {
  user: AuthUser | null
  status: AuthStatus
  loginWithGoogle: (account?: MockGoogleAccount) => Promise<AuthUser>
  registerWithGoogle: (account?: MockGoogleAccount) => Promise<AuthUser>
  loginAdmin: (identifier: string, password: string) => Promise<AuthUser>
  quickLogin: (role: "user" | "admin") => Promise<AuthUser>
  quickLoginUser: () => Promise<AuthUser>
  quickLoginAdmin: () => Promise<AuthUser>
  updateCurrentUser: (updates: Partial<AuthUser>) => void
  logout: () => Promise<void>

  // Google account picker modal
  isGoogleModalOpen: boolean
  googleModalOptions: GoogleModalOptions | null
  openGoogleModal: (options?: GoogleModalOptions) => void
  closeGoogleModal: () => void

  // Login required prompt modal (when trying to vote/fav/quiz while unauthenticated)
  isAuthPromptModalOpen: boolean
  authPromptOptions: AuthPromptOptions | null
  openAuthPromptModal: (
    optionsOrReturnTo?: string | AuthPromptOptions,
    pendingAction?: () => void,
  ) => void
  closeAuthPromptModal: () => void

  // Pending action after login
  pendingAction: (() => void) | null
  setPendingAction: (action: (() => void) | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  // Modal states
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [googleModalOptions, setGoogleModalOptions] = useState<GoogleModalOptions | null>(null)

  const [isAuthPromptModalOpen, setIsAuthPromptModalOpen] = useState(false)
  const [authPromptOptions, setAuthPromptOptions] = useState<AuthPromptOptions | null>(null)

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Restore session on mount without flashing
  useEffect(() => {
    try {
      const savedUser = authService.getSession()
      if (savedUser) {
        setUser(savedUser)
        setStatus("authenticated")
      } else {
        setUser(null)
        setStatus("unauthenticated")
      }
    } catch {
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  const executePendingAction = useCallback(() => {
    if (pendingAction) {
      try {
        pendingAction()
      } catch (err) {
        console.error("Error executing pending action after login:", err)
      }
      setPendingAction(null)
    }
  }, [pendingAction])

  const openGoogleModal = useCallback((options?: GoogleModalOptions) => {
    setGoogleModalOptions(options || null)
    setIsGoogleModalOpen(true)
  }, [])

  const closeGoogleModal = useCallback(() => {
    setIsGoogleModalOpen(false)
    setGoogleModalOptions(null)
  }, [])

  const openAuthPromptModal = useCallback(
    (
      optionsOrReturnTo?: string | AuthPromptOptions,
      pendingActionCb?: () => void,
    ) => {
      if (typeof optionsOrReturnTo === "string") {
        setAuthPromptOptions({ returnTo: optionsOrReturnTo })
        if (pendingActionCb) {
          setPendingAction(() => pendingActionCb)
        }
      } else {
        setAuthPromptOptions(optionsOrReturnTo || null)
        if (optionsOrReturnTo?.onPendingAction) {
          setPendingAction(() => optionsOrReturnTo.onPendingAction)
        } else if (pendingActionCb) {
          setPendingAction(() => pendingActionCb)
        }
      }
      setIsAuthPromptModalOpen(true)
    },
    [],
  )

  const closeAuthPromptModal = useCallback(() => {
    setIsAuthPromptModalOpen(false)
    setAuthPromptOptions(null)
  }, [])

  const loginWithGoogle = useCallback(
    async (account?: MockGoogleAccount): Promise<AuthUser> => {
      const target = account || MOCK_GOOGLE_ACCOUNTS[0]
      const loggedIn = await authService.loginWithGoogle(target)
      setUser(loggedIn)
      setStatus("authenticated")
      closeGoogleModal()
      closeAuthPromptModal()
      executePendingAction()
      return loggedIn
    },
    [closeGoogleModal, closeAuthPromptModal, executePendingAction],
  )

  const registerWithGoogle = useCallback(
    async (account?: MockGoogleAccount): Promise<AuthUser> => {
      const target = account || MOCK_GOOGLE_ACCOUNTS[0]
      const registered = await authService.registerWithGoogle(target)
      setUser(registered)
      setStatus("authenticated")
      closeGoogleModal()
      closeAuthPromptModal()
      executePendingAction()
      return registered
    },
    [closeGoogleModal, closeAuthPromptModal, executePendingAction],
  )

  const loginAdmin = useCallback(
    async (identifier: string, password: string): Promise<AuthUser> => {
      const admin = await authService.loginAdmin(identifier, password)
      setUser(admin)
      setStatus("authenticated")
      closeGoogleModal()
      closeAuthPromptModal()
      executePendingAction()
      return admin
    },
    [closeGoogleModal, closeAuthPromptModal, executePendingAction],
  )

  const quickLogin = useCallback(
    async (role: "user" | "admin"): Promise<AuthUser> => {
      const logged =
        role === "admin"
          ? await authService.quickLoginAdmin()
          : await authService.quickLoginUser()
      setUser(logged)
      setStatus("authenticated")
      closeGoogleModal()
      closeAuthPromptModal()
      executePendingAction()
      return logged
    },
    [closeGoogleModal, closeAuthPromptModal, executePendingAction],
  )

  const quickLoginUser = useCallback(async (): Promise<AuthUser> => {
    return quickLogin("user")
  }, [quickLogin])

  const quickLoginAdmin = useCallback(async (): Promise<AuthUser> => {
    return quickLogin("admin")
  }, [quickLogin])

  const updateCurrentUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      authService.setSession(updated)
      return updated
    })
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    setUser(null)
    setStatus("unauthenticated")
    setPendingAction(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        loginWithGoogle,
        registerWithGoogle,
        loginAdmin,
        quickLogin,
        quickLoginUser,
        quickLoginAdmin,
        updateCurrentUser,
        logout,
        isGoogleModalOpen,
        googleModalOptions,
        openGoogleModal,
        closeGoogleModal,
        isAuthPromptModalOpen,
        authPromptOptions,
        openAuthPromptModal,
        closeAuthPromptModal,
        pendingAction,
        setPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  )

}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
