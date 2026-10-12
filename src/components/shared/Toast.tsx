"use client"

import { ToastMessage } from "../types"
import Icon from "./Icon"

export default function Toast({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && <Icon name="check" size={16} />}
            {toast.type === "info" && <Icon name="spark" size={16} />}
            {toast.type === "warning" && <Icon name="shield" size={16} />}
          </div>
          <span className="toast-text">{toast.text}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Đóng thông báo"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
