/**
 * mapService.ts — MOCK service layer for "Bản đồ bình chọn" page.
 * Replace function bodies with real axios calls in production.
 * ⚠️ MOCK: Quiz answer checking is client-side (sessionStorage). Production must use server.
 */
import { initialDestinations, voteConfig } from "@/data/destinations"
import { Destination } from "@/types"

export interface MapDestinationNode {
  id: string; name: string; province: string; region: string; rawVotes: number;
  thumbnail: string; tag: string; category: string;
  mapX: number; mapY: number;
  stage: 0 | 1 | 2 | 3;
  isNational1st: boolean; isProvince1st: boolean;
}

export interface ProvinceMapData {
  svgId: string; name: string; totalVotes: number; rank: number; destinationCount: number; region: string;
  labelX: number; labelY: number;
}

export interface LeaderboardEntry {
  rank: number; id: string; name: string; province: string; rawVotes: number;
  stage: 0 | 1 | 2 | 3; isTrending: boolean;
}

export interface DailyVoteStatus {
  baseQuota: number; bonusQuota: number; usedToday: number;
  votedDestinations: string[]; quizTriesLeft: number; quizBonusClaimed: boolean; isLoggedIn: boolean;
}

export interface QuizQuestion { id: string; text: string; options: string[] }
export interface QuizResult { correctCount: number; total: number; bonusVotes: number }

export const MAP_CONFIG = {
  treeStageThresholds: [0, 200, 2000, 8000] as const,
  colorThresholds: [1, 4000, 8000, 11000] as const,
  semanticZoomThreshold: 2.2,
  pollingIntervalMs: 8_000,
  quizQuestionsPerRound: 5,
  quizSecondsPerQuestion: 20,
  quizMaxTriesPerDay: 3,
  quizBonusVotes: 2,
  endDate: voteConfig.endDate,
  startDate: voteConfig.startDate,
} as const

function getStage(votes: number): 0 | 1 | 2 | 3 {
  const [, t1, t2, t3] = MAP_CONFIG.treeStageThresholds
  if (votes >= t3) return 3
  if (votes >= t2) return 2
  if (votes >= t1) return 1
  return 0
}

// Mock coordinates (SVG viewBox space ~0-1000 x 0-900). Needs GIS review before production.
const COORDS: Record<string, [number, number]> = {
  "69":[295,145],"13":[300,135],"14":[315,175],"61":[360,140],
  "17":[375,210],"18":[385,220],"59":[420,195],"15":[248,162],
  "16":[232,185],"67":[240,208],"65":[195,180],"63":[200,150],
  "1":[410,255],"70":[378,265],"20":[365,247],"71":[270,228],
  "19":[348,260],"25":[432,295],"57":[473,255],"72":[498,235],
  "73":[510,225],"74":[460,270],"9":[470,268],"21":[435,262],
  "23":[430,272],"27":[415,325],"28":[430,340],"75":[398,318],
  "29":[420,365],"30":[435,375],"31":[435,398],"76":[448,428],
  "33":[448,435],"34":[462,455],"3":[476,474],"6":[505,498],
  "5":[498,510],"77":[515,518],"78":[520,548],"35":[530,540],
  "36":[476,548],"37":[540,572],"38":[495,572],"44":[538,598],
  "43":[498,600],"39":[560,628],"40":[558,648],"41":[508,640],
  "79":[518,658],"80":[575,682],"42":[570,675],"7":[558,730],
  "81":[588,758],"8":[600,780],"45":[590,718],"47":[538,735],
  "82":[512,775],"52":[495,798],"50":[510,790],"49":[500,785],
  "11":[478,812],"83":[468,830],"55":[448,808],"84":[418,840],
  "56":[385,870],"85":[438,855],"54":[470,855],"53":[468,875],
}

const DAILY_KEY = "map_daily_vote_v1"
function getTodayStr() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }
interface Store { date:string; used:number; bonus:number; votedIds:string[]; quizTries:number; quizBonusClaimed:boolean }
function loadStore(): Store {
  if (typeof window === "undefined") return { date: "", used: 0, bonus: 0, votedIds: [], quizTries: 0, quizBonusClaimed: false }
  const today = getTodayStr()
  try { const r = localStorage.getItem(DAILY_KEY); if (r) { const p = JSON.parse(r); if (p.date === today) return p } } catch {}
  return { date: today, used: 0, bonus: 0, votedIds: [], quizTries: 0, quizBonusClaimed: false }
}
function saveStore(s: Store) { if (typeof window!=="undefined") localStorage.setItem(DAILY_KEY, JSON.stringify(s)) }

export function getMapDestinations(destinations: Destination[]): MapDestinationNode[] {
  const sorted = [...destinations].sort((a,b)=>b.rawVotes-a.rawVotes)
  const prov1st: Record<string,string> = {}
  for (const d of sorted) { const p=d.province||d.place; if(p&&!prov1st[p]) prov1st[p]=d.id }
  return destinations.map((d,i) => {
    const [x,y] = COORDS[d.id] || [400+(i%20)*15, 400+Math.floor(i/20)*20]
    return { id:d.id, name:d.name, province:d.province||d.place, region:d.region, rawVotes:d.rawVotes,
      thumbnail:d.thumbnail||"", tag:d.tag, category:d.category||"", mapX:x, mapY:y, stage:getStage(d.rawVotes),
      isNational1st:sorted[0]?.id===d.id, isProvince1st:prov1st[d.province||d.place]===d.id }
  })
}

export function getLeaderboard(destinations: Destination[], top=15): LeaderboardEntry[] {
  return [...destinations].sort((a,b)=>b.rawVotes-a.rawVotes).slice(0,top).map((d,i)=>({
    rank:i+1, id:d.id, name:d.name, province:d.province||d.place, rawVotes:d.rawVotes,
    stage:getStage(d.rawVotes), isTrending:d.rawVotes>9000&&i<8
  }))
}

export function getProvinceMapData(destinations: Destination[]): ProvinceMapData[] {
  const map = new Map<string, { votes:number; count:number; region:string; x:number; y:number }>()
  for (const d of destinations) {
    const key = d.province || d.place
    const [x, y] = COORDS[d.id] || [410, 450]
    if (!map.has(key)) map.set(key, { votes:0, count:0, region:d.region, x:0, y:0 })
    const entry = map.get(key)!
    entry.votes += d.rawVotes
    entry.count += 1
    entry.x += x
    entry.y += y
  }
  const list = [...map.entries()].map(([name,data])=>({ name,...data })).sort((a,b)=>b.votes-a.votes)
  return list.map((item,i) => ({
    svgId: "", name:item.name, totalVotes:item.votes, rank:i+1, destinationCount:item.count, region:item.region,
    labelX: Math.round(item.x / Math.max(1, item.count)),
    labelY: Math.round(item.y / Math.max(1, item.count)),
  }))
}

export function getDailyVoteStatus(): DailyVoteStatus {
  const s = loadStore()
  return { baseQuota:voteConfig.limitPerDay, bonusQuota:s.bonus, usedToday:s.used,
    votedDestinations:s.votedIds, quizTriesLeft:MAP_CONFIG.quizMaxTriesPerDay-s.quizTries,
    quizBonusClaimed:s.quizBonusClaimed, isLoggedIn:true }
}

export function castVote(destinationId: string): { success:boolean; error?:string } {
  const s=loadStore()
  const max=voteConfig.limitPerDay+s.bonus
  if (s.used>=max) return { success:false, error:"Bạn đã dùng hết lượt bình chọn hôm nay." }
  if (s.votedIds.includes(destinationId)) return { success:false, error:"Bạn đã bình chọn điểm đến này hôm nay." }
  s.used+=1; s.votedIds=[...s.votedIds, destinationId]; saveStore(s)
  return { success:true }
}

const QUIZ_POOL = [
  { text:"Vịnh Hạ Long thuộc tỉnh/thành phố nào?", options:["Quảng Ninh","Hải Phòng","Ninh Bình","Thanh Hóa"], correct:0 },
  { text:"Hội An được UNESCO công nhận Di sản năm nào?", options:["1993","1999","2003","2010"], correct:1 },
  { text:"Đỉnh núi cao nhất Việt Nam là?", options:["Phan Xi Păng","Ngọc Linh","Pu Si Lung","Tây Côn Lĩnh"], correct:0 },
  { text:"Phong Nha – Kẻ Bàng thuộc tỉnh nào?", options:["Quảng Trị","Quảng Bình","Hà Tĩnh","Quảng Nam"], correct:1 },
  { text:"Lễ hội Katê là lễ hội của dân tộc nào?", options:["Khmer","Chăm","Ê-đê","Ba-na"], correct:1 },
  { text:"Sông nào chảy qua thành phố Huế?", options:["Thu Bồn","Hương","Hàn","Lam"], correct:1 },
  { text:"Côn Đảo thuộc tỉnh nào?", options:["Bà Rịa-Vũng Tàu","TP. HCM","Bến Tre","Tiền Giang"], correct:0 },
  { text:"Chợ nổi Cái Răng nằm ở đâu?", options:["Vĩnh Long","Tiền Giang","Cần Thơ","Đồng Tháp"], correct:2 },
  { text:"Ruộng bậc thang Mù Cang Chải thuộc tỉnh nào?", options:["Lào Cai","Yên Bái","Sơn La","Lai Châu"], correct:1 },
  { text:"Phú Quốc thuộc tỉnh nào?", options:["An Giang","Kiên Giang","Cà Mau","Bạc Liêu"], correct:1 },
  { text:"Hang Sơn Đoòng lớn nhất thế giới nằm ở đâu?", options:["Quảng Trị","Quảng Bình","Hà Tĩnh","T.T. Huế"], correct:1 },
  { text:"Mộc Châu nổi tiếng với sản vật nông nghiệp nào?", options:["Cà phê","Chè","Cao su","Hồ tiêu"], correct:1 },
]

export function startQuiz(): { questions:QuizQuestion[]; sessionId:string } {
  const s=loadStore()
  const picked=[...QUIZ_POOL].sort(()=>Math.random()-0.5).slice(0,MAP_CONFIG.quizQuestionsPerRound)
  const sessionId=`quiz-${Date.now()}`
  if (typeof window!=="undefined") sessionStorage.setItem(sessionId, JSON.stringify(picked.map(q=>q.correct)))
  s.quizTries=Math.min(s.quizTries+1, MAP_CONFIG.quizMaxTriesPerDay); saveStore(s)
  return { questions:picked.map((q,i)=>({ id:`${sessionId}-${i}`, text:q.text, options:q.options })), sessionId }
}

// ⚠️ MOCK: answers checked client-side via sessionStorage. Replace with server call in production.
export function submitQuiz(sessionId:string, answers:number[]): QuizResult {
  let correct:number[]=[]
  if (typeof window!=="undefined") { try { const r=sessionStorage.getItem(sessionId); if(r) correct=JSON.parse(r) } catch {} }
  const correctCount=answers.filter((a,i)=>a===correct[i]).length
  const isPerfect=correctCount===MAP_CONFIG.quizQuestionsPerRound
  const bonusVotes=isPerfect?MAP_CONFIG.quizBonusVotes:0
  if (isPerfect) {
    const s=loadStore()
    if (!s.quizBonusClaimed) { s.bonus=Math.min(s.bonus+bonusVotes,MAP_CONFIG.quizBonusVotes); s.quizBonusClaimed=true; saveStore(s) }
  }
  return { correctCount, total:MAP_CONFIG.quizQuestionsPerRound, bonusVotes }
}

export interface TimelineSnapshot { date:string; votes:Record<string,number> }
export function getMockTimeline(destinations:Destination[]): TimelineSnapshot[] {
  const start = new Date(voteConfig.startDate)
  const end = new Date(voteConfig.endDate)
  const days: TimelineSnapshot[] = []
  const cur = new Date(start)
  let dayIdx = 0
  while (cur <= end && dayIdx < 15) {
    const progress = Math.min(1, (cur.getTime() - start.getTime()) / Math.max(1, end.getTime() - start.getTime()))
    const snap: TimelineSnapshot = { date: cur.toISOString().slice(0, 10), votes: {} }
    for (const d of destinations) {
      const pseudo = ((d.id.charCodeAt(0) * 17 + dayIdx * 31) % 20) / 100
      snap.votes[d.id] = Math.round(d.rawVotes * Math.min(progress * 1.1, 1) * (0.8 + pseudo))
    }
    days.push(snap)
    cur.setDate(cur.getDate() + 1)
    dayIdx++
  }
  return days
}
