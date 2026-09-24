import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'
import { ArrowLeft, Clock, Eye, CheckCircle, ChevronRight, BookOpen, Video, BookMarked, MessageSquare, ArrowRight, Info, Lightbulb, AlertTriangle, List } from 'lucide-react'
import Markdown from 'react-markdown'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatScientific } from '../utils/scientific'
import CommentSection from '../components/CommentSection'
import PDFViewer from '../components/PDFViewer'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'

export default function MaterialDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showPDF, setShowPDF] = useState(false)
  const [reachedBottom, setReachedBottom] = useState(false)

  // useQuery for intelligent caching
  const { data: material, isLoading, isError } = useQuery({
    queryKey: ['material', slug],
    queryFn: async () => {
      const res = await api.get(`/materials/${slug}`)
      return res.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Identify if material is already completed
  const isCompleted = useMemo(() => {
    return material?.progress?.[0]?.isCompleted || false
  }, [material])

  // Mark Complete Mutation
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/portal/progress/${material.id}`, { progress: 100, isCompleted: true })
    },
    onSuccess: () => {
      toast.success('Luar biasa! Materi ini telah diselesaikan.')
      queryClient.invalidateQueries(['material', slug])
      queryClient.invalidateQueries(['user-progress'])
    },
    onError: () => toast.error('Gagal menyimpan progres')
  })

  // Mark Complete Mutation Status
  const markingLoading = markCompleteMutation.isPending;

  // High-performance scroll tracking
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Track if user reached near the end for next action button
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.9 && !reachedBottom) setReachedBottom(true)
    else if (latest <= 0.9 && reachedBottom) setReachedBottom(false)
  })

  const markComplete = () => {
    if (!user) return toast.error('Silakan masuk untuk menyimpan progres')
    if (isCompleted || markCompleteMutation.isPending) return
    if (!material?.id) return toast.error('Data materi tidak valid')
    markCompleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="w-40 h-5 skeleton mb-10" />
          <div className="flex gap-3 mb-6">
            <div className="w-20 h-6 skeleton rounded-lg" />
            <div className="w-32 h-6 skeleton rounded-lg" />
          </div>
          <div className="h-16 w-full skeleton mb-8 rounded-2xl" />
          <div className="h-6 w-2/3 skeleton mb-12" />
          <div className="flex gap-4 items-center mb-16 pt-8 border-t border-slate-100">
            <div className="w-12 h-12 skeleton rounded-full" />
            <div className="space-y-2">
              <div className="w-24 h-4 skeleton" />
              <div className="w-16 h-3 skeleton" />
            </div>
          </div>
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-4 skeleton w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !material) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center" style={{ background: 'var(--edu-cream)' }}>
        <BookOpen size={64} className="mx-auto mb-4" style={{ color: '#C4BFB9' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--edu-text)' }}>Materi Tidak Ditemukan</h1>
        <p className="mb-6" style={{ color: 'var(--edu-muted)' }}>Mungkin tautan rusak atau materi telah dihapus.</p>
        <Link to="/portal" className="btn-primary">Kembali ke Portal</Link>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{material.title} | Pancasila Edu</title>
        <meta name="description" content={material.description || `Pelajari ${material.title} di Pancasila Edu.`} />
        <meta property="og:title" content={`${material.title} - Pancasila Edu`} />
        <meta property="og:description" content={material.description} />
        {material.coverImage && <meta property="og:image" content={material.coverImage} />}
      </Helmet>
      {/* Scroll Progress Bar - High-End Aesthetic */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-[1000] origin-[0%] pointer-events-none"
        style={{ 
          scaleX,
          background: 'linear-gradient(90deg, #C0392B, #E74C3C, #F39C12)',
          boxShadow: '0 2px 10px rgba(192,57,43,0.2)'
        }}
      />

      <div className="min-h-screen pb-24" style={{ background: 'var(--edu-cream)' }}>
        {/* Article Header */}
        <div className="pt-28 md:pt-36 pb-12 bg-white border-b" style={{ borderColor: 'var(--edu-border)' }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-0">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-8 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black transition-all"
            >
              <ArrowLeft size={16} /> Kembali
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest"
                style={{ background: '#E3EEFF', color: 'var(--edu-navy)' }}>
                {material.category?.name || 'Umum'}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--edu-muted)' }}>
                <Clock size={14} /> ± {Math.ceil((material.content?.length || 0) / 1000)} menit baca
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--edu-text)', lineHeight: 1.25 }}>
              {formatScientific(material.title)}
            </h1>

            {material.description && (
              <p className="text-lg mb-6" style={{ color: 'var(--edu-muted)' }}>
                {material.description}
              </p>
            )}

            <div className="flex items-center gap-3 pt-6 border-t" style={{ borderColor: 'var(--edu-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--edu-red), #E74C3C)' }}>
                ITB
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--edu-text)' }}>Tim Tutor ITB</div>
                <div className="text-xs" style={{ color: 'var(--edu-muted)' }}>
                  <Eye size={12} className="inline mr-1" />
                  {material.viewCount || 0} kali dibaca
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-6 lg:px-0 py-12">
          {/* Multimedia Content */}
          <AnimatePresence>
            {material.type === 'VIDEO' && material.videoUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white"
              >
                <iframe 
                  src={material.videoUrl.replace('watch?v=', 'embed/')} 
                  className="w-full h-full"
                  allowFullScreen
                />
              </motion.div>
            )}

            {material.type === 'BOOK' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 relative overflow-hidden rounded-[2rem] border border-slate-200 group"
              >
                {/* Background: Fine Linen Texture */}
                <div className="absolute inset-0 bg-[#FBF9F6]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                }} />
                
                {/* Minimalist Accents */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-slate-900" />
                
                <div className="relative z-10 px-8 py-10 md:px-14 md:py-14 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* Artistic Book Icon */}
                    <div className="relative">
                      <div className="w-24 h-32 bg-white rounded-r-md shadow-[15px_15px_35px_-10px_rgba(0,0,0,0.15)] flex items-center justify-center border border-slate-100 transition-transform group-hover:rotate-[-2deg] duration-700">
                         <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-slate-100" />
                         <BookOpen size={44} strokeWidth={1.5} className="text-slate-800" />
                      </div>
                      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-50">
                        <CheckCircle size={24} className="text-emerald-500" />
                      </div>
                    </div>

                    <div className="text-center md:text-left decoration-slate-200">
                      <div className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                        Arsip Terverifikasi
                      </div>
                      <h4 className="text-4xl font-serif font-black text-slate-900 mb-4 tracking-tight italic">
                        Pustaka Digital Siswa
                      </h4>
                      <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
                        Akses modul literasi lengkap melalui sistem pembaca dokumen terintegrasi kami.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowPDF(true)}
                    className="group/btn relative px-12 py-5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all hover:bg-black hover:shadow-2xl active:scale-95 flex items-center gap-4"
                  >
                    <span>Baca Sekarang</span>
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Markdown Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-edu max-w-none"
          >
            <Markdown
              components={{
                blockquote: ({ children }) => {
                  const text = children?.[1]?.props?.children?.[0] || '';
                  let type = 'note';
                  let icon = <Info size={16} />;
                  let label = 'Catatan';
                  
                  if (text.startsWith('[TIP]')) {
                    type = 'tip'; icon = <Lightbulb size={16} />; label = 'Tips Belajar';
                  } else if (text.startsWith('[WARNING]')) {
                    type = 'warning'; icon = <AlertTriangle size={16} />; label = 'Penting';
                  }

                  return (
                    <div className={`edu-callout edu-callout-${type}`}>
                      <div className="edu-callout-title">
                        {icon} {label}
                      </div>
                      <div className="text-slate-700 font-medium leading-relaxed">
                        {children[1].props.children.map(c => typeof c === 'string' ? c.replace(/^\[(TIP|WARNING|NOTE)\]\s*/, '') : c)}
                      </div>
                    </div>
                  );
                },
                img: ({ src, alt }) => (
                  <div className="my-10">
                    <img src={src} alt={alt} className="rounded-3xl shadow-xl border-4 border-white w-full" />
                    {alt && <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">{alt}</p>}
                  </div>
                )
              }}
            >
              {formatScientific(material.content)}
            </Markdown>
          </motion.div>

          {/* Completion Section */}
          <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold mb-2 text-slate-800">
              {isCompleted ? 'Materi Selesai!' : 'Selesai membaca?'}
            </h3>
            <p className="mb-8 text-slate-500">
              {isCompleted 
                ? 'Kamu telah menyelesaikan materi ini dan mendapatkan 50 XP!' 
                : 'Tandai materi ini sebagai selesai untuk mencatat progres belajarmu dan dapatkan **50 XP**!'}
            </p>
            
            <button 
              onClick={markComplete}
              disabled={isCompleted || markingLoading}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-600 shadow-green-100 cursor-default' 
                  : markingLoading 
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-navy-900 shadow-xl shadow-navy-200 hover:-translate-y-1'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle size={20} /> Materi Sudah Diselesaikan
                </>
              ) : markingLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle size={20} /> Tandai Selesai & Klaim XP
                </>
              )}
            </button>
          </div>

          {/* Discussion Section */}
          <CommentSection 
            materialId={material.id} 
            initialComments={material.comments || []}
          />
        </article>

        {/* Floating next action */}
        {reachedBottom && material.category?.quizzes?.[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60]"
          >
            <Link 
              to={`/quiz-play/${material.category.quizzes[0].slug}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 shadow-xl hover:-translate-y-1 transition-transform"
              style={{ borderColor: 'var(--edu-red)' }}
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--edu-red)' }}>Uji Pemahaman</div>
                <div className="text-sm font-bold text-black">Mulai Kuis {material.category.name}</div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: 'var(--edu-red)' }}>
                <ChevronRight size={20} />
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showPDF && (
          <PDFViewer 
            url={material.fileUrl || material.driveUrl} 
            title={material.title} 
            onClose={() => setShowPDF(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}
