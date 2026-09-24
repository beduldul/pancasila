import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Search, BookOpen, Star, BookMarked, ShieldCheck, X } from 'lucide-react';
import API from '../utils/api';
import PDFViewer from '../components/PDFViewer';
import toast from 'react-hot-toast';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerTitle, setViewerTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, catRes] = await Promise.all([
          API.get('/materials?type=BOOK'),
          API.get('/categories')
        ]);
        setBooks(bookRes.data.data || []);
        setCategories(catRes.data || []);
      } catch (e) {
        console.error('Failed to load books', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                         b.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleRead = (book) => {
    const url = book.fileUrl || book.driveUrl || book.videoUrl;
    if (url) {
      setViewerUrl(url);
      setViewerTitle(book.title);
    } else {
      toast.error('Maaf, link dokumen untuk buku ini belum tersedia.');
    }
  };

  const activeCategoryName = selectedCategory === 'all'
    ? 'Semua Koleksi'
    : categories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--edu-cream)' }}>

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--edu-cream)' }}>
        <div className="absolute top-0 right-0 w-[700px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(30,41,59,0.06) 0%, transparent 60%)' }} />
        <Library size={380} strokeWidth={0.7}
          className="absolute -right-20 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#1E293B', opacity: 0.05 }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-36 pb-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-3">
                Literasi Digital &nbsp;·&nbsp; {books.length} Koleksi
              </p>
              <h1 className="font-black tracking-tight leading-none mb-5"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', color: 'var(--edu-text)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                Pustaka<br />
                <span style={{ color: '#334155' }}>Digital.</span>
              </h1>
              <p className="text-base text-slate-500 max-w-md leading-relaxed font-medium">
                Buku teks, jurnal, dan referensi wawasan kebangsaan pilihan — dalam format digital yang bisa dibaca kapan saja.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="relative w-full lg:w-80">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari judul atau penulis..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white pl-11 pr-9 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 transition-all font-semibold text-slate-800 text-sm shadow-sm" />
              {search && (
                <button onClick={() => setSearch('')}
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
        <div className="grid lg:grid-cols-12 gap-10">

          {/* ── SIDEBAR ────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Kategori</p>

              <button onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left text-sm font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-white shadow-sm text-slate-900 border border-slate-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                Semua Koleksi
              </button>

              {categories.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left text-sm font-bold ${
                      isActive
                        ? 'bg-white shadow-sm text-slate-900 border border-slate-100'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color || '#334155' }} />
                    {cat.name}
                  </button>
                );
              })}

            </div>
          </div>

          {/* ── BOOK GRID ──────────────────────────────────── */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-lg font-black text-slate-900">{activeCategoryName}</h2>
              <span className="text-xs font-bold text-slate-400">{filtered.length} buku</span>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton rounded-[2rem]" style={{ aspectRatio: '3/4.5' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <BookMarked size={48} className="mx-auto mb-5 text-slate-200" />
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {search ? 'Buku Tidak Ditemukan' : 'Koleksi Kosong'}
                </h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {search
                    ? 'Coba kata kunci lain atau pilih kategori yang berbeda.'
                    : 'Belum ada koleksi buku untuk kategori ini. Silakan cek kembali nanti.'}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((book, i) => (
                    <motion.div key={book.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i * 0.05, 0.4) }}
                      className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2">

                      {/* Cover */}
                      <div className="relative overflow-hidden" style={{ aspectRatio: '3/3.8' }}>
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                            style={{ background: 'linear-gradient(145deg, #F1F5F9, #E2E8F0)' }}>
                            <BookOpen size={42} className="text-slate-300 mb-3" />
                            <span className="text-slate-500 font-black text-xs uppercase tracking-wide leading-relaxed">{book.title}</span>
                          </div>
                        )}

                        {/* Hover overlay with read button */}
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center">
                          <button onClick={() => handleRead(book)}
                            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform">
                            <BookOpen size={22} className="text-slate-900" />
                          </button>
                        </div>

                        {/* Category chip */}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
                            {book.category?.name || 'Umum'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-black text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-[11px] text-slate-400 font-semibold mb-4">
                          {book.author?.name || 'Tim Kurator'}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                            <Star size={10} fill="currentColor" /> Terverifikasi
                          </span>
                          <button onClick={() => handleRead(book)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-red-600 transition-colors flex items-center gap-1 group/btn">
                            Baca
                            <span className="group-hover/btn:translate-x-0.5 transition-transform inline-block">&rarr;</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── PDF VIEWER ─────────────────────────────────────── */}
      <AnimatePresence>
        {viewerUrl && (
          <PDFViewer url={viewerUrl} title={viewerTitle} onClose={() => setViewerUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
