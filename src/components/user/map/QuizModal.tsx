"use client"
/**
 * QuizModal – Mini-game: 5 questions, 20s each, max 3 tries/day.
 * Correct answers evaluated via mapService.submitQuiz (mock: sessionStorage).
 * ⚠️ In production: server evaluates answers; client never receives correct options.
 */
import React, { useCallback, useEffect, useRef, useState } from "react"
import type { QuizQuestion, QuizResult } from "@/lib/api/mapService"
import { MAP_CONFIG, startQuiz, submitQuiz } from "@/lib/api/mapService"

interface Props { isOpen: boolean; onClose: () => void; triesLeft: number; bonusClaimed: boolean }

type Phase = "idle" | "playing" | "result"

export default function QuizModal({ isOpen, onClose, triesLeft, bonusClaimed }: Props) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [sessionId, setSessionId] = useState("")
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(MAP_CONFIG.quizSecondsPerQuestion)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [localTriesLeft, setLocalTriesLeft] = useState(triesLeft)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { setLocalTriesLeft(triesLeft) }, [triesLeft])

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  const advanceQuestion = useCallback((ans: number[]) => {
    if (ans.length >= MAP_CONFIG.quizQuestionsPerRound) {
      clearTimer()
      const res = submitQuiz(sessionId, ans)
      setResult(res)
      setPhase("result")
    } else {
      setCurrentQ(ans.length)
      setSelectedOption(null)
      setTimeLeft(MAP_CONFIG.quizSecondsPerQuestion)
    }
  }, [sessionId])

  const handleAnswer = (optIdx: number) => {
    if (selectedOption !== null) return
    setSelectedOption(optIdx)
    clearTimer()
    const newAnswers = [...answers, optIdx]
    setAnswers(newAnswers)
    setTimeout(() => advanceQuestion(newAnswers), 600)
  }

  useEffect(() => {
    if (phase !== "playing") return
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer()
          // Time out = wrong answer (-1 sentinel)
          const newAnswers = [...answers, -1]
          setAnswers(newAnswers)
          setTimeout(() => advanceQuestion(newAnswers), 300)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return clearTimer
  }, [phase, currentQ, advanceQuestion]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    if (localTriesLeft <= 0 || bonusClaimed) return
    const { questions: qs, sessionId: sid } = startQuiz()
    setQuestions(qs)
    setSessionId(sid)
    setCurrentQ(0)
    setAnswers([])
    setSelectedOption(null)
    setTimeLeft(MAP_CONFIG.quizSecondsPerQuestion)
    setResult(null)
    setLocalTriesLeft((t) => Math.max(0, t - 1))
    setPhase("playing")
  }

  const handleRetry = () => {
    if (localTriesLeft <= 0) return
    setPhase("idle")
    setResult(null)
    setAnswers([])
  }

  useEffect(() => { if (!isOpen) { setPhase("idle"); clearTimer() } }, [isOpen])

  if (!isOpen) return null

  const q = questions[currentQ]
  const isPerfect = result?.correctCount === MAP_CONFIG.quizQuestionsPerRound

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-(--color-surface-tint) rounded-2xl shadow-2xl border border-(--color-border) w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-(--color-primary) to-(--color-secondary) px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-serif text-lg font-bold">🎯 Nhiệm vụ nhận Vote</h2>
            <p className="text-white/90 text-xs mt-0.5">Trả lời đúng 5/5 → +{MAP_CONFIG.quizBonusVotes} lượt bình chọn</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* IDLE */}
          {phase === "idle" && (
            <div className="text-center space-y-5">
              <div className="text-5xl">🌿</div>
              <div>
                <p className="text-(--color-primary-dark) font-semibold text-base">Kiểm tra kiến thức du lịch Việt Nam</p>
                <p className="text-(--color-text-muted) text-sm mt-1.5">
                  {MAP_CONFIG.quizQuestionsPerRound} câu hỏi · {MAP_CONFIG.quizSecondsPerQuestion}s/câu · Đúng hết = +{MAP_CONFIG.quizBonusVotes} vote
                </p>
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: MAP_CONFIG.quizMaxTriesPerDay }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < localTriesLeft ? "bg-(--color-primary)" : "bg-(--color-border)"}`} />
                ))}
              </div>
              <p className="text-xs text-(--color-text-muted)">Còn {localTriesLeft} lượt thử hôm nay</p>

              {bonusClaimed ? (
                <div className="bg-green-50 border border-green-200 rounded-xl py-3 px-4 text-green-700 text-sm font-medium">
                  ✅ Bạn đã nhận thưởng hôm nay rồi!
                </div>
              ) : localTriesLeft <= 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl py-3 px-4 text-amber-700 text-sm">
                  Đã hết lượt thử hôm nay. Hẹn gặp lại ngày mai!
                </div>
              ) : (
                <button onClick={handleStart}
                  className="bg-(--color-accent) hover:bg-(--color-primary-hover) text-white font-bold px-8 py-3 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
                  Bắt đầu ngay →
                </button>
              )}
            </div>
          )}

          {/* PLAYING */}
          {phase === "playing" && q && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300
                      ${i < answers.length ? "bg-(--color-primary)" : i === currentQ ? "bg-(--color-accent)" : "bg-(--color-border)"}`} />
                  ))}
                </div>
                <div className={`text-xs font-bold font-mono w-8 text-right transition-colors ${timeLeft <= 5 ? "text-(--color-accent)" : "text-(--color-primary-dark)"}`}>
                  {timeLeft}s
                </div>
              </div>
              {/* Timer bar */}
              <div className="h-1 bg-(--color-border) rounded-full overflow-hidden">
                <div className="h-full bg-(--color-accent) rounded-full transition-all duration-1000 linear"
                  style={{ width: `${(timeLeft / MAP_CONFIG.quizSecondsPerQuestion) * 100}%` }} />
              </div>

              {/* Question */}
              <p className="text-[11px] text-(--color-text-muted) uppercase tracking-wide font-semibold">Câu {currentQ + 1} / {questions.length}</p>
              <h3 className="text-(--color-primary-dark) font-semibold text-base leading-snug">{q.text}</h3>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200
                      ${selectedOption === i ? "bg-(--color-accent) border-(--color-accent) text-white scale-[0.99]"
                        : selectedOption !== null ? "bg-(--color-surface-tint) border-(--color-border) text-(--color-text-muted) cursor-not-allowed"
                        : "bg-white/70 border-(--color-border) text-(--color-text) hover:border-(--color-primary-dark) hover:bg-(--color-surface-tint) cursor-pointer"}`}>
                    <span className="font-bold mr-2 text-(--color-primary-dark)/60">{["A","B","C","D"][i]}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {phase === "result" && result && (
            <div className="text-center space-y-5">
              {isPerfect ? (
                <>
                  <div className="text-6xl animate-bounce">🎉</div>
                  <div>
                    <p className="text-(--color-primary-dark) font-bold text-xl">Xuất sắc! {result.correctCount}/{result.total} câu đúng</p>
                    <p className="text-(--color-primary) font-semibold mt-1">+{result.bonusVotes} lượt bình chọn đã được thêm!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl">🌱</div>
                  <div>
                    <p className="text-(--color-primary-dark) font-bold text-xl">{result.correctCount}/{result.total} câu đúng</p>
                    <p className="text-(--color-text-muted) text-sm mt-1">Cần đúng hết 5 câu để nhận +2 vote</p>
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                {!isPerfect && localTriesLeft > 0 && !bonusClaimed && (
                  <button onClick={handleRetry}
                    className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200">
                    Chơi lại ({localTriesLeft} lượt)
                  </button>
                )}
                <button onClick={onClose}
                  className="bg-(--color-accent) hover:bg-(--color-primary-hover) text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Dùng vote ngay →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
