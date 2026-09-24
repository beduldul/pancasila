import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, Brain, AlertCircle, Zap, FileText, Search, X, Layers } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

const RANGE_CONFIG = {
  '4-7': { title: 'Kelas 7', desc: 'Sekolah Menengah Pertama Awal' },
  '8':   { title: 'Kelas 8', desc: 'Sekolah Menengah Pertama Menengah' },
  '9':   { title: 'Kelas 9', desc: 'Sekolah Menengah Pertama Lanjutan' },
}

function ClassSwitcher({ current, onSelect }) {
  const orderedKeys = ['4-7', '8', '9'];
  return (
    <div className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm mb-10 w-fit">
      {orderedKeys.map((k) => {
        const v = RANGE_CONFIG[k]
        const active = current === k
        return (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              active 
                ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                : 'text-slate-500 hover:bg-white hover:text-red-600'
            }`}
          >
            {v.title}
          </button>
        )
      })}
    </div>
  )
}

export default function QuizAge() {
  const { range } = useParams()
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState('EASY')
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Fetch Dynamic Theme Config
  const { data: themeConfig } = useQuery({
    queryKey: ['system-config-public'],
    queryFn: async () => {
      const res = await api.get('/portal/config')
      return res.data
    },
    staleTime: 1000 * 60 * 5
  })

  // Derive colors from themeConfig or defaults
  const COLORS = useMemo(() => ({
    EASY:   { title: 'Pemula',   accent: themeConfig?.easyColor || '#10B981',   light: '#ECFDF5', muted: '#065F46' },
    MEDIUM: { title: 'Menengah', accent: themeConfig?.mediumColor || '#F59E0B', light: '#FFFBEB', muted: '#92400E' },
    HARD:   { title: 'Lanjutan', accent: themeConfig?.hardColor || '#EF4444',   light: '#FFF1F2', muted: '#881337' },
  }), [themeConfig])

  const config = COLORS[difficulty] || COLORS.EASY
  const rangeInfo = RANGE_CONFIG[range] || RANGE_CONFIG['4-7']

  // 2. Fetch Quizzes based on range AND difficulty
  const { data: quizzes = [], isLoading: loading } = useQuery({
    queryKey: ['quizzes', range, difficulty],
    queryFn: async () => {
      const res = await api.get('/quizzes', { 
        params: { 
          difficulty: difficulty, 
          targetRange: range,
          limit: 100 
        } 
      })
      // If backend doesn't support 'range', we might need to filter here
      // But let's assume we fetch by difficulty first as per legacy
      return res.data.data || []
    }
  })

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--edu-cream)' }}>

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--edu-cream)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top right, ${config.accent}18 0%, transparent 60%)` }} />
        <Brain size={380} strokeWidth={0.7}
          className="absolute -right-20 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: config.accent, opacity: 0.07 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-36 pb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Beranda</Link>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accent }}>{rangeInfo.title}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: config.accent }}>
                {rangeInfo.title} &nbsp;·&nbsp; {rangeInfo.desc}
              </p>
              <h1 className="font-black tracking-tight leading-none mb-5"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', color: 'var(--edu-text)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                Level<br />
                <span style={{ color: config.accent }}>{config.title}.</span>
              </h1>
              <p className="text-base text-slate-500 max-w-md leading-relaxed font-medium">
                Pilih tantangan yang sesuai dengan kemampuanmu di {rangeInfo.title}.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative w-full lg:w-80">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari kuis..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-11 pr-9 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 transition-all font-semibold text-slate-800 text-sm shadow-sm"
                style={{ focusRingColor: config.accent }} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── BODY ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Class Switcher */}
        <ClassSwitcher 
          current={range} 
          onSelect={(k) => navigate(`/quiz/range/${k}`)} 
        />

        <div className="grid lg:grid-cols-12 gap-10">

          {/* ── SIDEBAR ────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1 flex items-center gap-2">
                <Layers size={12} /> Pilih Kesulitan
              </p>

              {Object.entries(COLORS).map(([k, v]) => {
                const isActive = k === difficulty
                return (
                  <button key={k} onClick={() => setDifficulty(k)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-3xl transition-all text-sm font-bold ${
                      isActive
                        ? 'bg-white shadow-lg text-slate-900 border border-slate-100 -translate-y-0.5'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: v.accent }} />
                    <div className="text-left">
                      <span className="block">{v.title}</span>
                      <span className="text-[10px] font-normal text-slate-400">Tingkat {k.toLowerCase()}</span>
                    </div>
                  </button>
                )
              })}

            </div>
          </div>

          {/* ── QUIZ LIST ──────────────────────────────────── */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-lg font-black text-slate-900">
                Koleksi Kuis {config.title}
              </h2>
              <span className="text-xs font-bold text-slate-400">{filteredQuizzes.length} kuis tersedia</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                   <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[2rem]" />
                ))}
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                <AlertCircle size={40} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Belum Tersedia</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {searchTerm ? 'Tidak ada kuis yang cocok dengan pencarianmu.' : `Kuis untuk tingkat ${config.title} di ${rangeInfo.title} sedang dalam penyusunan.`}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-5">
                  {filteredQuizzes.map((q, i) => (
                    <motion.div key={q.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: Math.min(i * 0.05, 0.4) }}
                      className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">

                      <div className="flex">
                        <div className="w-1.5 shrink-0" style={{ background: config.accent }} />

                        <div className="flex-1 px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                                {q.category?.name || 'Umum'}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Zap size={9} fill="currentColor" /> +100 XP
                              </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-slate-800 transition-colors">{q.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5">{q.description}</p>

                            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400">
                              <span className="flex items-center gap-2">
                                <FileText size={14} className="opacity-70" /> {q._count?.questions || 0} Soal
                              </span>
                              <span className="flex items-center gap-2">
                                <Clock size={14} className="opacity-70" /> {Math.floor((q.timeLimit || 3600) / 60)} Menit
                              </span>
                            </div>
                          </div>

                          <Link to={`/quiz-play/${q.slug}`}
                            className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: config.accent, boxShadow: `0 12px 24px -8px ${config.accent}88` }}>
                            Mulai Kuis
                            <Play size={16} className="fill-current" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
