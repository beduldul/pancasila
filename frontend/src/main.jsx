import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Portal from './pages/Portal'
import QuizAge from './pages/QuizAge'
import Books from './pages/Books'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MaterialDetail from './pages/MaterialDetail'
import QuizPlay from './pages/QuizPlay'
import AdminUsers from './pages/AdminUsers'
import AdminMaterials from './pages/AdminMaterials'
import AdminQuizzes from './pages/AdminQuizzes'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminSecurityLogs from './pages/AdminSecurityLogs'
import AdminCategories from './pages/AdminCategories'
import AdminFeedbackMaintenance from './pages/AdminFeedbackMaintenance'
import TapakLiman from './pages/about/TapakLiman'
import NilaiPancasila from './pages/about/NilaiPancasila'
import SDG from './pages/about/SDG'
import Persyaratan from './pages/about/Persyaratan'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import CommandPalette from './components/CommandPalette'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || '/admin'

import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { sound } from './utils/audio'
import { Check, AlertCircle, AlertTriangle } from 'lucide-react'
import { useToasterStore } from 'react-hot-toast'

function SoundWatcher() {
  const { toasts } = useToasterStore()
  const processedIds = useRef(new Set())

  useEffect(() => {
    if (!toasts || !Array.isArray(toasts)) return

    toasts.forEach(t => {
      if (t.id && !processedIds.current.has(t.id)) {
        processedIds.current.add(t.id)
        try {
          sound.playPop(t.type === 'error' ? 'error' : 'success')
        } catch (e) {
          console.warn('Audio feedback failed', e)
        }
      }
    })

    // Clean up old IDs to prevent memory leak
    if (processedIds.current.size > 20) {
      const currentIds = new Set(toasts.map(t => t.id))
      for (let id of processedIds.current) {
        if (!currentIds.has(id)) processedIds.current.delete(id)
      }
    }
  }, [toasts])

  return null
}

import MaintenancePage from './pages/MaintenancePage'
import ImpersonationOverlay from './components/ImpersonationOverlay'
import GlobalBroadcast from './components/GlobalBroadcast'
import BottomNav from './components/BottomNav'

import { useQuery } from '@tanstack/react-query'
import api from './utils/api'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const { data: systemConfig } = useQuery({
    queryKey: ['system-config-public'],
    queryFn: async () => {
      const res = await api.get('/portal/config')
      return res.data
    },
    enabled: !authLoading && (!user || user.role !== 'ADMIN'),
    refetchInterval: 60000
  })

  // Lockdown Protocol - Allow access to '/login' so admins can authenticate and disable maintenance mode!
  const isLoginPage = location.pathname === '/login'
  
  if (systemConfig?.maintenanceMode && (!user || user.role !== 'ADMIN') && !isLoginPage) {
    return <MaintenancePage message={systemConfig.maintenanceMsg} />
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <SoundWatcher />
      <ImpersonationOverlay />
      <GlobalBroadcast />
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <BottomNav onOpenSearch={() => setIsSearchOpen(true)} />
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.23, 1, 0.32, 1] 
            }}
            className="w-full"
          >
            <ContentErrorBoundary>
              <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/quiz/range/:range" element={<QuizAge />} />
              <Route path="/books" element={<Books />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about/tapak-liman" element={<TapakLiman />} />
              <Route path="/about/nilai-pancasila" element={<NilaiPancasila />} />
              <Route path="/about/sdg" element={<SDG />} />
              <Route path="/about/persyaratan" element={<Persyaratan />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/materials/:slug" element={<MaterialDetail />} />
              <Route path="/quiz-play/:slug" element={<QuizPlay />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/analytics`} element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/logs`} element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminSecurityLogs />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/users`} element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/maintenance`} element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminFeedbackMaintenance />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/materials`} element={
                <ProtectedRoute roles={['ADMIN', 'TUTOR']}>
                  <AdminMaterials />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/categories`} element={
                <ProtectedRoute roles={['ADMIN', 'TUTOR']}>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path={`${ADMIN_PATH}/quizzes`} element={
                <ProtectedRoute roles={['ADMIN', 'TUTOR']}>
                  <AdminQuizzes />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ContentErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        gutter={12}
        containerStyle={{
          top: 85,
          right: 20,
        }}
        toastOptions={{
          className: 'premium-toast animate-toast-in',
          duration: 4000,
          success: {
            className: 'premium-toast premium-toast-success animate-toast-in',
            icon: <div className="premium-toast-icon"><Check size={18} strokeWidth={3} /></div>,
          },
          error: {
            className: 'premium-toast premium-toast-error animate-toast-in',
            icon: <div className="premium-toast-icon"><AlertCircle size={18} strokeWidth={3} /></div>,
          },
        }}
      />
    </div>
  )
}

// Global crash capture for debugging White Screens
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.message, e.error?.stack);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Global Promise Rejection]', e.reason);
});

class ContentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("CONTENT AREA CRASH:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Konten Gagal Dimuat</h2>
          <p className="text-slate-500 mb-6">Terjadi kesalahan teknis saat memuat halaman ini.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for the developer to see
    console.error("APP CRASHED:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100"
          >
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              KRITIKAL ERROR:
            </h1>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Sistem Terhenti
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Aplikasi mengalami kegagalan render. Detail teknis di bawah ini sangat penting untuk perbaikan:
            </p>
            
            <div className="space-y-4">
              <div className="text-left bg-slate-900 rounded-2xl p-6 overflow-auto max-h-60 shadow-inner border border-slate-800">
                 <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stack Trace Error</span>
                 </div>
                 <div className="font-mono text-xs leading-relaxed">
                    <span className="text-emerald-400 block mb-1">Message: {this.state.error?.name}: {this.state.error?.message}</span>
                    <span className="text-slate-400 block mb-2">Stack:</span>
                    <pre className="text-slate-500 whitespace-pre-wrap break-all opacity-80">
                       {this.state.errorInfo?.componentStack || this.state.error?.stack}
                    </pre>
                 </div>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-100 uppercase tracking-widest text-xs active:scale-[0.98]"
              >
                Muat Ulang Aplikasi
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <RootErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </RootErrorBoundary>
  )
}

createRoot(document.getElementById('root')).render(<App />)

// Trigger Vercel GitHub rebuild: 2026-05-18

