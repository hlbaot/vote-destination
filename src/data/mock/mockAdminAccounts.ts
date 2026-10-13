import { AdminAccount } from "@/types"

export const initialAdminAccounts: AdminAccount[] = [
  {
    id: "adm-01",
    username: "admin",
    email: "admin@destination.vn",
    passwordDemo: "admin@2025",
    fullName: "Quản Trị Viên Hệ Thống",
    role: "admin",
    roleTitle: "Quản Trị Viên",
    department: "Ban Quản Trị Cổng Bình Chọn",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=200",
    status: "active",
    lastLogin: "Vừa xong",
    permissions: [
      "Toàn quyền quản trị hệ thống",
      "Quản lý danh mục điểm đến",
      "Phê duyệt & kiểm toán phiếu bình chọn",
      "Cấu hình đóng/mở cổng bình chọn",
      "Xuất báo cáo dữ liệu CSV",
    ],
  },
]
