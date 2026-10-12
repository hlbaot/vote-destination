"use client"
import React, { useEffect, useState } from "react"
import { MAP_CONFIG } from "@/lib/api/mapService"

function pad(n: number) { return String(n).padStart(2, "0") }

export default function MapCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, ended: false })

  useEffect(() => {
    const end = new Date(MAP_CONFIG.endDate + "T23:59:59+07:00").getTime()
    function update() {
      const now = Date.now()
      const diff = end - now
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, ended: true }); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ days, hours, mins, secs, ended: false })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (timeLeft.ended) return (
    <span className="text-xs font-semibold text-[#E05A36]">Đã kết thúc</span>
  )

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className="text-[#556963] mr-1 text-[10px]">Kết thúc:</span>
      {timeLeft.days > 0 && <><span className="font-bold text-[#0F3D34]">{timeLeft.days}</span><span className="text-[#8B9E8A]">d</span></>}
      <span className="font-bold text-[#0F3D34]">{pad(timeLeft.hours)}</span>
      <span className="text-[#8B9E8A]">:</span>
      <span className="font-bold text-[#0F3D34]">{pad(timeLeft.mins)}</span>
      <span className="text-[#8B9E8A]">:</span>
      <span className={`font-bold ${timeLeft.secs % 2 === 0 ? "text-[#0F3D34]" : "text-[#2E7D32]"}`}>{pad(timeLeft.secs)}</span>
    </div>
  )
}
