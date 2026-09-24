import React, { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Trophy, Flame, TrendingUp, ArrowRight, Users, FileText, Award, ShieldCheck, Activity, Star, Zap, Download, Layers, Bell, CheckCircle, Wrench, Lightbulb, Bug, MessageSquare, Send, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { getLevelData, getXPProgressInLevel, getXPForNextLevel } from '../utils/levelSystem'
import toast from 'react-hot-toast'
import { StatCardSkeleton, MaterialCardSkeleton } from '../components/SkeletonLoader'

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || '/admin'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN';

  // Pin Verification State
  const [pinVerified, setPinVerified] = useState(() => {
    return sessionStorage.getItem('admin_pin_verified') === 'true';
  })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  // Quick Broadcast States
  const [broadcastTitleInput, setBroadcastTitleInput] = useState('')
  const [broadcastMsgInput, setBroadcastMsgInput] = useState('')
  const [broadcastPriorityInput, setBroadcastPriorityInput] = useState('0')
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const { data: systemConfigData, refetch: refetchConfig } = useQuery({
    queryKey: ['admin-system-config-dash'],
    queryFn: async () => {
      const res = await api.get('/admin/system-config')
      return res.data
    },
    enabled: isAdmin && pinVerified
  })

  const handleToggleBroadcast = async (active) => {
    setIsBroadcasting(true)
    try {
      const currentConfigRes = await api.get('/admin/system-config')
      const currentConfig = currentConfigRes.data

      await api.patch('/admin/system-config', {
        ...currentConfig,
        broadcastActive: active,
        broadcastTitle: active ? broadcastTitleInput || 'PENGUMUMAN PENTING' : '',
        broadcastMsg: active ? broadcastMsgInput || '' : '',
        broadcastPriority: active ? parseInt(broadcastPriorityInput) : 0
      })
      
      toast.success(active ? 'Pengumuman global berhasil disiarkan.' : 'Pengumuman global telah dihentikan.')
      refetchConfig()
    } catch {
      toast.error('Gagal memperbarui pengumuman global')
    } finally {
      setIsBroadcasting(false)
    }
  }

  const { data: adminAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/admin/analytics')
      return res.data
    },
    enabled: isAdmin && pinVerified,
    refetchInterval: 30000
  })

  const { data: adminMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics')
      return res.data
    },
    enabled: isAdmin && pinVerified,
    refetchInterval: 10000
  })
  const { data: progressRes, isLoading: loadingProgress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const res = await api.get('/portal/progress')
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: achievementsRes, isLoading: loadingAchievements } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const res = await api.get('/achievements/mine')
      return res.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const progress = progressRes || null
  const achievements = achievementsRes || []
  const loading = loadingProgress || loadingAchievements

  const [feedbackText, setFeedbackText] = useState('')
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [feedbackCategory, setFeedbackCategory] = useState('SUGGESTION')

  const { data: announcements, isLoading: loadingAnnouncementsList } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements')
      return res.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const stats = [
    {
      label: 'Level Saat Ini',
      value: `Lvl ${user?.level || 1}`,
      icon: Star,
      accent: '#9B7210',
      bg: '#FEF8E7',
    },
    {
      label: 'Total Poin XP',
      value: user?.xp || 0,
      icon: Zap,
      accent: '#7e22ce',
      bg: '#F3E8FF',
    },
    {
      label: 'Materi Selesai',
      value: progress?.materialsCompleted || 0,
      icon: BookOpen,
      accent: 'var(--edu-navy)',
      bg: 'rgba(30,64,175,0.08)',
    },
    {
      label: 'Streak Login',
      value: `${user?.loginStreak || 0} hari`,
      icon: Flame,
      accent: 'var(--edu-red)',
      bg: 'rgba(220,38,38,0.08)',
    },
  ]
  const currentLevel = user?.level || 1;
  const levelData = getLevelData(currentLevel);
  const xpProgress = getXPProgressInLevel(user?.xp || 0) || 0;
  const nextLevelXP = getXPForNextLevel(currentLevel) || 100;

  if (isAdmin) {
    if (!pinVerified) {
      const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === '170317') {
          sessionStorage.setItem('admin_pin_verified', 'true');
          setPinVerified(true);
          toast.success('Akses admin diberikan. Selamat datang kembali.');
        } else {
          setPinError(true);
          toast.error('Kode keamanan tidak valid.');
          setPinInput('');
          setTimeout(() => setPinError(false), 500);
        }
      };

      return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--edu-cream)' }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(var(--edu-navy)_1px,transparent_1px),linear-gradient(90deg,var(--edu-navy)_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/80 backdrop-blur-md rounded-[2.5rem] border text-center"
            style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex justify-center gap-3 mb-6">
              <img src="/itb.png" alt="ITB Logo" className="h-10 w-auto" />
              <div className="w-px h-8 bg-slate-200 self-center" />
              <img src="/garuda.svg" alt="Garuda Logo" className="h-10 w-auto" />
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-widest">
                ACCESS RESTRICTED
              </span>
              <h1 className="text-2xl font-black mt-3 tracking-tight" style={{ color: 'var(--edu-navy)' }}>
                Verify Operator Identity
              </h1>
              <p className="text-slate-400 font-bold text-[11px] mt-1 uppercase tracking-wider">
                Two-Factor Authorization Required
              </p>
            </div>

            <form onSubmit={handlePinSubmit}>
              <motion.div 
                animate={pinError ? { x: [-12, 12, -12, 12, 0] } : {}}
                className="flex justify-center gap-2.5 mb-8"
              >
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const char = pinInput[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${
                        char ? 'border-red-600 bg-red-50/20 text-red-600 scale-[1.03]' : 'border-slate-200 bg-white text-slate-300'
                      }`}
                    >
                      {char ? '·' : ''}
                    </div>
                  );
                })}
              </motion.div>

              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinInput(val);
                }}
                autoFocus
                className="absolute inset-0 opacity-0 cursor-default"
                style={{ caretColor: 'transparent' }}
              />

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg shadow-slate-900/10 mb-3"
              >
                Pusat kendali admin
              </button>
              <p className="text-[10px] font-bold text-slate-400">
                Use physical keyboard or keypad device to authenticate
              </p>
            </form>
          </motion.div>
        </div>
      );
    }

    const totals = adminAnalytics?.totals || { users: 0, materials: 0, quizzes: 0, attempts: 0 };
    const metrics = adminMetrics || {
      dbStatus: 'CONNECTED',
      latency: 15,
      activeSessions: 1,
      lockdownMode: false,
      cpuLoad: 0.1,
      freeMem: 1024,
      totalMem: 2048,
      uptime: 3600,
      nodeVersion: 'v18.0.0',
      osType: 'darwin',
      architecture: 'x64'
    };

    // Format Memory
    const totalMemGB = (metrics.totalMem / (1024 * 1024 * 1024)).toFixed(1);
    const freeMemGB = (metrics.freeMem / (1024 * 1024 * 1024)).toFixed(1);
    const usedMemGB = (totalMemGB - freeMemGB).toFixed(1);
    const memoryPercent = Math.round((usedMemGB / totalMemGB) * 100) || 0;

    // Format Uptime
    const formatUptime = (seconds) => {
      const d = Math.floor(seconds / (3600*24));
      const h = Math.floor((seconds % (3600*24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${d}d ${h}h ${m}m`;
    };

    return (
      <div className="min-h-screen pt-20 pb-16" style={{ background: 'var(--edu-cream)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-widest">
                  SISTEM KENDALI UTAMA
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-widest">
                  PORTAL ADMINISTRATOR
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight" style={{ color: 'var(--edu-navy)' }}>
                Halo, <span className="text-red-600">{user?.name || 'Administrator'}</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm max-w-xl">
                Kelola kurikulum, atur kuis, monitor lalu lintas keamanan, serta kendalikan status pemeliharaan sistem Pancasila Edu di satu konsol utama.
              </p>
            </div>
          </motion.div>

          {/* Quick Metrics Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Siswa Terdaftar', value: totals.users, icon: Users, accent: '#1E40AF', bg: 'rgba(30,64,175,0.06)' },
              { label: 'Modul Materi Aktif', value: totals.materials, icon: FileText, accent: '#D97706', bg: 'rgba(217,119,6,0.06)' },
              { label: 'Bank Kuis Tersedia', value: totals.quizzes, icon: Brain, accent: '#7E22CE', bg: 'rgba(126,34,206,0.06)' },
              { label: 'Uptime Server', value: formatUptime(metrics.uptime), icon: Activity, accent: '#059669', bg: 'rgba(5,150,105,0.06)' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border transition-all"
                style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.bg }}>
                  <stat.icon size={22} style={{ color: stat.accent }} />
                </div>
                <div className="text-2xl md:text-3xl font-black mb-0.5 text-slate-800">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Main Action Blocks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle: 2 Cols for Master Administrative Control Grid */}
            <div className="lg:col-span-2 space-y-6">
              
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] p-8 border"
                style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Menu Pengendalian Sistem</h2>
                    <p className="text-xs font-bold text-slate-400">Pilih modul administrasi yang ingin Anda kelola</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { to: `${ADMIN_PATH}/materials`, label: 'Modul & Materi', desc: 'Unggah, edit, & hapus modul materi', icon: BookOpen, accent: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { to: `${ADMIN_PATH}/quizzes`, label: 'Bank Soal Kuis', desc: 'Atur butir pertanyaan & durasi kuis', icon: Brain, accent: 'text-purple-600 bg-purple-50 border-purple-100' },
                    { to: `${ADMIN_PATH}/categories`, label: 'Topik & Kategori', desc: 'Kelola kategori & jenjang materi', icon: Layers, accent: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { to: `${ADMIN_PATH}/users`, label: 'Manajemen Pengguna', desc: 'Kelola peran pengguna & evict sesi', icon: Users, accent: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { to: `${ADMIN_PATH}/maintenance`, label: 'Sistem & Pengaduan', desc: 'Setelan pemeliharaan & kotak pesan', icon: Wrench, accent: 'text-orange-600 bg-orange-50 border-orange-100' },
                    { to: `${ADMIN_PATH}/logs`, label: 'Log Audit Keamanan', desc: 'Lacak riwayat IP & aktivitas sistem', icon: ShieldCheck, accent: 'text-red-600 bg-red-50 border-red-100' },
                    { to: `${ADMIN_PATH}/analytics`, label: 'Statistik & Analitik', desc: 'Laporan aktivitas kuis & materi terpopuler', icon: TrendingUp, accent: 'text-violet-600 bg-violet-50 border-violet-100' },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.to}
                      className="group flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/30 hover:border-slate-300 text-left relative overflow-hidden"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${item.accent} transition-transform group-hover:scale-105`}>
                        <item.icon size={22} />
                      </div>
                      <div className="min-w-0 pr-4">
                        <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors">{item.label}</div>
                        <div className="text-[11px] font-bold text-slate-400 leading-normal">{item.desc}</div>
                      </div>
                      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-1">
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Security Alerts / Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-[2.5rem] p-8 border"
                style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Download size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-none">Laporan & Utilitas Data</h2>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Unduh backup database atau ekspor laporan terstruktur</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get('/admin/export/users', { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a'); link.href = url;
                        link.setAttribute('download', 'users.csv'); document.body.appendChild(link);
                        link.click();
                        toast.success('Laporan siswa berhasil diunduh.');
                      } catch { toast.error('Gagal mengekspor laporan') }
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                  >
                    <Download size={14} />
                    <span>Ekspor Data Pengguna (CSV)</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right: 1 Col for Real-time Server & Telemetry Status */}
            <div className="space-y-6">
              
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-950 text-white rounded-[2.5rem] p-8 border border-slate-900 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Activity size={18} className="text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-200">Live Telemetri Server</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[9px] font-black text-emerald-400 tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE</span>
                  </div>
                </div>

                <div className="space-y-5 font-mono text-[11px] text-slate-400">
                  
                  {/* Database */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-slate-300">Prisma & Neon DB</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/30">
                      {metrics.dbStatus || 'CONNECTED'}
                    </span>
                  </div>

                  {/* Latency */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
                    <span className="font-bold text-slate-300">Latensi API</span>
                    <span className="text-[10px] font-bold text-emerald-400">{metrics.latency}ms (Sangat Cepat)</span>
                  </div>

                  {/* Active Sessions */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
                    <span className="font-bold text-slate-300">Sesi Aktif</span>
                    <span className="text-[10px] font-bold text-blue-400">{metrics.activeSessions} pengguna</span>
                  </div>

                  {/* CPU Load */}
                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-300">
                      <span>Beban Kerja CPU</span>
                      <span className="text-slate-400">{(metrics.cpuLoad * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, metrics.cpuLoad * 100)}%` }} />
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div>
                    <div className="flex justify-between font-bold mb-1 text-slate-300">
                      <span>Penggunaan RAM</span>
                      <span className="text-slate-400">{usedMemGB} / {totalMemGB} GB ({memoryPercent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${memoryPercent}%` }} />
                    </div>
                  </div>

                  {/* Hardware details */}
                  <div className="pt-4 border-t border-slate-900 space-y-2 text-[10px] text-slate-500 leading-relaxed">
                    <div className="flex justify-between">
                      <span>Node Version</span>
                      <span className="text-slate-400">{metrics.nodeVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OS Platform</span>
                      <span className="text-slate-400 uppercase">{metrics.osType} ({metrics.architecture})</span>
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* Global Broadcast Console — Quick Action Center */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-[2.5rem] p-8 border text-left"
                style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-none">Siarkan Pengumuman Global</h2>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Kirim pesan penting ke seluruh portal secara real-time</p>
                  </div>
                </div>

                {/* Current Broadcast Status Badge */}
                {systemConfigData?.broadcastActive ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 mb-6 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black text-red-600 bg-red-100/50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Siaran Aktif
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Prioritas: {systemConfigData.broadcastPriority === 2 ? 'Strategis' : systemConfigData.broadcastPriority === 1 ? 'Penting' : 'Info'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-700">{systemConfigData.broadcastTitle}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">{systemConfigData.broadcastMsg}</div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-6">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Tidak ada siaran aktif saat ini
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Judul Pengumuman</label>
                    <input
                      type="text"
                      placeholder="Contoh: PENGUMUMAN PENTING"
                      value={broadcastTitleInput}
                      onChange={(e) => setBroadcastTitleInput(e.target.value)}
                      disabled={isBroadcasting}
                      className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 outline-none text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-300 transition-all"
                    />
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Pesan / Konten</label>
                    <textarea
                      placeholder="Tulis pesan pengumuman..."
                      value={broadcastMsgInput}
                      onChange={(e) => setBroadcastMsgInput(e.target.value)}
                      disabled={isBroadcasting}
                      rows={2}
                      className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 outline-none text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-300 transition-all resize-none"
                    />
                  </div>

                  {/* Priority Select */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tingkat Prioritas</label>
                    <select
                      value={broadcastPriorityInput}
                      onChange={(e) => setBroadcastPriorityInput(e.target.value)}
                      disabled={isBroadcasting}
                      className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 outline-none text-xs font-bold text-slate-800 focus:border-slate-300 transition-all"
                    >
                      <option value="0">Info (Banner Biru Standar)</option>
                      <option value="1">Penting (Banner Kuning Menengah)</option>
                      <option value="2">Strategis (Layar Penuh / Override Sistem)</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleToggleBroadcast(true)}
                      disabled={isBroadcasting || !broadcastMsgInput}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
                    >
                      {isBroadcasting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>Siarkan Sekarang</>
                      )}
                    </button>

                    {systemConfigData?.broadcastActive && (
                      <button
                        onClick={() => handleToggleBroadcast(false)}
                        disabled={isBroadcasting}
                        className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center"
                      >
                        Hentikan
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

            </div>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: 'var(--edu-cream)' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 uppercase tracking-wider">
                Status Siswa
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${levelData.bg} ${levelData.text} uppercase tracking-wider`}>
                {user?.role === 'ADMIN' ? 'ADMIN UTAMA' : levelData.title}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight" style={{ color: 'var(--edu-text)' }}>
              Halo, {user ? <span className="text-red-600">{user.name}</span> : <div className="inline-block w-48 h-10 skeleton align-middle" />}!
            </h1>
            <p style={{ color: 'var(--edu-muted)' }} className="max-w-md font-medium">
              {levelData.subtitle} Terus asah pemahamanmu agar menjadi <span className="text-slate-900 font-bold">Siswa Sekolah Menengah Pertama Unggul</span>.
            </p>
          </div>
        </motion.div>

        {/* Learning Journey Roadmap - Premium RPG Feel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Jalur Pembelajaranmu</h2>
              <p className="text-xs font-medium text-slate-400">Teruslah belajar untuk membuka pencapaian baru</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <Zap size={14} className="text-amber-500 fill-amber-500" />
               <span className="text-xs font-black text-slate-700">{user?.xp} <span className="text-slate-300">XP</span></span>
            </div>
          </div>

          <div className="relative overflow-x-auto pb-16 pt-4 no-scrollbar">
            <div className="flex items-center gap-4 min-w-[800px] px-2">
              {[
                { lvl: currentLevel - 1, label: 'Selesai', active: false, done: true },
                { lvl: currentLevel, label: levelData.title, active: true, done: false, progress: xpProgress },
                { lvl: currentLevel + 1, label: getLevelData(currentLevel + 1).title, active: false, done: false },
                { lvl: currentLevel + 2, label: 'Lanjutan', active: false, done: false },
                { lvl: currentLevel + 3, label: 'Mastery', active: false, done: false },
              ].map((step, i) => (
                <Fragment key={i}>
                  {/* Node */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`relative z-10 w-44 h-56 rounded-[2.5rem] p-6 border-2 flex flex-col items-center text-center justify-between transition-all duration-500 ${
                      step.active 
                        ? 'bg-white border-red-600 shadow-2xl shadow-red-200 -translate-y-2' 
                        : step.done 
                          ? 'bg-slate-50 border-slate-200 opacity-60 grayscale'
                          : 'bg-white border-slate-100 opacity-40 grayscale-0'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                      step.active ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.done ? <CheckCircle size={24} /> : <span className="font-black text-lg">{step.lvl}</span>}
                    </div>
                    
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${step.active ? 'text-red-600' : 'text-slate-400'}`}>
                        {step.active ? 'Sekarang' : step.done ? 'Selesai' : 'Terkunci'}
                      </div>
                      <div className="text-sm font-black text-slate-900 leading-tight">
                        {step.label}
                      </div>
                    </div>

                    {step.active && (
                      <div className="w-full mt-4">
                        <div className="flex justify-between text-[9px] font-black mb-1">
                          <span className="text-slate-400">{xpProgress}%</span>
                          <span className="text-red-600">NAIK LEVEL</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${xpProgress}%` }}
                             className="h-full bg-red-600"
                           />
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Connector */}
                  {i < 4 && (
                    <div className="flex-1 h-1 min-w-[20px] bg-slate-100 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: step.done ? '100%' : step.active ? `${xpProgress}%` : '0%' }}
                        className="absolute inset-0 bg-red-600"
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 border transition-all"
                style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: stat.bg }}>
                  <stat.icon size={22} style={{ color: stat.accent }} />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-0.5" style={{ color: 'var(--edu-text)' }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--edu-muted)' }}>{stat.label}</div>
              </div>
            ))
          )}
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col: quick actions + progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border"
              style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--edu-text)' }}>Mulai Belajar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { to: '/portal', label: 'Portal Materi', sub: 'Baca & pelajari', icon: BookOpen, accent: 'var(--edu-navy)', bg: 'rgba(30,64,175,0.08)' },
                  { to: '/quiz/range/4-7', label: 'Kuis', sub: 'Uji pemahaman', icon: Brain, accent: '#7e22ce', bg: 'rgba(126,34,206,0.08)' },
                  { to: '/leaderboard', label: 'Peringkat', sub: 'Lihat ranking', icon: Trophy, accent: 'var(--edu-gold)', bg: 'rgba(180,131,9,0.08)' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ borderColor: item.bg, background: `${item.bg}66` }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.bg }}>
                      <item.icon size={20} style={{ color: item.accent }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate" style={{ color: 'var(--edu-text)' }}>{item.label}</div>
                      <div className="text-xs" style={{ color: 'var(--edu-muted)' }}>{item.sub}</div>
                    </div>
                    <ArrowRight size={14} className="ml-auto flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: item.accent }} />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border"
              style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--edu-text)' }}>Progres Belajar</h2>
                <TrendingUp size={18} style={{ color: '#1E8449' }} />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
                </div>
              ) : progress?.progress && Array.isArray(progress.progress) && progress.progress.length > 0 ? (
                <div className="space-y-3">
                  {progress.progress.slice(0, 5).map(p => {
                    if (!p || !p.material) return null;
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl"
                        style={{ background: 'var(--edu-cream)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#E3EEFF' }}>
                        <BookOpen size={15} style={{ color: 'var(--edu-navy)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate mb-1" style={{ color: 'var(--edu-text)' }}>
                          {p.material?.title}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--edu-border)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg, var(--edu-red), #e05252)' }}
                            />
                          </div>
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--edu-navy)' }}>
                            {p.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp size={40} className="mx-auto mb-3" style={{ color: '#C4BFB9' }} />
                  <p className="font-medium mb-1" style={{ color: 'var(--edu-text)' }}>Belum ada progres</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--edu-muted)' }}>Mulai baca materi pertamamu!</p>
                  <Link to="/portal" className="btn-navy text-sm">
                    Cari Materi <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right col: achievements + admin */}
          <div className="space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border"
              style={{ borderColor: 'var(--edu-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--edu-text)' }}>Pencapaian</h2>
                <Award size={18} style={{ color: '#9B7210' }} />
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square skeleton rounded-2xl" />
                  ))}
                </div>
              ) : achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {achievements.map(a => (
                    <div 
                      key={a.id} 
                      className="group flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-[1.5rem] transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 relative overflow-hidden" 
                      title={a.achievement?.name}
                    >
                      {/* Decorative soft glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/0 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 relative z-10 transition-transform duration-300 group-hover:-translate-y-1 bg-amber-50 border border-amber-100 shadow-inner group-hover:bg-amber-100">
                        <span className="drop-shadow-sm">{a.achievement?.icon}</span>
                      </div>
                      <div className="text-[11px] font-bold text-center leading-tight px-1 z-10" style={{ color: 'var(--edu-text)' }}>
                        {a.achievement?.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm" style={{ color: 'var(--edu-muted)' }}>
                    Selesaikan kuis dan materi untuk mendapatkan pencapaian pertamamu!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Admin Control Center — Modern Bento Grid Version */}
            {(user?.role === 'ADMIN' || user?.role === 'TUTOR') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-slate-900" />
                      <h2 className="font-bold text-lg text-slate-900">Pusat Kendali</h2>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Access</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      internallyTo: `${ADMIN_PATH}/materials`, 
                      label: 'Materi', 
                      desc: 'Edit & terbitkan modul', 
                      icon: FileText, 
                      accent: 'amber', 
                      colSpan: 'col-span-2',
                      show: true 
                    },
                    { 
                      internallyTo: `${ADMIN_PATH}/quizzes`, 
                      label: 'Kuis', 
                      desc: 'Kelola soal', 
                      icon: Brain, 
                      accent: 'purple', 
                      colSpan: 'col-span-1',
                      show: true 
                    },
                    { 
                      internallyTo: `${ADMIN_PATH}/categories`, 
                      label: 'Topik', 
                      desc: 'Atur kategori', 
                      icon: Layers, 
                      accent: 'indigo', 
                      colSpan: 'col-span-1',
                      show: true 
                    },
                    { 
                      internallyTo: `${ADMIN_PATH}/analytics`, 
                      label: 'Analitik', 
                      desc: 'Cek performa', 
                      icon: TrendingUp, 
                      accent: 'violet', 
                      colSpan: 'col-span-1',
                      show: user?.role === 'ADMIN' 
                    },
                    { 
                      internallyTo: `${ADMIN_PATH}/users`, 
                      label: 'User', 
                      desc: 'Kelola akses', 
                      icon: Users, 
                      accent: 'blue', 
                      colSpan: 'col-span-1',
                      show: user?.role === 'ADMIN' 
                    },
                    { 
                      internallyTo: `${ADMIN_PATH}/maintenance`, 
                      label: 'Sistem & Pengaduan', 
                      desc: 'Kelola pemeliharaan & saran', 
                      icon: Wrench, 
                      accent: 'orange', 
                      colSpan: 'col-span-2',
                      show: user?.role === 'ADMIN' 
                    },
                    { 
                      type: 'action',
                      label: 'Export Data Siswa', 
                      desc: 'Unduh laporan CSV', 
                      icon: Download, 
                      accent: 'emerald', 
                      colSpan: 'col-span-2',
                      show: user?.role === 'ADMIN' 
                    },
                  ].filter(i => i.show).map((item, idx) => {
                    const colors = {
                      amber: 'text-amber-600 bg-amber-50 ring-amber-100/50',
                      purple: 'text-purple-600 bg-purple-50 ring-purple-100/50',
                      indigo: 'text-indigo-600 bg-indigo-50 ring-indigo-100/50',
                      violet: 'text-violet-600 bg-violet-50 ring-violet-100/50',
                      blue: 'text-blue-600 bg-blue-50 ring-blue-100/50',
                      emerald: 'text-emerald-600 bg-emerald-50 ring-emerald-100/50',
                      orange: 'text-orange-600 bg-orange-50 ring-orange-100/50',
                    };

                    const isAction = item.type === 'action';
                    const Wrapper = isAction ? 'button' : Link;
                    const props = isAction ? {
                      onClick: async () => {
                         try {
                            const res = await api.get('/admin/export/users', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a'); link.href = url;
                            link.setAttribute('download', 'users.csv'); document.body.appendChild(link);
                            link.click();
                         } catch { toast.error('Gagal export data') }
                      }
                    } : { to: item.internallyTo };

                    return (
                      <Wrapper
                        key={item.label}
                        {...props}
                        className={`${item.colSpan} group relative flex flex-col p-4 bg-white border border-slate-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-300 overflow-hidden text-left outline-none`}
                      >
                         {/* Subtle Glow Effect */}
                         <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-current ${colors[item.accent].split(' ')[0]}`} />
                         
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ring-1 transition-transform group-hover:scale-110 ${colors[item.accent]}`}>
                            <item.icon size={18} strokeWidth={2.2} />
                         </div>
                         
                         <div className="font-bold text-slate-800 text-xs sm:text-sm mb-0.5">{item.label}</div>
                         <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 line-clamp-1">{item.desc}</div>
                         
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-1">
                            <ArrowRight size={12} className="text-slate-400" />
                         </div>
                      </Wrapper>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Kartu masukan pengguna — versi light mode */}
            {user?.role !== 'ADMIN' && user?.role !== 'TUTOR' && (
              <div 
                className="bg-white rounded-2xl p-6 border transition-all duration-300"
                style={{ 
                  borderColor: 'var(--edu-border)', 
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: 
                        feedbackCategory === 'SUGGESTION' ? 'rgba(245, 158, 11, 0.08)' :
                        feedbackCategory === 'BUG' ? 'rgba(239, 68, 68, 0.08)' :
                        'rgba(30, 64, 175, 0.08)'
                    }}
                  >
                    {feedbackCategory === 'SUGGESTION' ? (
                      <Lightbulb size={20} className="text-amber-600" />
                    ) : feedbackCategory === 'BUG' ? (
                      <Bug size={20} className="text-red-600 animate-pulse" />
                    ) : (
                      <MessageSquare size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-base" style={{ color: 'var(--edu-text)' }}>
                      Punya {feedbackCategory === 'SUGGESTION' ? 'Saran' : feedbackCategory === 'BUG' ? 'Masalah' : 'Pesan'} untuk Kami?
                    </h2>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--edu-muted)' }}>
                      Bantu kami meningkatkan kualitas portal Pancasila Edu
                    </p>
                  </div>
                </div>

                {/* Dynamic Interactive Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('SUGGESTION')}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      feedbackCategory === 'SUGGESTION'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <Lightbulb size={13} />
                    Saran
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('BUG')}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      feedbackCategory === 'BUG'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <Bug size={13} />
                    Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('MESSAGE')}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      feedbackCategory === 'MESSAGE'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquare size={13} />
                    Pesan
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={
                      feedbackCategory === 'SUGGESTION' ? 'Tulis saran, ide kreatif, atau fitur baru yang ingin kamu kembangkan...' :
                      feedbackCategory === 'BUG' ? 'Jelaskan bug atau kendala teknis yang kamu temukan, misal kuis lemot atau gambar tidak muncul...' :
                      'Tulis pesan atau pertanyaan umum yang ingin kamu tanyakan ke Admin...'
                    }
                    className={`w-full p-4 rounded-xl border outline-none text-xs font-bold leading-relaxed text-slate-800 placeholder:text-slate-400 bg-slate-50/50 transition-all ${
                      feedbackCategory === 'SUGGESTION' ? 'border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10' :
                      feedbackCategory === 'BUG' ? 'border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/10' :
                      'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10'
                    }`}
                    rows={3}
                  />
                  
                  <button
                    disabled={sendingFeedback}
                    onClick={async () => {
                      if (!feedbackText.trim()) return toast.error('Pesan tidak boleh kosong');
                      setSendingFeedback(true);
                      try {
                        await api.post('/discussion/feedback', { content: feedbackText, category: feedbackCategory });
                        toast.success('Terima kasih atas saran Anda.');
                        setFeedbackText('');
                      } catch {
                        toast.error('Gagal mengirim pesan, coba lagi.');
                      } finally {
                        setSendingFeedback(false);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white active:scale-[0.98] ${
                      feedbackCategory === 'SUGGESTION' ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10' :
                      feedbackCategory === 'BUG' ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/10' :
                      'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10'
                    }`}
                  >
                    {sendingFeedback ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    <span>
                      {sendingFeedback ? 'Sedang Mengirim...' : 'Kirim Pesan Ke Admin'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
