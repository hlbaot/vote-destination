"use client"

import React, { useState } from "react"
import { Destination } from "@/types"
import Icon from "@/components/shared/Icon"
import ConfettiEffect from "./ConfettiEffect"
import { voteConfig } from "@/data/destinations"

interface VoteSuccessProps {
  selectedDestination: Destination
  receiptCode: string
  remainingVotesToday: number
  onCopyReceipt: (code: string) => void
  onVoteAgain: () => void
  onScrollToLeaderboard: () => void
  onGoHome: () => void
}

export default function VoteSuccess({
  selectedDestination,
  receiptCode,
  remainingVotesToday,
  onCopyReceipt,
  onVoteAgain,
  onScrollToLeaderboard,
  onGoHome,
}: VoteSuccessProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopyReceipt(receiptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const isQuotaExhausted = remainingVotesToday <= 0

  return (
    <div className="relative bg-[var(--color-surface-tint)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-10 shadow-sm text-center flex flex-col items-center overflow-hidden">
      {/* Confetti Animation */}
      <ConfettiEffect />

      {/* Success Badge */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-800 border-4 border-emerald-200 flex items-center justify-center shadow-lg mb-5 animate-bounce">
        <Icon name="check" size={36} />
      </div>

      <span className="px-3 py-1 rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary-dark)] text-xs font-bold uppercase tracking-wider mb-2 border border-[var(--color-border)]">
        BÌNH CHỌN THÀNH CÔNG
      </span>

      <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[var(--color-primary-dark)] tracking-tight mb-2">
        Cảm ơn bạn đã gửi trọn niềm tự hào!
      </h3>
      <p className="text-sm sm:text-base text-[#52645E] max-w-lg mx-auto mb-8">
        Lá phiếu bình chọn cho{" "}
        <strong className="text-[var(--color-primary-dark)] font-bold">
          {selectedDestination.name} ({selectedDestination.place})
        </strong>{" "}
        đã được hệ thống ghi nhận hợp lệ.
      </p>

      {/* BOARDING PASS / TRAVEL TICKET STYLE RECEIPT */}
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-md overflow-hidden text-left relative mb-8">
        {/* Ticket Header */}
        <div className="bg-[var(--color-primary)] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="spark" size={18} className="text-[var(--color-accent)]" />
            <span className="font-serif font-bold text-sm sm:text-base tracking-wide">
              BIÊN NHẬN ĐIỆN TỬ HỢP LỆ
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 font-mono text-[#D1E0DB]">
            VERIFIED
          </span>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          {/* Destination row */}
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--color-border)]">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/10 border border-[#DDD3C0] flex-shrink-0">
              <img
                src={selectedDestination.thumbnail || `/images/destinations/${selectedDestination.id}.webp`}
                alt={selectedDestination.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[var(--color-text-muted)] font-semibold uppercase block">
                ĐIỂM ĐẾN ĐƯỢC BÌNH CHỌN
              </span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-[var(--color-primary-dark)] truncate">
                {selectedDestination.name}
              </h4>
              <span className="text-xs text-[#52645E]">
                {selectedDestination.place} • Miền {selectedDestination.region}
              </span>
            </div>
          </div>

          {/* Receipt Code Box */}
          <div>
            <label className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase block mb-1">
              MÃ ĐỐI SOÁT BIÊN NHẬN
            </label>
            <div className="flex items-center justify-between p-3 bg-[#EFE9DD] rounded-2xl border border-[#DDD3C0]">
              <span className="font-mono text-base sm:text-lg font-black text-[var(--color-primary-dark)] tracking-wider select-all">
                {receiptCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                  }`}
              >
                <Icon name={copied ? "check" : "copy"} size={13} />
                <span>{copied ? "Đã chép!" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* Timestamp & Quota status */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-2.5 bg-[var(--color-surface-tint)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block text-[11px]">Thời gian ghi nhận:</span>
              <strong className="text-[var(--color-primary-dark)] font-medium block mt-0.5">
                {new Date().toLocaleTimeString("vi-VN")} • {new Date().toLocaleDateString("vi-VN")}
              </strong>
            </div>

            <div className="p-2.5 bg-[var(--color-surface-tint)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] block text-[11px]">Lượt còn lại hôm nay:</span>
              <strong
                className={`block mt-0.5 font-bold ${remainingVotesToday > 0 ? "text-emerald-700" : "text-[var(--color-accent)]"
                  }`}
              >
                {remainingVotesToday} / {voteConfig.limitPerDay} lượt
              </strong>
            </div>
          </div>
        </div>

        {/* Perforated ticket edge decoration */}
        <div className="relative py-2 bg-[#EAE2D3] border-t border-dashed border-[#CFC3AE] px-6 text-[11px] text-[#63756F] flex items-center justify-between">
          <span>Hội thi bình chọn 68 điểm đến du lịch nông thôn 2026</span>
          <span className="font-mono">#VOTE-OK</span>
        </div>
      </div>

      {/* Quota Notice if exhausted */}
      {isQuotaExhausted && (
        <div className="w-full max-w-lg mb-6 p-4 rounded-2xl bg-[#FFEFEA] border border-[#F3C4B6] text-left flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <strong className="text-xs sm:text-sm font-bold text-[#C2410C] block">
              Bạn đã sử dụng hết hạn mức {voteConfig.limitPerDay} lượt hôm nay
            </strong>
            <p className="text-xs text-[#9A3412] mt-0.5">
              Mỗi số điện thoại được bình chọn tối đa {voteConfig.limitPerDay} lượt mỗi ngày. Hẹn gặp lại bạn vào ngày mai để tiếp tục bình chọn!
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
        <button
          type="button"
          disabled={isQuotaExhausted}
          onClick={onVoteAgain}
          className={`w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${isQuotaExhausted
              ? "bg-[var(--color-border)] text-[#8C7E6A] cursor-not-allowed opacity-60"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-primary-hover)] text-white shadow-md hover:shadow-lg cursor-pointer"
            }`}
        >
          <Icon name="spark" size={16} />
          <span>Bình chọn tiếp</span>
        </button>

        <button
          type="button"
          onClick={onScrollToLeaderboard}
          className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <Icon name="star" size={16} className="text-[var(--color-accent)]" />
          <span>Xem bảng xếp hạng</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-auto py-3.5 px-5 bg-[#E8E0D2] hover:bg-[#DDD3C0] text-[var(--color-primary-dark)] font-semibold rounded-2xl transition-all text-sm cursor-pointer"
        >
          Trang chủ
        </button>
      </div>
    </div>
  )
}
