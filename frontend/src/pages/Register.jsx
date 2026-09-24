import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const BENEFITS = [
  'Akses semua materi dan kuis tanpa biaya',
  'Lacak progres belajar secara otomatis',
  'Raih pencapaian dan naik di papan peringkat',
  'Konten diperbarui setiap bulan oleh tutor ITB',
]

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError(false)
    if (!name || !email || !password || !confirm) return toast.error('Lengkapi semua field terlebih dahulu')
    if (password !== confirm) return toast.error('Konfirmasi password tidak cocok')
    
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Akun berhasil dibuat! Selamat belajar.')
      
      // Attempt standard navigation
      navigate('/dashboard')
      
      // Force fallback if still stuck after 1s
      setTimeout(() => {
        if (window.location.pathname === '/register') {
          window.location.href = '/dashboard'
        }
      }, 800)
    } catch (err) {
      setError(true)
      console.error('Registration Error:', err)
      toast.error(err.response?.data?.error || 'Gagal membuat akun. Cek koneksi internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--edu-cream)' }}>
      {/* Background patterns - Full Screen Restored for User Preference */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--edu-navy) 1px, transparent 1px), linear-gradient(90deg, var(--edu-navy) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        willChange: 'transform, opacity'
      }} />
      
      {/* Radial warm glow from center - Identical to Home Hero */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(212,160,23,0.06) 0%, transparent 65%)'
      }} />

      {/* Centered Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row">
        {/* Left Branding Panel */}
        <div 
          className="hidden lg:flex lg:w-5/12 flex-col justify-between p-16 contain-layout"
          style={{ width: '41.666667%', minWidth: '400px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ 
              transform: 'translate3d(0,0,0)', 
              willChange: 'transform, opacity',
            }}
            className="flex flex-col h-full justify-center gap-16 overflow-visible"
          >
            <div className="relative">
              <Link to="/" className="flex items-center gap-4 group w-fit">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-3"
                >
                  <img src="/itb.png" alt="ITB Logo" className="h-10 w-auto" style={{ imageRendering: 'auto' }} />
                  <div className="w-px h-6 bg-slate-100" />
                  <img src="/garuda.svg" alt="Garuda Logo" className="h-10 w-auto" style={{ imageRendering: 'auto' }} />
                </motion.div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-xl tracking-tight uppercase" style={{ color: 'var(--edu-navy)' }}>Pancasila</span>
                  <span className="text-xs font-bold tracking-widest opacity-60" style={{ color: 'var(--edu-red)' }}>PORTAL EDUKASI</span>
                </div>
              </Link>
            </div>

            <div className="max-w-sm">
              <h2 
                className="text-4xl md:text-5xl font-black leading-tight mb-10 tracking-tighter" 
                style={{ color: 'var(--edu-navy)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                Mulai Petualangan<br />
                <span style={{ color: 'var(--edu-red)' }}>Intelektualmu</span> di Sini.
              </h2>
              
              <ul className="space-y-6">
                {BENEFITS.map((b) => (
                  <li 
                    key={b}
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:bg-white border border-transparent hover:border-slate-100 group"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: '#FEF8E7' }}>
                      <CheckCircle size={18} style={{ color: 'var(--edu-gold)' }} />
                    </div>
                    <span className="text-base font-bold leading-relaxed" style={{ color: 'var(--edu-text)' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[10px] font-bold tracking-widest opacity-20 uppercase">
              Kolaborasi Tapak Liman ITB · 2026
            </div>
          </motion.div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 15, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full max-w-md py-12"
            style={{ transform: 'translate3d(0,0,0)', willChange: 'transform, opacity' }}
          >
            {/* Mobile Header Overlay */}
            <div className="lg:hidden mb-12 text-center flex flex-col items-center">
              <img src="/garuda.svg" alt="Logo" className="h-14 w-auto mb-4" />
              <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: 'var(--edu-navy)' }}>Pancasila Edu</h1>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--edu-navy)' }}>Buat Akun</h2>
              <p className="text-lg font-medium" style={{ color: 'var(--edu-muted)' }}>Mulai petualanganmu hari ini.</p>
            </div>

            <motion.form 
              onSubmit={handle} 
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--edu-navy)' }}>Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--edu-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    className={`input-edu pl-12 ${error ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--edu-navy)' }}>Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--edu-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={`input-edu pl-12 ${error ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--edu-navy)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--edu-muted)' }} />
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={`input-edu pl-12 pr-12 ${error ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-red-700"
                    style={{ color: 'var(--edu-muted)' }}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] font-bold mt-1.5 ml-1 opacity-60 uppercase tracking-widest" style={{ color: 'var(--edu-navy)' }}>
                  WAJIB: 8+ Karakter, Huruf Besar/Kecil, Angka & Simbol (!@#$)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--edu-navy)' }}>Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--edu-muted)' }} />
                  <input
                    type={show ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    className={`input-edu pl-12 ${error ? 'border-red-500 bg-red-50' : ''}`}
                    required
                  />
                </div>
                {confirm && password !== confirm && (
                  <p className="text-[10px] font-bold mt-1.5 ml-1" style={{ color: 'var(--edu-red)' }}>
                    PASSWORD TIDAK COCOK
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-white transition-all duration-200 flex items-center justify-center gap-3 hover:-translate-y-0.5"
                  style={{ background: 'var(--edu-navy)', boxShadow: 'var(--shadow-navy)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Daftar Sekarang <ArrowRight size={20} /></>
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="font-bold text-sm" style={{ color: 'var(--edu-muted)' }}>
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-red-600 hover:underline underline-offset-4 decoration-2">
                    Masuk
                  </Link>
                </p>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
