import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, Check, X, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import axios from 'axios'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function FileUpload({ 
  value, 
  onChange, 
  allowedTypes = ['application/pdf'], 
  maxSize = 10 * 1024 * 1024, // 10MB (Batas Cloudinary Free Tier untuk berkas raw/PDF)
  placeholder = 'Seret & letakkan file PDF di sini, atau klik untuk memilih'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Format bytes helper
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = async (file) => {
    setError(null)

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      const typeStr = allowedTypes.map(t => t.split('/')[1]?.toUpperCase()).join(', ')
      const err = `Tipe berkas tidak didukung. Harap pilih berkas: ${typeStr}`
      setError(err)
      toast.error(err)
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      const err = `Ukuran berkas terlalu besar. Maksimal ${formatBytes(maxSize)} (Batas Cloudinary Free Tier). Harap gunakan Google Drive untuk berkas yang lebih besar.`
      setError(err)
      toast.error(err)
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Sedang menyiapkan unggahan aman...')

    try {
      // 1. Ambil signature aman dari backend (melewati limit Vercel karena payload sangat kecil)
      toast.loading('Menghubungkan ke server unggah...', { id: toastId })
      const signatureResponse = await api.get('/upload/signature')
      const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data

      // 2. Siapkan FormData untuk direct upload langsung dari browser ke Cloudinary
      toast.loading('Sedang mengunggah berkas langsung ke Cloud Storage...', { id: toastId })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

      // 3. Upload langsung (CORS aman, melewati Vercel Gateway 4.5MB)
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData
      )

      if (response.data && response.data.secure_url) {
        onChange(response.data.secure_url)
        toast.success('Berkas berhasil diunggah langsung ke Cloud Storage!', { id: toastId })
      } else {
        throw new Error('Respons Cloudinary tidak valid')
      }
    } catch (err) {
      console.error('Direct upload error:', err)
      const errorMsg = err.response?.data?.error?.message || 
                       err.response?.data?.error || 
                       err.message || 
                       'Gagal mengunggah berkas langsung'
      setError(errorMsg)
      toast.error(`Unggah gagal: ${errorMsg}`, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
        disabled={isUploading}
      />

      <AnimatePresence mode="wait">
        {value ? (
          // SUCCESS / COMPLETED STATE
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative flex items-center justify-between p-4 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl group shadow-sm transition-all"
          >
            <div className="flex items-center gap-4 min-w-0 pr-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FileText size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {value.split('/').pop() || 'Berkas Terunggah'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    Cloudinary
                  </span>
                  <a 
                    href={value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    Buka Berkas <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-2 hover:bg-emerald-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              title="Hapus berkas"
            >
              <X size={18} />
            </button>
          </motion.div>
        ) : isUploading ? (
          // UPLOADING STATE
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 bg-blue-50/20 border-2 border-dashed border-blue-300 rounded-2xl text-center min-h-[160px]"
          >
            <Loader2 size={36} className="text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-bold text-blue-700 mb-1">Mengunggah ke Cloud Storage...</p>
            <p className="text-xs text-slate-500">Mohon tunggu, berkas sedang diproses secara permanen.</p>
          </motion.div>
        ) : (
          // IDLE / DROPZONE STATE
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer text-center min-h-[160px] transition-all relative overflow-hidden ${
              isDragging 
                ? 'border-blue-500 bg-blue-50/40 shadow-sm shadow-blue-50' 
                : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            {/* Ambient drag-over gradient glow */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>

            <UploadCloud 
              size={36} 
              className={`mb-3 transition-colors ${isDragging ? 'text-blue-600 animate-pulse' : 'text-slate-400 group-hover:text-blue-500'}`} 
            />
            
            <p className="text-sm font-bold text-slate-700 px-4">
              {placeholder}
            </p>
            
            <p className="text-[11px] text-slate-400 mt-2">
              Maksimal ukuran: {formatBytes(maxSize)} (Format: PDF)
            </p>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
