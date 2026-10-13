"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Icon from "@/components/shared/Icon"
import { QuizAttempt, QuizSummary } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"

interface TabQuizHistoryProps {
  userId: string
}

function formatVNTime(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d)
  } catch {
    return iso
  }
}

export default function TabQuizHistory({ userId }: TabQuizHistoryProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [summary, setSummary] = useState<QuizSummary>({
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    totalBonusVotes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [reviewModalAttempt, setReviewModalAttempt] = useState<QuizAttempt | null>(null)

  useEffect(() => {
    let mounted = true
    profileService.getQuizHistory(userId).then((res) => {
      if (mounted) {
        setAttempts(res.attempts)
        setSummary(res.summary)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [userId])

  // Close review modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReviewModalAttempt(null)
      }
    }
    if (reviewModalAttempt) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [reviewModalAttempt])

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-quiz"
      aria-labelledby="tab-quiz"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Lịch sử thử tài kiến thức (Quiz)</h2>
          <p>Nhật ký làm bài trắc nghiệm địa danh nông thôn và lượt vote thưởng bạn đã nhận.</p>
        </div>
        <Link href="/vote" className="btn btn-primary" style={{ borderRadius: 100, fontSize: 13 }}>
          Làm Quiz mới <Icon name="arrow" size={14} />
        </Link>
      </div>

      {/* 4 Chỉ số tóm tắt */}
      <div className="quiz-stats-quad">
        <div className="quad-item">
          <strong>{summary.totalAttempts}</strong>
          <span>Lần thử tài</span>
        </div>
        <div className="quad-item">
          <strong>{summary.averageScore}</strong>
          <span>Điểm trung bình (thang 10)</span>
        </div>
        <div className="quad-item">
          <strong>{summary.highestScore}/10</strong>
          <span>Điểm cao nhất</span>
        </div>
        <div className="quad-item">
          <strong style={{ color: "#0284c7" }}>+{summary.totalBonusVotes}</strong>
          <span>Lượt vote thưởng đã nhận</span>
        </div>
      </div>

      {/* Danh sách lượt làm Quiz */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="header-avatar-skeleton" style={{ width: "100%", height: 74, borderRadius: 16 }} />
          <div className="header-avatar-skeleton" style={{ width: "100%", height: 74, borderRadius: 16 }} />
        </div>
      ) : attempts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "var(--color-surface-tint)",
            borderRadius: 16,
            border: "1.5px dashed var(--color-border)",
          }}
        >
          <span style={{ fontSize: 44, display: "block", marginBottom: 12 }}>🎓</span>
          <strong style={{ display: "block", fontSize: 16, color: "var(--color-text)", marginBottom: 6 }}>
            Bạn chưa thực hiện vòng Quiz nào
          </strong>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
            Mỗi ngày bạn có cơ hội thử tài trắc nghiệm để nhận thêm lượt bình chọn cho điểm đến!
          </p>
          <Link href="/vote" className="btn btn-primary" style={{ borderRadius: 100 }}>
            Tham gia Quiz ngay <Icon name="arrow" size={14} />
          </Link>
        </div>
      ) : (
        <div>
          {attempts.map((attempt) => (
            <div key={attempt.id} className="quiz-attempt-card">
              <div className="attempt-meta">
                <h4>{attempt.title}</h4>
                <div className="attempt-sub-info">
                  <span>📅 {formatVNTime(attempt.timestamp)}</span>
                  <span>⏱️ {attempt.timeSpent}</span>
                  {attempt.bonusGranted > 0 && (
                    <span style={{ color: "#0284c7", fontWeight: 700 }}>
                      🎁 +{attempt.bonusGranted} lượt vote thưởng
                    </span>
                  )}
                </div>
              </div>

              <div className="attempt-action-group">
                <span className="score-pill">
                  {attempt.score}/{attempt.totalQuestions} điểm
                </span>
                {attempt.questionsReview && attempt.questionsReview.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ borderRadius: 100, fontSize: 12, padding: "6px 14px" }}
                    onClick={() => setReviewModalAttempt(attempt)}
                  >
                    Xem lại
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalAttempt && (
        <div
          className="profile-modal-backdrop"
          onClick={() => setReviewModalAttempt(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-quiz-title"
        >
          <div
            className="profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <div>
                <h3 id="modal-quiz-title">Chi tiết kết quả Quiz</h3>
                <small style={{ color: "var(--color-text-muted)" }}>
                  {reviewModalAttempt.title} • {reviewModalAttempt.score}/
                  {reviewModalAttempt.totalQuestions} điểm
                </small>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setReviewModalAttempt(null)}
                aria-label="Đóng xem lại"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="modal-body-scroll">
              {reviewModalAttempt.questionsReview.map((q, idx) => (
                <div
                  key={q.id || idx}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid var(--color-border)",
                    background: q.isCorrect ? "var(--color-surface-tint)" : "#FFF5F5",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{q.isCorrect ? "✅" : "❌"}</span>
                    <strong style={{ fontSize: 13.5, color: "var(--color-text)" }}>
                      Câu {idx + 1}: {q.question}
                    </strong>
                  </div>

                  <div style={{ fontSize: 12.5, display: "flex", flexDirection: "column", gap: 4, marginLeft: 24 }}>
                    <span>
                      Đáp án của bạn:{" "}
                      <strong style={{ color: q.isCorrect ? "var(--color-primary-dark)" : "#c53030" }}>
                        {q.options[q.selectedAnswer]}
                      </strong>
                    </span>
                    {!q.isCorrect && (
                      <span style={{ color: "var(--color-primary-dark)" }}>
                        Đáp án đúng: <strong>{q.options[q.correctAnswer]}</strong>
                      </span>
                    )}
                    {q.explanation && (
                      <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 11.5, fontStyle: "italic" }}>
                        💡 Giải thích: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
