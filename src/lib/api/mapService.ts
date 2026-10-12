/**
 * mapService.ts — MOCK service layer for "Bản đồ bình chọn" page.
 * Replace function bodies with real axios calls in production.
 * ⚠️ MOCK: Quiz answer checking is client-side (sessionStorage). Production must use server.
 */
import { initialDestinations, voteConfig } from "@/data/destinations"
import { mapStaticDestinationById } from "@/data/map/destinations"
import { project } from "@/lib/map/geo"
import { Destination } from "@/types"

export interface MapDestinationNode {
  id: string; name: string; province: string; region: string; rawVotes: number;
  thumbnail: string; tag: string; category: string;
  lat: number; lng: number; mapX: number; mapY: number;
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
  treeStageThresholds: [0, 4000, 8000, 11000] as const,
  provinceRankColors: {
    top5: "var(--color-map-rank-top5)",
    top15: "var(--color-primary)",
    top25: "var(--color-map-rank-top25)",
    rest: "var(--color-map-rank-rest)",
    empty: "var(--color-map-empty)",
  },
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

const MOCK_VOTES: Record<string, number> = {
  "69": 0, "13": 6200, "14": 2300, "61": 8900, "17": 4300, "18": 2100, "59": 3700,
  "15": 12800, "16": 9400, "67": 7600, "65": 5100, "63": 2800, "1": 11300, "70": 800,
  "20": 4600, "71": 1200, "19": 6900, "25": 11800, "57": 12100, "72": 1700, "73": 900,
  "74": 2500, "9": 8300, "21": 3200, "23": 1500, "27": 3900, "28": 5600, "75": 1800,
  "29": 4200, "30": 5300, "31": 2400, "76": 700, "33": 11100, "34": 3000, "3": 10100,
  "6": 8700, "5": 11900, "77": 1400, "78": 900, "35": 7100, "36": 3600, "37": 7900,
  "38": 4200, "44": 5100, "43": 3300, "39": 10500, "40": 4700, "41": 11600, "79": 2100,
  "80": 1300, "42": 6500, "7": 7400, "81": 2900, "8": 8200, "45": 4900, "47": 9200,
  "82": 600, "52": 4100, "50": 2700, "49": 2200, "11": 9800, "83": 1100, "55": 5900,
  "84": 1200, "56": 10800, "85": 800, "54": 2500, "53": 7200,
}

let warnedMissingGeoJson = false

export function getVotes(): Record<string, number> {
  return { ...MOCK_VOTES }
}

export function validateMapDestinationsDev(destinations: Destination[]) {
  if (process.env.NODE_ENV === "production" || warnedMissingGeoJson) return
  const missing = destinations.filter((d) => !mapStaticDestinationById.has(d.id)).map((d) => `${d.id}:${d.name}`)
  if (missing.length > 0) {
    console.warn("[vote-map] Missing lat/lng map data for destinations:", missing)
  }
  console.warn("[vote-map] GeoJSON 34 tỉnh chưa có trong repo; provinceId đang fallback theo destinations.ts. Khi thêm GeoJSON, hãy thay bằng d3.geoContains([lng,lat]).")
  warnedMissingGeoJson = true
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
  validateMapDestinationsDev(destinations)
  const votesById = getVotes()
  const sorted = [...destinations].sort((a,b)=>(votesById[b.id] ?? 0)-(votesById[a.id] ?? 0))
  const prov1st: Record<string,string> = {}
  for (const d of sorted) { const p=d.province||d.place; if(p&&!prov1st[p]) prov1st[p]=d.id }
  return destinations.map((d,i) => {
    const staticDestination = mapStaticDestinationById.get(d.id)
    const lng = staticDestination?.lng ?? 105 + (i % 8) * 0.4
    const lat = staticDestination?.lat ?? 21 - Math.floor(i / 8) * 0.4
    const [x,y] = project(lng, lat)
    const rawVotes = votesById[d.id] ?? d.rawVotes
    return { id:d.id, name:d.name, province:d.province||d.place, region:d.region, rawVotes,
      thumbnail:staticDestination?.image || d.thumbnail || "", tag:d.tag, category:d.category||"", lat, lng, mapX:x, mapY:y, stage:getStage(rawVotes),
      isNational1st:sorted[0]?.id===d.id, isProvince1st:prov1st[d.province||d.place]===d.id }
  })
}

export function getLeaderboard(destinations: Destination[], top=15): LeaderboardEntry[] {
  const votesById = getVotes()
  return [...destinations].sort((a,b)=>(votesById[b.id] ?? 0)-(votesById[a.id] ?? 0)).slice(0,top).map((d,i) => {
    const rawVotes = votesById[d.id] ?? 0
    return {
      rank:i+1, id:d.id, name:d.name, province:d.province||d.place, rawVotes,
      stage:getStage(rawVotes), isTrending:rawVotes>9000&&i<8
    }
  })
}

export function getProvinceMapData(destinations: Destination[]): ProvinceMapData[] {
  const votesById = getVotes()
  const map = new Map<string, { votes:number; count:number; region:string; x:number; y:number }>()
  for (const d of destinations) {
    const key = d.province || d.place
    const staticDestination = mapStaticDestinationById.get(d.id)
    const [x, y] = staticDestination ? project(staticDestination.lng, staticDestination.lat) : [410, 450]
    if (!map.has(key)) map.set(key, { votes:0, count:0, region:d.region, x:0, y:0 })
    const entry = map.get(key)!
    entry.votes += votesById[d.id] ?? 0
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
