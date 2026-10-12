"use client"

import React from "react"
import Icon from "@/components/shared/Icon"

interface VoteStepperProps {
  currentStep: 1 | 2 | 3
  onStepClick?: (step: 1 | 2 | 3) => void
}

export default function VoteStepper({
  currentStep,
  onStepClick,
}: VoteStepperProps) {
  const steps: { num: 1 | 2 | 3; title: string; subtitle: string }[] = [
    { num: 1, title: "Thông tin cử tri", subtitle: "Số điện thoại xác thực" },
    { num: 2, title: "Chọn điểm đến", subtitle: "68 hồ sơ toàn quốc" },
    { num: 3, title: "Hoàn tất & Biên nhận", subtitle: "Cấp mã điện tử" },
  ]

  return (
    <div className="w-full bg-[#EFEAE0] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#DFD6C5] shadow-sm mb-6">
      {/* Mobile view */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[var(--color-primary-dark)] uppercase tracking-wider">
            Bước {currentStep} / 3: {steps[currentStep - 1].title}
          </span>
          <span className="text-[var(--color-accent)] font-semibold">
            {currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "100%"}
          </span>
        </div>
        <div className="w-full h-2 bg-[#DDD3C0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:grid grid-cols-3 gap-2 relative">
        {steps.map((s, idx) => {
          const isCurrent = currentStep === s.num
          const isDone = currentStep > s.num
          const isClickable = onStepClick && currentStep > s.num && currentStep !== 3

          return (
            <div
              key={s.num}
              onClick={() => isClickable && onStepClick(s.num)}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isCurrent
                  ? "bg-[var(--color-surface)] shadow-sm border border-[#D5CABE]"
                  : isDone
                  ? "opacity-90 hover:opacity-100"
                  : "opacity-60"
              } ${isClickable ? "cursor-pointer hover:bg-[var(--color-surface)]/60" : ""}`}
            >
              {/* Circle Badge */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
                  isCurrent
                    ? "bg-[var(--color-accent)] text-white shadow-md ring-2 ring-[var(--color-accent)]/30"
                    : isDone
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                {isDone ? <Icon name="check" size={16} /> : `0${s.num}`}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <span
                  className={`block text-xs sm:text-sm font-semibold truncate ${
                    isCurrent ? "text-[var(--color-primary-dark)]" : "text-[var(--color-text)]"
                  }`}
                >
                  {s.title}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)] block truncate">
                  {s.subtitle}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
