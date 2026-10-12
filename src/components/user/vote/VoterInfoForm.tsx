"use client"

import React, { useState } from "react"
import Icon from "@/components/shared/Icon"
import { voteConfig } from "@/data/destinations"

interface VoterInfoFormProps {
  phone: string
  voterName: string
  remainingVotesToday: number
  onPhoneChange: (val: string) => void
  onVoterNameChange: (val: string) => void
  onSubmit: () => void
  onOpenGuide: () => void
}

export default function VoterInfoForm({
  phone,
  voterName,
  remainingVotesToday,
  onPhoneChange,
  onVoterNameChange,
  onSubmit,
  onOpenGuide,
}: VoterInfoFormProps) {
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState(false)

  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "")
    if (!cleaned) {
      return "Vui lòng nhập số điện thoại để tiếp tục"
    }
    // Vietnam phone numbers: 9 to 10 digits
    if (cleaned.length < 9 || cleaned.length > 10) {
      return "Số điện thoại chưa hợp lệ (cần từ 9 đến 10 chữ số)"
    }
    return ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const err = validatePhone(phone)
    if (err) {
      setError(err)
      return
    }
    setError("")
    onSubmit()
  }

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10)
    onPhoneChange(raw)
    if (touched) {
      setError(validatePhone(raw))
    }
  }

  return (
    <div className="bg-[var(--color-surface-tint)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Title & Quota Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-1">
            BƯỚC 01 / 03
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)] tracking-tight">
            Thông tin người bình chọn
          </h3>
          <p className="text-sm text-[#52645E] mt-1">
            Xác thực danh tính để đảm bảo tính công bằng và minh bạch của hội thi.
          </p>
        </div>

        {/* Daily Quota Counter with 3 Dots */}
        <div className="flex-shrink-0 bg-[#EAE2D3] border border-[#DDD3C0] rounded-2xl p-3 sm:p-3.5 flex flex-col items-start sm:items-end gap-1.5">
          <div className="text-xs text-[#52645E]">
            Hạn mức hôm nay:{" "}
            <strong className="text-[var(--color-primary-dark)] font-bold text-sm">
              {remainingVotesToday} / {voteConfig.limitPerDay} lượt
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: voteConfig.limitPerDay }).map((_, i) => {
              const isAvailable = i < remainingVotesToday
              return (
                <span
                  key={i}
                  title={isAvailable ? "Lượt bình chọn khả dụng" : "Đã sử dụng"}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    isAvailable
                      ? "bg-[var(--color-primary)] ring-2 ring-[var(--color-primary-dark)]/20"
                      : "bg-[#C4B7A0] opacity-50"
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Phone field */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
            Số điện thoại di động <span className="text-[var(--color-accent)]">*</span>
          </label>
          <div className="relative flex rounded-2xl border bg-[var(--color-bg)] shadow-sm transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary-dark)] focus-within:border-[var(--color-primary-dark)] border-[var(--color-border)]">
            <span className="inline-flex items-center gap-1.5 px-4 rounded-l-2xl border-r border-[var(--color-border)] bg-[#EFE9DD] text-[var(--color-primary-dark)] font-semibold text-sm">
              <span>🇻🇳</span>
              <span>+84</span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneInputChange}
              onBlur={() => {
                setTouched(true)
                setError(validatePhone(phone))
              }}
              placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
              className="w-full px-4 py-3.5 bg-transparent rounded-r-2xl text-base text-[var(--color-text)] placeholder:text-[#9BAAA4] focus:outline-none"
            />
          </div>
          {error ? (
            <p className="text-xs text-[#DC2626] font-medium mt-1.5 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          ) : (
            <p className="text-xs text-[#63756F] mt-1.5">
              Hệ thống dùng số điện thoại để ghi nhận tối đa 3 lượt bình chọn mỗi ngày.
            </p>
          )}
        </div>

        {/* Name / message field (optional) */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
            Họ và tên hoặc Lời chúc gửi gắm <span className="text-xs font-normal text-[#758882]">(Tùy chọn)</span>
          </label>
          <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary-dark)] focus-within:border-[var(--color-primary-dark)]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              <Icon name="user" size={18} />
            </div>
            <input
              type="text"
              value={voterName}
              onChange={(e) => onVoterNameChange(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A • Chúc du lịch quê hương phát triển"
              className="w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-base text-[var(--color-text)] placeholder:text-[#9BAAA4] focus:outline-none"
            />
          </div>
        </div>

        {/* Privacy commitment chip */}
        <div className="p-3.5 rounded-2xl bg-[#EBE4D6] border border-[#DDD3C0] flex items-center gap-3 text-xs text-[#40524C]">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] flex items-center justify-center">
            <Icon name="lock" size={14} />
          </span>
          <span>
            Thông tin được mã hóa bảo mật danh tính, cam kết không dùng cho mục đích thương mại và không gửi OTP phức tạp.
          </span>
        </div>

        {/* Link hint to rules */}
        <div className="text-xs text-[#52645E] text-center pt-1">
          Chưa rõ quy định hội thi?{" "}
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-[var(--color-accent)] font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            Xem thể lệ & hướng dẫn đầy đủ ↗
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-4 bg-[var(--color-accent)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
        >
          <span>Tiếp tục chọn điểm đến</span>
          <Icon name="arrow" size={18} />
        </button>
      </form>
    </div>
  )
}
