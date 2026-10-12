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
import {
  Destination,
  Page,
  ToastMessage,
  VoteRecord,
  AdminAccount,
} from "@/types"
import { initialDestinations, refreshDestinationImages } from "@/data/destinations"
import { initialVoteRecords } from "@/data/mock/mockVotes"
import { initialAdminAccounts } from "@/data/mock/mockAdminAccounts"

interface AppContextType {
  destinations: Destination[]
  selectedDestination: Destination
  setSelectedDestination: React.Dispatch<React.SetStateAction<Destination>>
  favorites: string[]
  voteRecords: VoteRecord[]
  adminAccounts: AdminAccount[]
  currentAdmin: AdminAccount | null
  toasts: ToastMessage[]
  addToast: (type: ToastMessage["type"], text: string) => void
  dismissToast: (id: string) => void
  navigate: (next: Page) => void
  handleToggleFavorite: (id: string, e?: React.MouseEvent) => void
  handleOpenDetail: (dest: Destination) => void
  handleStartVote: (dest: Destination) => void
  handleRecordVote: (
    destinationId: string,
    phone: string,
    receiptCode: string,
  ) => void
  handleCopyReceipt: (code: string) => void
  handleShare: (dest: Destination) => void
  handleLoginAdmin: (account: AdminAccount) => void
  handleLogoutAdmin: () => void
  handleAddAdminAccount: (newAcc: AdminAccount) => void
  handleToggleAdminStatus: (id: string) => void
  handleAddDestination: (newDest: Destination) => void
  handleToggleVisibility: (id: string) => void
  handleDeleteDestination: (id: string) => void
  handleExportCsv: () => void
  handleResetData: () => void
}

const AppContext = createContext<AppContextType | null>(null)
const DESTINATION_STORAGE_KEY = "dest_vote_items_68_v4"
const EXPECTED_DESTINATION_COUNT = initialDestinations.length

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  // Load destinations from localStorage or fallback
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    if (typeof window !== "undefined") {
      try {
        // Clear legacy caches that may contain obsolete seeds
        localStorage.removeItem("dest_vote_items_v1")
        localStorage.removeItem("dest_vote_items_68_v2")
        localStorage.removeItem("dest_vote_items_68_v3")
        const saved = localStorage.getItem(DESTINATION_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (
            Array.isArray(parsed) &&
            parsed.length === EXPECTED_DESTINATION_COUNT
          ) {
            const isValid = parsed.every((item) =>
              initialDestinations.some(
                (seed) => seed.id === item.id && seed.name === item.name,
              ),
            )
            if (isValid) {
              return refreshDestinationImages(parsed)
            } else {
              localStorage.removeItem(DESTINATION_STORAGE_KEY)
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    return initialDestinations
  })

  // Selected destination for Detail & Vote
  const [selectedDestination, setSelectedDestination] = useState<Destination>(
    destinations[0] || initialDestinations[0],
  )

  // Favorites list
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dest_vote_favs_v1")
        if (saved) return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return ["1", "3"]
  })

  // Vote audit records
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dest_vote_logs_v1")
        if (saved) return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return initialVoteRecords
  })

  // Admin accounts mock data
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dest_vote_admins_v1")
        if (saved) return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return initialAdminAccounts
  })

  // Current logged in admin session
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dest_vote_admin_session_v1")
        if (saved) return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return null
  })

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Persist destinations
  useEffect(() => {
    try {
      localStorage.setItem(DESTINATION_STORAGE_KEY, JSON.stringify(destinations))
    } catch (e) {
      console.error(e)
    }
  }, [destinations])

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem("dest_vote_favs_v1", JSON.stringify(favorites))
    } catch (e) {
      console.error(e)
    }
  }, [favorites])

  // Persist vote logs
  useEffect(() => {
    try {
      localStorage.setItem("dest_vote_logs_v1", JSON.stringify(voteRecords))
    } catch (e) {
      console.error(e)
    }
  }, [voteRecords])

  // Persist admin accounts
  useEffect(() => {
    try {
      localStorage.setItem("dest_vote_admins_v1", JSON.stringify(adminAccounts))
    } catch (e) {
      console.error(e)
    }
  }, [adminAccounts])

  // Persist admin session
  useEffect(() => {
    try {
      if (currentAdmin) {
        localStorage.setItem(
          "dest_vote_admin_session_v1",
          JSON.stringify(currentAdmin),
        )
      } else {
        localStorage.removeItem("dest_vote_admin_session_v1")
      }
    } catch (e) {
      console.error(e)
    }
  }, [currentAdmin])

  // Toast helper
  const addToast = useCallback((type: ToastMessage["type"], text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5)
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Navigation router mapper
  const navigate = useCallback(
    (next: Page) => {
      if (next === "home") router.push("/", { scroll: false })
      else if (next === "explore") router.push("/explore", { scroll: false })
      else if (next === "vote") router.push("/vote", { scroll: false })
      else if (next === "cms") router.push("/cms", { scroll: false })
      else if (next === "guide") router.push("/guide", { scroll: false })
      else if (next === "detail") {
        router.push(`/destination/${selectedDestination?.id || "01"}`, {
          scroll: false,
        })
      }
    },
    [router, selectedDestination],
  )

  // Admin login / logout handlers
  const handleLoginAdmin = (account: AdminAccount) => {
    setCurrentAdmin(account)
    addToast(
      "success",
      `Chào mừng ${account.fullName} (${account.roleTitle}) đã đăng nhập vào hệ thống quản trị!`,
    )
  }

  const handleLogoutAdmin = () => {
    setCurrentAdmin(null)
    addToast("info", "Đã đăng xuất khỏi tài khoản quản trị.")
  }

  const handleAddAdminAccount = (newAcc: AdminAccount) => {
    setAdminAccounts((prev) => [newAcc, ...prev])
    addToast("success", `Đã tạo tài khoản quản trị cho ${newAcc.fullName}!`)
  }

  const handleToggleAdminStatus = (id: string) => {
    setAdminAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const nextStatus = acc.status === "active" ? "locked" : "active"
          addToast(
            nextStatus === "locked" ? "warning" : "success",
            `${nextStatus === "locked" ? "Đã khóa" : "Đã kích hoạt lại"
            } tài khoản ${acc.fullName}.`,
          )
          return { ...acc, status: nextStatus }
        }
        return acc
      }),
    )
  }

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const dest = destinations.find((d) => d.id === id)
    const destName = dest ? dest.name : "Điểm đến"
    if (favorites.includes(id)) {
      setFavorites((prev) => prev.filter((favId) => favId !== id))
      addToast("info", `Đã xóa ${destName} khỏi danh sách yêu thích.`)
    } else {
      setFavorites((prev) => [...prev, id])
      addToast("success", `Đã thêm ${destName} vào danh sách yêu thích ♥`)
    }
  }

  // Open destination in detail
  const handleOpenDetail = (dest: Destination) => {
    setSelectedDestination(dest)
    router.push(`/destination/${dest.id}`, { scroll: false })
  }

  // Start voting for a specific destination
  const handleStartVote = (dest: Destination) => {
    setSelectedDestination(dest)
    router.push(`/vote?id=${dest.id}`, { scroll: false })
  }

  // Record a successful vote
  const handleRecordVote = (
    destinationId: string,
    phone: string,
    receiptCode: string,
  ) => {
    // 1. Increment destination vote count
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id === destinationId) {
          const updatedRaw = d.rawVotes + 1
          return {
            ...d,
            rawVotes: updatedRaw,
            votes: updatedRaw.toLocaleString("vi-VN"),
          }
        }
        return d
      }),
    )

    // Update selected destination object as well
    setSelectedDestination((prev) => {
      if (prev.id === destinationId) {
        const updatedRaw = prev.rawVotes + 1
        return {
          ...prev,
          rawVotes: updatedRaw,
          votes: updatedRaw.toLocaleString("vi-VN"),
        }
      }
      return prev
    })

    // 2. Add new vote log
    const targetDest = destinations.find((d) => d.id === destinationId)
    const newRecord: VoteRecord = {
      id: "v-" + Date.now(),
      receiptCode,
      destinationId,
      destinationName: targetDest?.name || "Điểm đến",
      maskedPhone:
        phone.length > 6
          ? `${phone.slice(0, 3)}****${phone.slice(-3)}`
          : phone,
      timestamp: new Date().toLocaleTimeString("vi-VN") + " " + new Date().toLocaleDateString("vi-VN"),
      timeAgo: "Vừa xong",
      ip: `14.232.208.${Math.floor(Math.random() * 200 + 10)}`,
      status: "verified",
      device: "Desktop / Chrome",
    }
    setVoteRecords((prev) => [newRecord, ...prev])
    addToast("success", `Bình chọn thành công! Mã biên nhận: ${receiptCode}`)
  }

  // Copy receipt code
  const handleCopyReceipt = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      addToast("success", `Đã sao chép mã biên nhận: ${code}`)
    }
  }

  // Share destination link
  const handleShare = (dest: Destination) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const shareUrl = `${window.location.origin}/destination/${dest.id}`
      navigator.clipboard.writeText(shareUrl)
      addToast("success", `Đã sao chép đường dẫn chia sẻ cho ${dest.name}!`)
    }
  }

  // CMS: Add destination
  const handleAddDestination = (newDest: Destination) => {
    setDestinations((prev) => [newDest, ...prev])
    addToast("success", `Đã thêm điểm đến mới: ${newDest.name}!`)
  }

  // CMS: Toggle visibility
  const handleToggleVisibility = (id: string) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.isVisible
          addToast(
            nextState ? "success" : "info",
            `${nextState ? "Đã hiển thị" : "Đã tạm ẩn"} điểm đến ${d.name}.`,
          )
          return { ...d, isVisible: nextState }
        }
        return d
      }),
    )
  }

  // CMS: Delete destination
  const handleDeleteDestination = (id: string) => {
    const dest = destinations.find((d) => d.id === id)
    setDestinations((prev) => prev.filter((d) => d.id !== id))
    addToast("warning", `Đã xóa điểm đến ${dest?.name || id} khỏi hệ thống.`)
  }

  // CMS: Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Tên Điểm Đến",
      "Tỉnh/Thành",
      "Vùng Miền",
      "Phân Loại",
      "Số Lượt Bình Chọn",
      "Trạng Thái Hiển Thị",
    ]
    const rows = destinations.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.place.replace(/"/g, '""')}"`,
      d.region,
      `"${d.tag.replace(/"/g, '""')}"`,
      d.rawVotes,
      d.isVisible ? "Hiển thị" : "Tạm ẩn",
    ])
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `destination-votes-report-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    addToast("success", "Đã xuất file báo cáo CSV thành công!")
  }

  // CMS: Reset Data
  const handleResetData = () => {
    setDestinations(initialDestinations)
    setVoteRecords(initialVoteRecords)
    setAdminAccounts(initialAdminAccounts)
    addToast("info", "Đã khôi phục dữ liệu ban đầu.")
  }

  return (
    <AppContext.Provider
      value={{
        destinations,
        selectedDestination,
        setSelectedDestination,
        favorites,
        voteRecords,
        adminAccounts,
        currentAdmin,
        toasts,
        addToast,
        dismissToast,
        navigate,
        handleToggleFavorite,
        handleOpenDetail,
        handleStartVote,
        handleRecordVote,
        handleCopyReceipt,
        handleShare,
        handleLoginAdmin,
        handleLogoutAdmin,
        handleAddAdminAccount,
        handleToggleAdminStatus,
        handleAddDestination,
        handleToggleVisibility,
        handleDeleteDestination,
        handleExportCsv,
        handleResetData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
