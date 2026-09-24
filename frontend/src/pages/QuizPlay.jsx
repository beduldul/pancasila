import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, ArrowRight, Home, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatScientific } from '../utils/scientific'
import { useQuery } from '@tanstack/react-query'

export default function QuizPlay() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(`quiz_answers_${slug}`)
    return saved ? JSON.parse(saved) : {}
  })
  const [timeLeft, setTimeLeft] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [startToken, setStartToken] = useState(null)
  const [focusLostCount, setFocusLostCount] = useState(0)

  // useQuery for quiz data
  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz', slug],
    queryFn: async () => {
      const res = await api.get(`/quizzes/${slug}`)
      return res.data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  // Fetch signed start session token
  useEffect(() => {
    if (quiz && !startToken && !result) {
      api.post(`/quizzes/${quiz.id}/start`)
        .then(res => {
          setStartToken(res.data.startToken)
        })
        .catch(err => {
          console.error('Gagal memulai sesi kuis aman:', err)
          toast.error('Gagal memverifikasi sesi ujian yang aman. Silakan muat ulang halaman.')
        })
    }
  }, [quiz, startToken, result])

  // Track Tab Switching (Out of Focus)
  useEffect(() => {
    if (result || submitting) return

    const handleBlur = () => {
      setFocusLostCount(prev => {
        const newCount = prev + 1
        if (newCount <= 3) {
          toast.error(`Peringatan Keras: Jangan keluar dari tab ujian! (${newCount}/3 pelanggaran)`, {
            icon: '',
            duration: 4000
          })
        }
        return newCount
      })
    }

    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [result, submitting])

  const questions = quiz?.questions || []
  const timerRef = useRef(null)

  // Initialize timer and localStorage restoration
  useEffect(() => {
    if (quiz && timeLeft === null) {
      const savedTime = localStorage.getItem(`quiz_timer_${slug}`)
      if (savedTime && !result) {
        setTimeLeft(parseInt(savedTime))
      } else {
        setTimeLeft(quiz.timeLimit || 3600)
      }
    }
  }, [quiz, slug, result])

  // Sync answers to localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0 && !result) {
      localStorage.setItem(`quiz_answers_${slug}`, JSON.stringify(answers))
    }
  }, [answers, slug, result])

  // Sync timer to localStorage
  useEffect(() => {
    if (timeLeft !== null && !result && !submitting) {
      localStorage.setItem(`quiz_timer_${slug}`, timeLeft.toString())
    }
  }, [timeLeft, slug, result, submitting])

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !result) {
      const answeredCount = Object.keys(answers).length
      if (answeredCount < questions.length) {
        if (!confirm(`Kamu baru menjawab ${answeredCount} dari ${questions.length} soal. Yakin ingin mengumpulkan?`)) return
      }
    }

    setSubmitting(true)
    try {
      if (!quiz?.id) throw new Error('Quiz ID is missing')
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] !== undefined ? q.options[answers[q.id]]?.id : null
      }))

      const response = await api.post(`/quizzes/${quiz.id}/attempt`, { 
        answers: formattedAnswers,
        timeSpent: (quiz.timeLimit || 3600) - (timeLeft || 0),
        startToken,
        focusLostCount
      })

      const data = response.data
      setResult({
        score: data.percentage,
        correct: data.score,
        total: data.totalScore,
        passed: data.isPassed,
        details: data.answers.map(ans => ({
          questionId: ans.questionId,
          isCorrect: ans.isCorrect,
          correctAnswerId: ans.correctAnswerId
        }))
      })

      // Clear persistence on success
      localStorage.removeItem(`quiz_answers_${slug}`)
      localStorage.removeItem(`quiz_timer_${slug}`)

      if (data.xpEarned > 0) {
        toast.success(`Selamat! Kamu mendapatkan +${data.xpEarned} XP!`)
      }
    } catch (err) {
      console.error('Quiz submission error:', err)
      const errorMsg = err.response?.data?.error || 'Gagal mengumpulkan kuis. Silakan coba lagi.'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRef = useRef(handleSubmit)
  handleSubmitRef.current = handleSubmit

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result || submitting) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmitRef.current(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [result, submitting, timeLeft === null])

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelect = (qId, optionIdx) => {
    if (result) return
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <AlertTriangle size={64} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-2xl font-bold mb-2">Kuis Tidak Ditemukan</h1>
        <button onClick={() => navigate('/portal')} className="btn-primary">Kembali</button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center" style={{ background: 'var(--edu-cream)' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--edu-navy)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center" style={{ background: 'var(--edu-cream)' }}>
        <AlertTriangle size={64} className="mx-auto mb-4" style={{ color: '#C4BFB9' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--edu-text)' }}>Kuis Tidak Tersedia</h1>
        <p className="mb-6" style={{ color: 'var(--edu-muted)' }}>Soal untuk kuis ini belum dibuat atau sedang diperbarui.</p>
        <button onClick={() => navigate(-1)} className="btn-outline">Kembali</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: 'var(--edu-cream)' }}>
      {/* Quiz Header Bar (Sticky) */}
      <div className="fixed top-16 left-0 right-0 z-40 glass border-b shadow-sm" style={{ borderBottomColor: 'rgba(255,255,255,0.2)' }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h1 className="font-bold text-lg truncate" style={{ color: 'var(--edu-text)' }}>{quiz.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--edu-cream-dark)', color: 'var(--edu-muted)' }}>
                {Object.keys(answers).length}/{questions.length} Dijawab
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Timer */}
            {!result && timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-bold transition-all duration-300 ${
                timeLeft < 300 
                  ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' 
                  : 'text-slate-700 border-slate-200 bg-white/50'
              }`}>
                <Clock size={16} />
                <span className="tabular-nums font-mono text-sm">{formatTime(timeLeft)}</span>
              </div>
            )}
            
            {/* Submit btn */}
            {!result && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-primary py-2 px-5 text-sm shadow-navy"
                style={{ backgroundColor: 'var(--edu-navy)' }}
              >
                {submitting ? 'Memproses...' : 'Kumpulkan'}
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar - Performance Optimized */}
        <div className="h-1.5 w-full bg-black/5 overflow-hidden">
          <motion.div 
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            style={{ background: 'linear-gradient(90deg, var(--edu-navy), var(--edu-red))' }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-24">
        
        {/* Results Screen */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-10 p-8 md:p-12 glass rounded-[2.5rem] text-center shadow-xl border-white"
            >
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner"
                style={{ background: result.passed ? '#EAFAF1' : '#FDECEA' }}>
                {result.passed ? (
                  <CheckCircle2 size={48} style={{ color: '#1E8449' }} />
                ) : (
                  <XCircle size={48} style={{ color: 'var(--edu-red)' }} />
                )}
              </div>
              
              <h2 className="text-4xl font-bold mb-3 tracking-tight" style={{ color: 'var(--edu-text)' }}>
                {result.passed ? 'Luar biasa!' : 'Coba lagi yuk!'}
              </h2>
              <p className="font-medium text-lg mb-8" style={{ color: 'var(--edu-muted)' }}>
                Kamu menjawab <span className="text-blue-600 font-bold">{result.correct}</span> dari {result.total} pertanyaan dengan benar.
              </p>

              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 blur-3xl opacity-20 bg-blue-500 rounded-full"></div>
                <div className="relative p-8 rounded-3xl bg-white/80 border border-white shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Total Skor</div>
                  <div className="text-7xl font-black tracking-tighter" 
                    style={{ color: result.score >= 80 ? '#1E8449' : result.score >= 60 ? '#D4A017' : 'var(--edu-red)' }}>
                    {result.score}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => window.location.reload()} className="btn-outline px-8 border-slate-200">
                  <RefreshCw size={18} /> Ulangi Kuis
                </button>
                <button onClick={() => navigate('/portal')} className="btn-navy px-8">
                  <BookOpen size={18} /> Eksplor Materi Lain
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions List */}
        <div className="space-y-8">
          {questions.map((q, qIndex) => {
            if (!q || !q.id) return null
            const isAnswered = answers[q.id] !== undefined
            const resDetail = result?.details?.find(d => d && d.questionId === q.id)
            
            const safeOptions = Array.isArray(q.options) ? q.options : []
            
            // Determine correctly which option is the correct one
            const actualCorrectOptIdx = resDetail 
              ? safeOptions.findIndex(opt => opt && opt.id === resDetail.correctAnswerId)
              : safeOptions.findIndex(opt => opt && opt.isCorrect)
            
            return (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                className={`group relative p-8 md:p-10 bg-white rounded-[2rem] border transition-all duration-300 ${
                  resDetail 
                    ? resDetail.isCorrect ? 'border-green-200 shadow-green-50 shadow-lg' : 'border-red-200 shadow-red-50 shadow-lg'
                    : isAnswered ? 'border-blue-100 shadow-blue-50 shadow-md' : 'border-slate-100 shadow-sm'
                }`}
              >
                {/* Floating Index Tag */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  {qIndex + 1}
                </div>

                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: 'var(--edu-text)' }}>
                    {formatScientific(q.content)}
                  </h3>
                </div>

                <div className="grid gap-3">
                  {safeOptions.map((opt, optIndex) => {
                    const isSelected = answers[q.id] === optIndex
                    const isCorrect = optIndex === actualCorrectOptIdx
                    
                    let btnStyle = { 
                      borderColor: 'rgba(226, 221, 216, 0.5)', 
                      backgroundColor: '#F8F9FA',
                      color: 'var(--edu-text)' 
                    }

                    if (result) {
                      if (isCorrect) {
                        btnStyle = { borderColor: '#1E8449', backgroundColor: '#EAFAF1', color: '#1E8449' }
                      } else if (isSelected) {
                        btnStyle = { borderColor: '#F4C0BB', backgroundColor: '#FDECEA', color: 'var(--edu-red)' }
                      } else {
                        btnStyle = { borderColor: 'transparent', backgroundColor: 'transparent', color: 'var(--edu-muted)', opacity: 0.5 }
                      }
                    } else if (isSelected) {
                      btnStyle = { borderColor: 'var(--edu-navy)', backgroundColor: '#E3EEFF', color: 'var(--edu-navy)' }
                    }

                    return (
                      <motion.button
                        key={optIndex}
                        whileHover={!result ? { scale: 1.01, x: 5 } : {}}
                        whileTap={!result ? { scale: 0.99 } : {}}
                        disabled={result !== null}
                        onClick={() => handleSelect(q.id, optIndex)}
                        className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                          isSelected && !result ? 'shadow-md shadow-blue-100' : ''
                        } ${result && isCorrect ? 'font-bold' : ''}`}
                        style={btnStyle}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-bold border transition-colors ${
                            isSelected 
                              ? result 
                                ? isCorrect ? 'bg-green-600 border-green-600 text-white' : 'bg-red-600 border-red-600 text-white'
                                : 'bg-blue-600 border-blue-600 text-white' 
                              : result && isCorrect
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {['A', 'B', 'C', 'D', 'E'][optIndex]}
                          </span>
                          <span className="text-base md:text-lg">
                            {typeof opt === 'object' ? formatScientific(opt.content || 'Pilihan ini kosong') : formatScientific(opt)}
                          </span>
                        </div>
                        
                        {result && isSelected && (
                          isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
                        )}
                        {result && !isSelected && isCorrect && (
                          <CheckCircle2 size={20} className="animate-pulse" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>



      </div>
    </div>
  )
}
