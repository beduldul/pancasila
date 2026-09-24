import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, ArrowLeft, Mail, Trash2, Clock, User, Save, RefreshCw, AlertTriangle, ShieldCheck, Check } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function AdminFeedbackMaintenance() {
  const queryClient = useQueryClient()
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMsg, setMaintenanceMsg] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)

  // Fetch feedbacks
  const { data: feedbacks = [], isLoading: loadingFeedbacks, refetch: refetchFeedbacks } = useQuery({
    queryKey: ['admin-feedbacks'],
    queryFn: async () => {
      const res = await api.get('/admin/feedbacks')
      return res.data
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  // Fetch current system config
  const { isLoading: loadingConfig } = useQuery({
    queryKey: ['admin-system-config'],
    queryFn: async () => {
      const res = await api.get('/admin/system-config')
      setMaintenanceMode(res.data.maintenanceMode)
      setMaintenanceMsg(res.data.maintenanceMsg || '')
      return res.data
    },
    staleTime: Infinity, // Load once at startup
  })

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/feedbacks/${id}`)
    },
    onSuccess: () => {
      toast.success('Pesan pengaduan berhasil dihapus')
      queryClient.invalidateQueries(['admin-feedbacks'])
    },
    onError: () => {
      toast.error('Gagal menghapus pesan')
    }
  })

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try {
      await api.patch('/admin/system-config', {
        maintenanceMode,
        maintenanceMsg,
      })
      toast.success('Pengaturan sistem berhasil diperbarui.')
      queryClient.invalidateQueries(['admin-system-config'])
      queryClient.invalidateQueries(['system-config-public'])
    } catch (err) {
      toast.error('Gagal memperbarui konfigurasi sistem')
    } finally {
      setSavingConfig(false)
    }
  }

  const handleDeleteFeedback = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pesan pengaduan ini?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen pb-20 pt-24 bg-slate-50 font-sans" style={{ color: 'var(--edu-text)' }}>
      {/* ━━━ HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative border-b border-slate-200 bg-white py-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-all mb-4">
            <ArrowLeft size={14} /> KEMBALI KE DASHBOARD
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                  Sistem & Pengaduan
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  Khusus Admin
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">
                Pemeliharaan & <span className="text-red-600">Pengaduan Siswa</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl leading-relaxed">
                Kelola status online platform dan pantau seluruh masukan, saran, serta laporan bug yang dikirimkan oleh siswa.
              </p>
            </div>

            <button 
              onClick={() => {
                refetchFeedbacks()
                toast.success('Pesan berhasil disinkronisasi!')
              }}
              className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-bold text-xs bg-white text-slate-700 shadow-sm"
            >
              <RefreshCw size={14} /> Sinkronisasi Pesan
            </button>
          </div>
        </div>
      </div>

      {/* ━━━ CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: MAINTENANCE CONTROL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Wrench size={18} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-base leading-none">Status Pemeliharaan</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Maintenance Mode</span>
                </div>
              </div>

              {loadingConfig ? (
                <div className="space-y-4 py-6">
                  <div className="h-6 skeleton rounded w-3/4" />
                  <div className="h-20 skeleton rounded" />
                  <div className="h-10 skeleton rounded" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Toggle Card */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    maintenanceMode 
                      ? 'bg-red-50/50 border-red-200 text-red-900' 
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {maintenanceMode ? (
                          <AlertTriangle size={18} className="text-red-600 animate-pulse" />
                        ) : (
                          <ShieldCheck size={18} className="text-emerald-600" />
                        )}
                        <span className="text-xs font-black uppercase tracking-wider">
                          {maintenanceMode ? 'SISTEM SEDANG OFFLINE' : 'SISTEM ONLINE & AKTIF'}
                        </span>
                      </div>

                      {/* Custom Switch Toggle */}
                      <button
                        onClick={() => setMaintenanceMode(prev => !prev)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                          maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
                        }`}
                      >
                        <motion.div 
                          layout
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                          animate={{ x: maintenanceMode ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    <p className="text-xs font-medium leading-relaxed opacity-75">
                      {maintenanceMode 
                        ? 'Pengguna biasa tidak dapat mengakses platform selain administrator utama.' 
                        : 'Seluruh pengguna dan siswa dapat mengakses materi, kuis, dan papan peringkat secara normal.'}
                    </p>
                  </div>

                  {/* Offline Message Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Pesan Kustom Pemeliharaan
                    </label>
                    <textarea
                      value={maintenanceMsg}
                      onChange={(e) => setMaintenanceMsg(e.target.value)}
                      placeholder="Contoh: Sistem sedang dalam pemeliharaan berkala untuk peningkatan fitur keamanan..."
                      className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-600 outline-none text-xs font-bold leading-relaxed text-slate-800 placeholder:text-slate-400 bg-slate-50"
                      rows={4}
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {savingConfig ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Sedang Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Simpan Pengaturan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: STUDENT FEEDBACK STREAM */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative min-h-[400px]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base leading-none">Kotak Pengaduan Siswa</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Student Feedback Stream</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
                  Total: {feedbacks.length} Pesan
                </div>
              </div>

              {loadingFeedbacks ? (
                <div className="space-y-4 py-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-5 border border-slate-100 rounded-2xl space-y-3">
                      <div className="h-4 skeleton rounded w-1/4" />
                      <div className="h-10 skeleton rounded" />
                      <div className="h-4 skeleton rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : feedbacks.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {feedbacks.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl flex gap-4 transition-all hover:bg-white hover:border-slate-300 relative group shadow-sm hover:shadow"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-xl font-bold uppercase text-slate-700 shadow-inner">
                          {item.user?.avatar ? item.user.avatar : item.user?.name ? item.user.name[0] : 'U'}
                        </div>

                        {/* Content details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-black text-slate-900 text-xs sm:text-sm leading-none">
                              {item.user?.name || 'Siswa Tanpa Nama'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              ({item.user?.email || 'N/A'})
                            </span>
                            
                            {/* Category Tag */}
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              item.category === 'BUG' ? 'bg-red-100 text-red-700' :
                              item.category === 'SUGGESTION' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.category}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">
                            {item.content}
                          </p>

                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                            <Clock size={10} />
                            <span>{new Date(item.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Delete Action button */}
                        <button
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center transition-all hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
                          title="Hapus pesan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                  <Mail className="mx-auto mb-4 text-slate-300" size={48} />
                  <p className="text-slate-700 font-bold text-sm mb-1">Kotak Pengaduan Kosong</p>
                  <p className="text-xs text-slate-400">Belum ada saran atau laporan bug yang dikirimkan oleh siswa.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
