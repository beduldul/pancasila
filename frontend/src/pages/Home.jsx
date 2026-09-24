import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, Brain, Trophy, Globe, Heart, Shield, Users, Star, ChevronDown } from 'lucide-react'
import api from '../utils/api'


export default function Home() {
  const navigate = useNavigate()

  const [stats, setStats] = useState([
    { label: 'Pelajar Terdaftar', value: '—', icon: Users },
    { label: 'Materi Dipublikasi', value: '—', icon: BookOpen },
    { label: 'Kuis Tersedia', value: '—', icon: Brain },
    { label: 'Latihan Dikerjakan', value: '—', icon: Star },
  ])

  useEffect(() => {
    api.get('/portal/public-stats')
      .then(res => {
        const d = res.data
        const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K+' : String(n)
        setStats([
          { label: 'Pelajar Terdaftar', value: fmt(d.totalUsers), icon: Users },
          { label: 'Materi Dipublikasi', value: fmt(d.totalMaterials), icon: BookOpen },
          { label: 'Kuis Tersedia', value: fmt(d.totalQuizzes), icon: Brain },
          { label: 'Latihan Dikerjakan', value: fmt(d.totalAttempts), icon: Star },
        ])
      })
      .catch(() => {
        // Keep dashes on error — jujur, bukan data palsu
      })
  }, [])

  return (
    <div className="overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'var(--edu-cream)' }}
      >
        {/* Interactive Mesh Background - Hidden on Mobile for Performance */}
        <div className="interactive-mesh hidden md:block" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 md:pt-32 pb-16 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-10 md:mb-12"
          >
            <div className="relative group">
              <img src="/garuda.svg" alt="Garuda Pancasila" className="h-20 md:h-24 w-auto relative z-10 garuda-pulse" loading="eager" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-3"
            style={{ color: 'var(--edu-gold)' }}
          >
            <span className="w-8 md:w-12 h-px bg-current opacity-20" />
            Kolaborasi Tapak Liman ITB · 2026
            <span className="w-8 md:w-12 h-px bg-current opacity-20" />
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.5rem] font-black tracking-tight mb-8"
            style={{ color: 'var(--edu-navy)', lineHeight: 1.0, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Belajar Bersama
            <br />
            <span className="gradient-text-red">
              untuk Indonesia.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-base md:text-lg max-w-2xl mx-auto mb-12 font-medium leading-relaxed text-slate-500 px-4 md:px-0"
          >
            Portal bimbingan belajar gratis standar mahasiswa ITB untuk <span className="text-slate-900 font-bold underline decoration-red-500/20">Sekolah Menengah Pertama</span> di seluruh pelosok Nusantara.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center px-6 sm:px-0"
          >
            <Link
              to="/portal"
              className="group relative flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-white text-base md:text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-1 overflow-hidden"
              style={{ background: 'var(--edu-red)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Mulai Belajar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/leaderboard"
              className="group flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-base md:text-lg transition-all duration-300 border-2 bg-white/40 backdrop-blur-md hover:bg-white hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor: 'var(--edu-border)', color: 'var(--edu-navy)' }}
            >
              <Trophy size={18} style={{ color: 'var(--edu-gold)' }} />
              Peringkat Nasional
            </Link>
          </motion.div>
        </div>

        {/* Soft fade-to-cream at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--edu-cream) 90%)' }} />

        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 opacity-30">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== — same cream background, no border, feels continuous */}
      <section className="py-20" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                className="relative group rounded-3xl p-7 overflow-hidden border"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                <div className="absolute top-5 right-5 opacity-[0.07] group-hover:opacity-[0.13] transition-opacity">
                  <stat.icon size={36} style={{ color: 'var(--edu-red)' }} />
                </div>
                <div className="text-4xl md:text-5xl font-black mb-1 tracking-tight"
                  style={{ color: 'var(--edu-navy)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: 'var(--edu-red)', opacity: 0.7 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-28" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="section-label mb-3">Visi & Misi</p>
            <h2 className="section-title">
              Pendidikan untuk Semua<br />
              <span style={{ color: 'var(--edu-red)' }}>Membangun Karakter Bangsa</span>
            </h2>
            <p className="section-desc mx-auto">
              Kami percaya tidak ada seorang pun yang harus tertinggal karena keterbatasan akses terhadap bimbingan belajar berkualitas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Akses Universal',
                desc: 'Tersedia 24/7 dari mana saja. Tidak ada biaya, tidak ada syarat — cukup semangat untuk belajar.',
                accent: 'var(--edu-navy)',
                bg: '#E3EEFF',
              },
              {
                icon: Heart,
                title: 'Gratis & Inklusif',
                desc: 'Wujud nyata sila ke-5 Pancasila: Keadilan Sosial bagi Seluruh Rakyat Indonesia dalam bidang pendidikan.',
                accent: 'var(--edu-red)',
                bg: '#FDECEA',
              },
              {
                icon: Shield,
                title: 'Konten Terpercaya',
                desc: 'Dibuat dan dikurasi langsung oleh tutor berpengalaman dari Institut Teknologi Bandung.',
                accent: '#1E8449',
                bg: '#EAFAF1',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ willChange: 'opacity, transform' }}
                className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl overflow-hidden"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: item.bg }}>
                  <item.icon size={26} style={{ color: item.accent }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--edu-text)' }}>{item.title}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--edu-muted)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUIZ LEVELS ===== */}
      <section className="py-28" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="section-label mb-3">Kurikulum Unggulan</p>
            <h2 className="section-title">Uji Kompetensi,<br /><span style={{ color: 'var(--edu-navy)' }}>Asah Intelegensi</span></h2>
            <p className="section-desc mx-auto">
              Soal-soal dirancang sesuai kurikulum nasional dan disesuaikan dengan tingkat usia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                range: '4-7',
                title: 'Kelas 7',
                desc: 'Sekolah Menengah Pertama Awal',
                topics: ['Matematika Dasar', 'Sains', 'Pancasila Dasar'],
                color: '#1E8449',
                bg: '#EAFAF1',
                accent: 'Bangun fondasi karakter dan pengetahuan sejak dini.',
              },
              {
                range: '8',
                title: 'Kelas 8',
                desc: 'Sekolah Menengah Pertama Menengah',
                topics: ['Aljabar', 'IPA Terpadu', 'PPKn'],
                color: '#9B7210',
                bg: '#FEF8E7',
                accent: 'Perdalam pemahaman konsep dan kembangkan nalar analitis.',
              },
              {
                range: '9',
                title: 'Kelas 9',
                desc: 'Sekolah Menengah Pertama Lanjutan',
                topics: ['Geometri', 'Fisika Dasar', 'Persiapan Ujian'],
                color: '#DC2626',
                bg: '#FDECEA',
                accent: 'Persiapkan diri untuk tantangan akademis yang lebih tinggi.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ willChange: 'opacity, transform' }}
                onClick={() => navigate(`/quiz/range/${item.range}`)}
                className="group relative flex flex-col rounded-[2.5rem] bg-white border-2 p-10 cursor-pointer hover:shadow-xl h-full overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-2" style={{ background: item.color }} />

                <div className="mb-8">
                  <span className="inline-flex px-4 py-1.5 rounded-full text-xs font-bold mb-4"
                    style={{ background: item.bg, color: item.color }}>
                    {item.desc}
                  </span>
                  <h3 className="text-3xl font-black mb-2" style={{ color: 'var(--edu-text)' }}>{item.title}</h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--edu-muted)' }}>{item.accent}</p>
                </div>

                <div className="flex flex-wrap items-start gap-2.5 mb-10">
                  {item.topics.map(t => (
                    <span key={t} className="px-4 py-2 rounded-2xl text-xs font-bold"
                      style={{ background: item.bg, color: item.color }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-base font-bold" style={{ color: item.color }}>Lihat Tantangan</span>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: item.color }}>
                    <ArrowRight size={22} className="text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOOKS PREVIEW ===== */}
      <section className="py-28" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 mb-14"
          >
            <div>
              <p className="section-label mb-2">Perpustakaan Digital</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--edu-text)' }}>
                Koleksi buku<br />untuk semua bidang
              </h2>
            </div>
            <Link
              to="/books"
              className="btn-outline flex-shrink-0"
            >
              Lihat Semua Buku <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { cat: 'Matematika', emoji: '', count: 12, color: 'var(--edu-navy)', bg: '#E3EEFF' },
              { cat: 'Fisika', emoji: '', count: 8, color: '#9B7210', bg: '#FEF8E7' },
              { cat: 'Kimia', emoji: '', count: 10, color: '#1E8449', bg: '#EAFAF1' },
              { cat: 'Biologi', emoji: '', count: 9, color: 'var(--edu-red)', bg: '#FDECEA' },
            ].map((item, i) => (
              <motion.div
                key={item.cat}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ willChange: 'opacity, transform' }}
                className="group p-7 rounded-[2rem] bg-white border hover:shadow-xl cursor-pointer"
                onClick={() => navigate('/books')}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 transition-transform group-hover:scale-110"
                  style={{ background: item.bg }}>
                  {item.emoji}
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--edu-text)' }}>{item.cat}</h3>
                <p className="text-sm font-medium" style={{ color: item.color }}>{item.count} buku tersedia</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28" style={{ background: 'var(--edu-navy)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <img
              src="/garuda.svg"
              alt="Garuda"
              className="h-16 w-auto mx-auto mb-10 opacity-30 grayscale brightness-200"
              loading="lazy"
            />
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-white" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', lineHeight: 1.1 }}>
              Wujudkan Generasi Pelajar Sekolah Menengah Pertama<br />Berprestasi & Berpancasila
            </h2>
            <p className="text-xl mb-12" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Mari melangkah bersama untuk masa depan pendidikan Indonesia yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-10 py-5 rounded-2xl font-black text-white text-xl transition-all duration-200 hover:-translate-y-1"
                style={{ background: 'var(--edu-red)', boxShadow: '0 10px 40px -10px rgba(161,19,19,0.5)' }}
              >
                Gabung Sekarang <ArrowRight className="inline ml-1" size={24} />
              </Link>
              <Link
                to="/portal"
                className="px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-200 border-2"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Eksplorasi Materi
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
