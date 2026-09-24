import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Trophy, TrendingUp, Users, Crown, Zap, Award, Star, Sparkles } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const RANK_META = [
  { ring: '#FDE68A', glow: 'rgba(251,191,36,0.4)', text: '#92400E', bg: '#FFFBEB', badge: 'from-yellow-400 to-amber-500', size: 'w-32 h-32', fontSize: 'text-5xl' },
  { ring: '#E2E8F0', glow: 'rgba(148,163,184,0.3)', text: '#334155', bg: '#F8FAFC', badge: 'from-slate-300 to-slate-400', size: 'w-24 h-24', fontSize: 'text-4xl' },
  { ring: '#FED7AA', glow: 'rgba(249,115,22,0.25)', text: '#7C2D12', bg: '#FFF7ED', badge: 'from-orange-400 to-orange-500', size: 'w-24 h-24', fontSize: 'text-4xl' },
]

// ── Animated score counter ─────────────────────────────────────
function AnimatedScore({ value, color, suffix = '%', className = '' }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!started) return
    let start = 0
    const target = value || 0
    if (target === 0) { setDisplay(0); return }
    const duration = 1200
    const step = Math.max(1, Math.floor(target / (duration / 16)))
    const interval = setInterval(() => {
      start = Math.min(start + step, target)
      setDisplay(start)
      if (start >= target) clearInterval(interval)
    }, 16)
    return () => clearInterval(interval)
  }, [started, value])

  return (
    <span className={className} style={{ color }}>
      {display}{suffix}
    </span>
  )
}

// ── Floating gold sparkle particle ────────────────────────────
function Sparkle({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: 5, height: 5, background: '#FCD34D', ...style }}
      animate={{
        y: [0, -30, -60],
        x: [0, style.driftX ?? 10, style.driftX ? style.driftX * 1.5 : 20],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0],
      }}
      transition={{
        duration: style.dur ?? 2,
        repeat: Infinity,
        delay: style.delay ?? 0,
        ease: 'easeOut',
      }}
    />
  )
}

const SPARKLES = [
  { left: '15%', top: '40%', driftX: -15, dur: 2.0, delay: 0 },
  { left: '25%', top: '60%', driftX: -8,  dur: 2.4, delay: 0.4 },
  { left: '45%', top: '30%', driftX: 5,   dur: 1.8, delay: 0.8 },
  { left: '55%', top: '55%', driftX: 12,  dur: 2.2, delay: 0.2 },
  { left: '70%', top: '45%', driftX: -10, dur: 2.0, delay: 0.6 },
  { left: '80%', top: '65%', driftX: 18,  dur: 1.9, delay: 1.0 },
  { left: '35%', top: '75%', driftX: -5,  dur: 2.5, delay: 1.2 },
  { left: '62%', top: '35%', driftX: 8,   dur: 2.1, delay: 0.3 },
]

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [podiumReady, setPodiumReady] = useState(false)

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/portal/leaderboard', { params: { limit: 50 } })
      setLeaderboard(res.data)
      // Give a small delay before showing podium for dramatic effect
      setTimeout(() => setPodiumReady(true), 200)
    } catch {
      toast.error('Gagal memuat data peringkat')
    } finally {
      setLoading(false)
    }
  }

  const top3 = leaderboard.slice(0, 3)
  const myRank = leaderboard.find(u => u.userId === user?.id)
  const myIndex = leaderboard.findIndex(u => u.userId === user?.id)

  return (
    <div className="min-h-screen" style={{ background: 'var(--edu-cream)' }}>

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--edu-cream)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(251,191,36,0.12) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(251,191,36,0.06) 0%, transparent 60%)' }} />
        <Trophy size={380} strokeWidth={0.7}
          className="absolute -right-20 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#F59E0B', opacity: 0.06 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-36 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 mb-3">
              Papan Skor &nbsp;·&nbsp; {leaderboard.length} Peserta
            </p>
            <h1 className="font-black tracking-tight leading-none mb-5"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: 'var(--edu-text)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              Papan<br />
              <span style={{ color: '#D97706' }}>Peringkat.</span>
            </h1>
            <p className="text-base text-slate-500 max-w-md leading-relaxed font-medium">
              Belajar konsisten, kerjakan kuis harian, dan buktikan kemampuanmu di hadapan seluruh siswa.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── MAIN BODY ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">

          {/* ── SIDEBAR ──────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
              className="rounded-3xl border overflow-hidden"
              style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.06)' }}>
              <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Posisi Kamu</p>
              </div>
              <div className="p-6">
                {user ? (
                  <div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      className="flex items-baseline gap-2 mb-5">
                      <span className="font-black" style={{ fontSize: '3rem', lineHeight: 1, color: 'var(--edu-text)' }}>
                        #{myIndex >= 0 ? myIndex + 1 : '--'}
                      </span>
                      <span className="text-sm font-bold text-slate-400">peringkat</span>
                    </motion.div>
                    <div className="space-y-3">
                      {[
                        { label: 'Total XP', val: `${myRank?.xp ?? user.xp ?? 0} pts`, color: '#D97706' },
                        { label: 'Level', val: `Level ${user.level || 1}`, color: '#6366F1' },
                        { label: 'Skor Terbaik', val: `${myRank?.bestScore ?? 0}%`, color: 'var(--edu-text)' },
                      ].map((item, i) => (
                        <motion.div key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-semibold">{item.label}</span>
                          <span className="text-sm font-black" style={{ color: item.color }}>{item.val}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <p className="text-xs text-slate-400 mb-3">Login untuk melihat posisimu</p>
                    <Link to="/login" className="text-xs font-black text-amber-600 hover:text-amber-700 transition-colors">
                      Masuk Sekarang &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── MAIN CONTENT ─────────────────────────────────── */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="space-y-4 pt-4">
                <div className="h-80 skeleton rounded-3xl" />
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-32">
                <Trophy size={64} className="mx-auto mb-6 text-slate-200" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Belum ada peserta</h3>
                <p className="text-slate-400 mb-8">Jadilah yang pertama mengisi papan peringkat!</p>
                <Link to="/portal"
                  className="inline-block bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all">
                  Mulai Belajar
                </Link>
              </div>
            ) : (
              <>
                {/* ══ PODIUM ══════════════════════════════════ */}
                {top3.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="mb-10 rounded-[2.5rem] overflow-hidden relative"
                    style={{
                      background: 'linear-gradient(160deg, #FFFDF0 0%, #FEF9E7 50%, #FFFBEB 100%)',
                      border: '1.5px solid #FDE68A',
                    }}>

                    {/* Glowing background radial */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(251,191,36,0.2) 0%, transparent 60%)' }} />

                    {/* Gold sparkle particles — always running */}
                    {SPARKLES.map((s, i) => <Sparkle key={i} style={s} />)}

                    <div className="relative z-10 px-4 sm:px-8 pt-10 sm:pt-16 pb-0">
                      <div className="flex items-end justify-center gap-1 sm:gap-10 max-w-full overflow-hidden">

                        {/* ── RANK #2 ── slide in from left */}
                        {top3[1] && (
                            <motion.div
                            initial={{ opacity: 0, x: -40, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 0.35, type: 'spring', stiffness: 90, damping: 14 }}
                            className="flex flex-col items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <motion.div
                              whileHover={{ scale: 1.06, rotate: -3 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="relative cursor-pointer">
                                <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black shadow-lg border-2 transition-shadow hover:shadow-xl"
                                  style={{ background: RANK_META[1].bg, color: RANK_META[1].text, borderColor: RANK_META[1].ring, boxShadow: `0 12px 32px -8px ${RANK_META[1].glow}` }}>
                                  <span className="text-xl sm:text-4xl">{top3[1].name?.charAt(0).toUpperCase()}</span>
                                </div>
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br ${RANK_META[1].badge} flex items-center justify-center text-white font-black text-[10px] sm:text-sm shadow-md border-2 border-white`}>
                                2
                              </div>
                            </motion.div>
                            <div className="text-center w-full px-1">
                              <p className="font-black text-slate-900 text-[10px] sm:text-sm truncate">{top3[1].name}</p>
                              <AnimatedScore value={top3[1].bestScore ?? 0} color="#64748B" className="text-[9px] sm:text-xs font-bold" />
                            </div>
                            {/* Podium base */}
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
                              style={{ transformOrigin: 'bottom', width: '100%' }}>
                              <div className="w-full h-12 sm:h-16 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(180deg, rgba(148,163,184,0.2) 0%, rgba(148,163,184,0.4) 100%)' }}>
                                <span className="text-slate-400 font-black text-xs sm:text-lg">2</span>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}

                        {/* ── RANK #1 ── drops from above with glow ring */}
                        {top3[0] && (
                          <motion.div
                            initial={{ opacity: 0, y: -60, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.55, type: 'spring', stiffness: 80, damping: 12 }}
                            className="flex flex-col items-center gap-2 sm:gap-3 flex-1 min-w-0 -translate-y-4 sm:-translate-y-6">

                            <div className="relative flex flex-col items-center" style={{ zIndex: 20 }}>
                              {/* Crown with glow + bounce */}
                              <motion.div
                                animate={{
                                  y: [0, -8, 0],
                                  scale: [1, 1.1, 1],
                                  filter: [
                                    'drop-shadow(0 4px 10px rgba(245,158,11,0.4))',
                                    'drop-shadow(0 12px 25px rgba(245,158,11,0.7))',
                                    'drop-shadow(0 4px 10px rgba(245,158,11,0.4))',
                                  ],
                                }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                style={{ marginBottom: '-10px', position: 'relative', zIndex: 30 }}>
                                <Crown size={32} className="sm:w-20 sm:h-20" style={{ color: '#F59E0B', fill: '#FCD34D' }} />
                              </motion.div>

                              {/* Pulsing glow ring behind avatar */}
                                <motion.div
                                  animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                  className="absolute rounded-full pointer-events-none"
                                style={{
                                  inset: '-6px',
                                  background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
                                  zIndex: 5,
                                  top: '40px', // align with avatar start
                                }} />

                              {/* Avatar */}
                              <motion.div
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 260 }}
                                className="relative cursor-pointer" style={{ zIndex: 10 }}>
                                <div className="w-16 h-16 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2rem] flex items-center justify-center font-black shadow-2xl border-2"
                                  style={{
                                    background: RANK_META[0].bg,
                                    color: RANK_META[0].text,
                                    borderColor: RANK_META[0].ring,
                                    boxShadow: `0 16px 32px -8px ${RANK_META[0].glow}, 0 0 0 4px rgba(251,191,36,0.1)`,
                                  }}>
                                  <span className="text-2xl sm:text-5xl">{top3[0].name?.charAt(0).toUpperCase()}</span>
                                </div>
                              </motion.div>
                            </div>

                            <div className="text-center w-full px-1">
                              <p className="font-black text-slate-900 text-xs sm:text-base truncate">{top3[0].name}</p>
                              <p className="flex items-center justify-center gap-1 mt-0.5">
                                <AnimatedScore value={top3[0].bestScore ?? 0} color="#D97706" className="text-sm sm:text-base font-black" />
                                <Star size={10} fill="#D97706" color="#D97706" className="sm:w-[13px]" />
                              </p>
                            </div>

                            {/* Taller gold podium base */}
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.85, duration: 0.45, ease: 'easeOut' }}
                              style={{ transformOrigin: 'bottom', width: '100%' }}>
                              <div className="w-full h-20 sm:h-28 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0.55) 100%)' }}>
                                <Crown size={24} style={{ color: '#D97706', opacity: 0.35 }} className="sm:w-[30px]" />
                              </div>
                            </motion.div>
                          </motion.div>
                        )}

                        {/* ── RANK #3 ── slide in from right */}
                        {top3[2] && (
                          <motion.div
                            initial={{ opacity: 0, x: 40, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 90, damping: 14 }}
                            className="flex flex-col items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <motion.div
                              whileHover={{ scale: 1.06, rotate: 3 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="relative cursor-pointer">
                                <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black shadow-lg border-2 transition-shadow hover:shadow-xl"
                                  style={{ background: RANK_META[2].bg, color: RANK_META[2].text, borderColor: RANK_META[2].ring, boxShadow: `0 12px 32px -8px ${RANK_META[2].glow}` }}>
                                  <span className="text-xl sm:text-4xl">{top3[2].name?.charAt(0).toUpperCase()}</span>
                                </div>
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br ${RANK_META[2].badge} flex items-center justify-center text-white font-black text-[10px] sm:text-sm shadow-md border-2 border-white`}>
                                3
                              </div>
                            </motion.div>
                            <div className="text-center w-full px-1">
                              <p className="font-black text-slate-900 text-[10px] sm:text-sm truncate">{top3[2].name}</p>
                              <AnimatedScore value={top3[2].bestScore ?? 0} color="#EA580C" className="text-[9px] sm:text-xs font-bold" />
                            </div>
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 0.75, duration: 0.35, ease: 'easeOut' }}
                              style={{ transformOrigin: 'bottom', width: '100%' }}>
                              <div className="w-full h-8 sm:h-10 rounded-t-xl sm:rounded-t-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(180deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.35) 100%)' }}>
                                <span className="text-orange-400 font-black text-[10px] sm:text-lg">3</span>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* ══ FULL RANK LIST ═══════════════════════════ */}
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-between mb-5">
                    <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      <TrendingUp size={20} className="text-slate-400" />
                      Semua Peserta
                    </h2>
                    <span className="text-xs font-bold text-slate-400">{leaderboard.length} terdaftar</span>
                  </motion.div>

                  <div className="space-y-2">
                    <AnimatePresence>
                      {leaderboard.map((u, index) => {
                        if (!u) return null
                        const rank = index + 1
                        const isMe = user?.id === u.userId
                        const isHovered = hoveredRow === index

                        return (
                          <motion.div
                            key={u.userId ?? index}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: Math.min(index * 0.05, 0.6) + 0.8,
                              type: 'spring', stiffness: 120, damping: 18,
                            }}
                            onHoverStart={() => setHoveredRow(index)}
                            onHoverEnd={() => setHoveredRow(null)}
                            whileHover={{ x: 4, transition: { type: 'spring', stiffness: 300 } }}
                            className="relative flex items-center gap-4 px-5 py-4 rounded-2xl cursor-default"
                            style={{
                              background: isMe
                                ? '#FFFBEB'
                                : isHovered
                                ? '#ffffff'
                                : 'rgba(255,255,255,0.55)',
                              border: isMe
                                ? '1.5px solid #FDE68A'
                                : '1px solid rgba(0,0,0,0.05)',
                              boxShadow: isHovered || isMe
                                ? '0 8px 24px -8px rgba(0,0,0,0.08)'
                                : 'none',
                              transition: 'background 0.2s, box-shadow 0.2s',
                            }}>

                            {/* Rank number */}
                            <div className="w-8 shrink-0 flex justify-center">
                              {rank === 1 ? (
                                <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                  <Trophy size={18} style={{ color: '#F59E0B' }} />
                                </motion.div>
                              ) : rank === 2 ? (
                                <span className="text-base font-black text-slate-400">2</span>
                              ) : rank === 3 ? (
                                <span className="text-base font-black text-orange-500">3</span>
                              ) : (
                                <span className="text-sm font-bold text-slate-300">{rank}</span>
                              )}
                            </div>

                            {/* Avatar with scale on hover */}
                            <motion.div
                              animate={{ scale: isHovered ? 1.1 : 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                              style={{
                                background: rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : rank === 3 ? '#F97316' : '#1E293B',
                              }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </motion.div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">{u.name}</span>
                                {isMe && (
                                  <motion.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0">
                                    Kamu
                                  </motion.span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                  <Zap size={10} className="text-amber-400" /> {u.xp ?? 0} XP
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Lv.{u.level ?? 1}</span>
                              </div>
                            </div>

                            {/* Score — pops on hover */}
                            <motion.div
                              animate={{ scale: isHovered ? 1.1 : 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                              className="text-right shrink-0">
                              <span className="text-lg font-black"
                                style={{ color: rank === 1 ? '#D97706' : isHovered ? '#1E293B' : 'var(--edu-text)' }}>
                                {u.bestScore ?? 0}%
                              </span>
                            </motion.div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
