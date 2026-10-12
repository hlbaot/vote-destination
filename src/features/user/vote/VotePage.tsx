"use client"

import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { Destination, Page } from "@/types"
import { voteConfig } from "@/data/destinations"
import VoteHero from "@/components/user/vote/VoteHero"
import VoteStats from "@/components/user/vote/VoteStats"
import VoteLeaderboard from "@/components/user/vote/VoteLeaderboard"
import VoteStepper from "@/components/user/vote/VoteStepper"
import VoterInfoForm from "@/components/user/vote/VoterInfoForm"
import DestinationPicker from "@/components/user/vote/DestinationPicker"
import VoteSuccess from "@/components/user/vote/VoteSuccess"
import VoteGuideModal from "@/components/user/vote/VoteGuideModal"

interface VoteProps {
  go: (page: Page) => void
  destinations: Destination[]
  selectedDestination: Destination
  onSelectDestination: (dest: Destination) => void
  onRecordVote: (
    destinationId: string,
    phone: string,
    receiptCode: string,
  ) => void
  onCopyReceipt: (code: string) => void
}

// LocalStorage key for daily vote quota
const DAILY_QUOTA_STORAGE_KEY = "dest_vote_daily_quota_v1"

function getTodayString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export default function Vote({
  go,
  destinations,
  selectedDestination,
  onSelectDestination,
  onRecordVote,
  onCopyReceipt,
}: VoteProps) {
  // Stepper state: 1: Thông tin, 2: Chọn điểm đến, 3: Hoàn tất
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [phone, setPhone] = useState("0788621767")
  const [voterName, setVoterName] = useState("Nguyễn Thanh Sơn")
  const [receiptCode, setReceiptCode] = useState("")
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false)
  const [guideModalTab, setGuideModalTab] = useState<"rules" | "guide">("rules")

  // Refs for smooth scrolling
  const voteSectionRef = useRef<HTMLDivElement | null>(null)
  const leaderboardRef = useRef<HTMLDivElement | null>(null)

  // Total votes computed from current active dataset
  const totalVotesCount = useMemo(() => {
    return destinations.reduce((acc, d) => acc + (d.rawVotes || 0), 0)
  }, [destinations])

  // Get remaining votes today for phone
  const getRemainingVotesForPhone = (phoneNum: string): number => {
    if (typeof window === "undefined") return voteConfig.limitPerDay
    try {
      const today = getTodayString()
      const raw = localStorage.getItem(DAILY_QUOTA_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.date === today && parsed.counts) {
          const used = parsed.counts[phoneNum] || 0
          return Math.max(0, voteConfig.limitPerDay - used)
        }
      }
    } catch (e) {
      console.error(e)
    }
    return voteConfig.limitPerDay
  }

  const [remainingVotesToday, setRemainingVotesToday] = useState<number>(() => {
    return getRemainingVotesForPhone(phone)
  })

  useEffect(() => {
    setRemainingVotesToday(getRemainingVotesForPhone(phone))
  }, [phone])

  // Scroll helpers
  const handleScrollToVote = () => {
    voteSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleScrollToLeaderboard = () => {
    leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Open Guide modal helpers
  const handleOpenRules = () => {
    setGuideModalTab("rules")
    setIsGuideModalOpen(true)
  }

  const handleOpenGuide = () => {
    setGuideModalTab("guide")
    setIsGuideModalOpen(true)
  }

  // Submit Step 1 -> proceed to Step 2
  const handleStep1Submit = () => {
    setStep(2)
  }

  // Confirm Vote (Step 2 -> Step 3)
  const handleConfirmVote = () => {
    // Generate unique official receipt code
    const prefix = (selectedDestination.name || "VN")
      .split(" ")
      .map((w) => w[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 4)
      .padEnd(4, "X")
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase()
    const generatedReceipt = `${prefix}-${dateStr}-${randomHex}`

    setReceiptCode(generatedReceipt)

    const voterPhoneClean = phone.trim() || "098***1234"

    // Persist quota
    try {
      const today = getTodayString()
      let counts: Record<string, number> = {}
      const raw = localStorage.getItem(DAILY_QUOTA_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.date === today && parsed.counts) {
          counts = parsed.counts
        }
      }
      counts[voterPhoneClean] = (counts[voterPhoneClean] || 0) + 1
      localStorage.setItem(
        DAILY_QUOTA_STORAGE_KEY,
        JSON.stringify({ date: today, counts }),
      )
      setRemainingVotesToday(Math.max(0, voteConfig.limitPerDay - counts[voterPhoneClean]))
    } catch (e) {
      console.error(e)
    }

    // Call store action
    onRecordVote(selectedDestination.id, voterPhoneClean, generatedReceipt)

    // Go to step 3
    setStep(3)
  }

  // Restart vote flow
  const handleVoteAgain = () => {
    if (remainingVotesToday > 0) {
      setStep(2)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* 1. HERO SECTION */}
      <VoteHero
        onScrollToVote={handleScrollToVote}
        onOpenGuide={handleOpenGuide}
      />

      {/* 2. STATS BAR (Overlapping bottom of Hero) */}
      <VoteStats
        totalVotes={totalVotesCount}
        destinationCount={destinations.length}
      />

      {/* 3. MAIN SECTION: 2 COLUMNS (Sticky Leaderboard on Left, Wizard on Right) */}
      <section
        ref={voteSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* LEFT COLUMN: LEADERBOARD & PODIUM (col-span-5) */}
          <div ref={leaderboardRef} className="lg:col-span-5 lg:sticky lg:top-24">
            <VoteLeaderboard
              destinations={destinations}
              selectedDestinationId={selectedDestination.id}
              onSelectDestination={(dest) => {
                onSelectDestination(dest)
                if (step === 1) {
                  // If on step 1, select it and remind user
                }
              }}
            />
          </div>

          {/* RIGHT COLUMN: 3-STEP WIZARD (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Horizontal Stepper Indicator */}
            <VoteStepper
              currentStep={step}
              onStepClick={(targetStep) => {
                if (targetStep < step && step !== 3) {
                  setStep(targetStep)
                }
              }}
            />

            {/* STEP 1: VOTER INFO */}
            {step === 1 && (
              <VoterInfoForm
                phone={phone}
                voterName={voterName}
                remainingVotesToday={remainingVotesToday}
                onPhoneChange={setPhone}
                onVoterNameChange={setVoterName}
                onSubmit={handleStep1Submit}
                onOpenGuide={handleOpenRules}
              />
            )}

            {/* STEP 2: DESTINATION PICKER */}
            {step === 2 && (
              <DestinationPicker
                destinations={destinations}
                selectedDestination={selectedDestination}
                voterPhone={phone}
                voterName={voterName}
                onSelectDestination={onSelectDestination}
                onBackToStep1={() => setStep(1)}
                onConfirmVote={handleConfirmVote}
              />
            )}

            {/* STEP 3: VOTE SUCCESS & RECEIPT TICKET */}
            {step === 3 && (
              <VoteSuccess
                selectedDestination={selectedDestination}
                receiptCode={receiptCode}
                remainingVotesToday={remainingVotesToday}
                onCopyReceipt={onCopyReceipt}
                onVoteAgain={handleVoteAgain}
                onScrollToLeaderboard={handleScrollToLeaderboard}
                onGoHome={() => go("home")}
              />
            )}
          </div>
        </div>
      </section>

      {/* 4. FOOTER REMINDER */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-tint)] py-8 text-center text-xs sm:text-sm text-[var(--color-text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Mỗi người dùng được bình chọn tối đa{" "}
            <strong className="text-[var(--color-primary-dark)]">
              {voteConfig.limitPerDay} lượt mỗi ngày
            </strong>
            . Dữ liệu được mã hóa và đối soát tự động.
          </p>
          <button
            type="button"
            onClick={handleOpenRules}
            className="text-[var(--color-accent)] font-semibold hover:underline cursor-pointer"
          >
            Xem quy chế & thể lệ hội thi ↗
          </button>
        </div>
      </footer>

      {/* 5. POPUP GUIDE & RULES MODAL */}
      <VoteGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        initialTab={guideModalTab}
      />
    </main>
  )
}
