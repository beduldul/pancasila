import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Brain, Star, X, Command, ArrowRight, Hash, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen) {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter' && results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/portal/search?q=${query}`);
        setResults(res.data || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    onClose();
    if (item.type === 'material') navigate(`/materials/${item.slug}`);
    if (item.type === 'quiz') navigate(`/quiz-play/${item.slug}`);
    if (item.type === 'page') navigate(item.path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[5vh] md:pt-[15vh] px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            {/* Input Area */}
            <div className="relative flex items-center p-4 md:p-5 border-b border-slate-100">
              <Search className="absolute left-6 text-slate-400" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari materi, kuis..."
                className="w-full bg-transparent pl-10 md:pl-12 pr-10 py-2 text-base md:text-lg font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={onClose}
                className="absolute right-4 p-2 text-slate-300 hover:text-slate-900 md:hidden"
              >
                <X size={20} />
              </button>
              <div className="absolute right-6 hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200">
                <Command size={10} />
                <span>ESC</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[70vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
              {!query && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                    <Command size={32} strokeWidth={1} />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1 text-sm md:text-base">Pencarian Pintar</h3>
                  <p className="text-slate-400 text-xs md:text-sm">Ketik untuk mencari modul pembelajaran atau kuis.</p>
                </div>
              )}

              {loading && query && (
                <div className="p-10 md:p-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mencari Data...</p>
                </div>
              )}

              {query && !loading && results.length === 0 && (
                <div className="p-10 md:p-12 text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 text-red-300">
                    <Search size={28} strokeWidth={1} />
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm">Tidak ada hasil ditemukan untuk "{query}"</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="p-1 md:p-2 space-y-0.5 md:space-y-1">
                  {results.map((item, idx) => {
                    const active = idx === activeIndex;
                    const Icon = item.type === 'material' ? BookOpen : item.type === 'quiz' ? Brain : Hash;
                    const colorClass = item.type === 'material' ? 'text-blue-600' : item.type === 'quiz' ? 'text-purple-600' : 'text-slate-600';
                    const bgClass = item.type === 'material' ? 'bg-blue-50' : item.type === 'quiz' ? 'bg-purple-50' : 'bg-slate-50';

                    return (
                      <button
                        key={item.id || item.path}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl text-left transition-all ${active ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-sm ${bgClass} ${colorClass}`}>
                          <Icon size={16} md:size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 text-sm mb-0.5 flex items-center gap-2">
                            <span className="truncate">{item.title}</span>
                            {active && <motion.span layoutId="arrow" className="text-blue-600 hidden md:inline"><ArrowRight size={14} /></motion.span>}
                          </div>
                          <div className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {item.category || item.type} &bull; {item.type === 'material' ? 'Materi' : 'Kuis'}
                          </div>
                        </div>
                        {item.xp && (
                          <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] md:text-[9px] font-black rounded-lg border border-amber-100">
                            +{item.xp} XP
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer - Hidden on Mobile */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 hidden md:flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-900">UP/DOWN</span>
                  <span>Navigasi</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-900">ENTER</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
