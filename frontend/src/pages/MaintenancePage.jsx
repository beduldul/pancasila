import { useState, useEffect } from 'react'
import { Wrench, Clock } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

export default function MaintenancePage({ message }) {
  const [logoClicks, setLogoClicks] = useState(0)

  const handleAdminBypass = () => {
    // Clear student token and session so they can clean log in as Admin!
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  // Listen for Ctrl+Shift+A secret key combination to bypass directly to login
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Trigger on Ctrl + Shift + A OR Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        handleAdminBypass()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1
    setLogoClicks(nextClicks)
    
    if (nextClicks >= 5) {
      handleAdminBypass()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans" style={{ background: 'var(--edu-cream)' }}>
      <Helmet>
        <title>Pemeliharaan Sistem | Pancasila Edu</title>
      </Helmet>

      {/* Grid Pattern matching the rest of the application */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--edu-navy) 1px, transparent 1px), linear-gradient(90deg, var(--edu-navy) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.04) 0%, transparent 70%)'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        {/* Kartu putih */}
        <div 
          className="bg-white rounded-[2.5rem] p-10 sm:p-12 border shadow-lg text-center"
          style={{ 
            borderColor: 'var(--edu-border)', 
            boxShadow: '0 20px 50px rgba(30, 41, 59, 0.04)' 
          }}
        >
          {/* Logo Branding - Clickable Secret Gate */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 justify-center mb-8 cursor-pointer select-none active:scale-[0.98] transition-transform"
            title="Pancasila Portal Edukasi"
          >
            <img src="/garuda.svg" alt="Garuda Logo" className="h-9 w-auto" style={{ pointerEvents: 'none' }} />
            <div className="flex flex-col text-left">
              <span className="font-black text-base tracking-tight uppercase" style={{ color: 'var(--edu-navy)' }}>Pancasila</span>
              <span className="text-[9px] font-bold tracking-widest opacity-60 uppercase" style={{ color: 'var(--edu-red)' }}>PORTAL EDUKASI</span>
            </div>
          </div>

          {/* Icon Circle */}
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
            <Wrench size={36} className="animate-pulse" />
          </div>

          <div className="space-y-4 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-amber-100 text-amber-800">
              Pemeliharaan Sistem
            </span>
            <h1 
              className="text-3xl sm:text-4xl font-black tracking-tight leading-none"
              style={{ color: 'var(--edu-navy)' }}
            >
              Portal Sedang <span style={{ color: 'var(--edu-red)' }}>Diperbarui</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-md mx-auto">
              Kami sedang melakukan peningkatan rutin untuk menghadirkan fitur-fitur baru dan pengalaman belajar yang lebih mulus untuk Anda.
            </p>
          </div>

          {/* Admin Custom Message Block */}
          {message && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock size={12} />
                <span className="text-[10px] font-black uppercase tracking-wider">Pesan Dari Tim IT</span>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                "{message}"
              </p>
            </div>
          )}

          {/* Friendly Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100/50 text-[11px] font-bold text-amber-800">
            <span>Terima kasih atas kesabaranmu, Sobat Pancasila.</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
