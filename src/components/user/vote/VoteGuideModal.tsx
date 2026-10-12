"use client"

import React, { useEffect, useState } from "react"
import { voteConfig } from "@/data/destinations"
import Icon from "@/components/shared/Icon"

interface VoteGuideModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "rules" | "guide"
}

export default function VoteGuideModal({
  isOpen,
  onClose,
  initialTab = "rules",
}: VoteGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "guide">(initialTab)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vote-guide-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-[var(--color-bg)] text-[var(--color-text)] rounded-t-3xl sm:rounded-3xl border border-[var(--color-border)] shadow-2xl flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-[var(--color-accent)] border border-white/10">
                <Icon name="shield" size={18} />
              </span>
              <div>
                <h3 id="vote-guide-title" className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Thể lệ & Hướng dẫn
                </h3>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                  Quy chế bình chọn 68 điểm đến du lịch nông thôn 2026
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 mt-4 p-1 bg-black/20 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "rules"
                  ? "bg-[var(--color-accent)] text-white shadow-sm font-semibold"
                  : "text-white/85 hover:text-white"
              }`}
              onClick={() => setActiveTab("rules")}
            >
              Thể lệ bình chọn ({voteConfig.rules.length})
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === "guide"
                  ? "bg-[var(--color-accent)] text-white shadow-sm font-semibold"
                  : "text-white/85 hover:text-white"
              }`}
              onClick={() => setActiveTab("guide")}
            >
              Hướng dẫn tham gia ({voteConfig.guide.length} bước)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === "rules" ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#EAE2D3] rounded-2xl border border-[#DFD6C5] flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                  <Icon name="clock" size={16} />
                </span>
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold text-[var(--color-primary-dark)]">Hạn mức bình chọn: </span>
                  <span className="text-[#3A4A45]">Tối đa <strong>{voteConfig.limitPerDay} lượt</strong> mỗi ngày cho mỗi số điện thoại.</span>
                </div>
              </div>

              <div className="space-y-2.5 mt-2">
                {voteConfig.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[var(--color-bg)] rounded-2xl border border-[#E7DFD0] flex items-start gap-3 hover:border-[#D9CFBE] transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--color-primary)]/20">
              {voteConfig.guide.map((stepText, idx) => {
                const stepIcons = ["search", "eye", "spark", "check"]
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <span className="absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-[var(--color-bg)]">
                      {idx + 1}
                    </span>
                    <div className="bg-[var(--color-bg)] p-4 rounded-2xl border border-[#E7DFD0] flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[var(--color-accent)]">
                          <Icon name={(stepIcons[idx] as any) || "spark"} size={14} />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
                          Bước 0{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-text)] leading-relaxed">
                        {stepText}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#EFE9DD] border-t border-[#DFD6C5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#52645E]">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Icon name="lock" size={14} className="text-[var(--color-primary-dark)]" />
            <span>Mỗi phiếu bầu hợp lệ được cấp mã biên nhận kiểm toán thời gian thực.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-xl transition-colors duration-200 text-xs sm:text-sm"
          >
            Đã hiểu, quay lại bình chọn
          </button>
        </div>
      </div>
    </div>
  )
}
