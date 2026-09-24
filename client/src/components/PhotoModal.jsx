import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Sparkles, RefreshCw, Heart, Trash2, Smile } from 'lucide-react';

const STICKER_PALETTE = ['💖', '✨', '🎀', '🧸', '🌸', '🍒', '💌', '📸', '⭐', '🍓', '🥂', '🕊️'];

export default function PhotoModal({
  imageSrc,
  onClose,
  onRetake,
  stickers = [],
  onAddSticker,
  onMoveSticker,
  onRemoveSticker,
  onClearStickers,
  onGenerateDecoratedDownload
}) {
  const [activeStickerId, setActiveStickerId] = useState(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!imageSrc) return null;

  const handlePointerDown = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveStickerId(id);
    isDraggingRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const currentRect = container.getBoundingClientRect();

      let x = (moveEvent.clientX - currentRect.left) / currentRect.width;
      let y = (moveEvent.clientY - currentRect.top) / currentRect.height;

      x = Math.max(0.01, Math.min(0.99, x));
      y = Math.max(0.01, Math.min(0.99, y));

      if (onMoveSticker) {
        onMoveSticker(id, x, y);
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDownload = () => {
    if (onGenerateDecoratedDownload) {
      onGenerateDecoratedDownload();
    } else {
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `photobooth-love-${timestamp}.png`;
      link.href = imageSrc;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 overflow-hidden select-none">
      
      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-lg w-full bg-zinc-900/80 border border-white/10 border-t-white/20 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col h-[92vh] max-h-[92vh] backdrop-blur-3xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-black/40 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Decorate Photobooth Strip <Heart className="w-3.5 h-3.5 text-emerald-400 inline fill-emerald-400" />
              </h2>
              <p className="text-[10px] text-zinc-400">
                Drag stickers anywhere • Synced live with partner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photobooth Strip Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 flex justify-center bg-black/50 select-none">
          <div
            ref={containerRef}
            className="relative max-w-[280px] sm:max-w-[320px] md:max-w-[340px] w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-2xl border border-white/10 my-auto touch-none"
          >
            {/* Full Strip Base Image */}
            <img
              src={imageSrc}
              alt="Photobooth Strip"
              className="w-full h-auto object-contain rounded-2xl block pointer-events-none"
            />

            {/* Interactive Stickers Layer */}
            {stickers.map((st) => (
              <div
                key={st.id}
                onPointerDown={(e) => handlePointerDown(st.id, e)}
                style={{
                  left: `${(st.x ?? 0.5) * 100}%`,
                  top: `${(st.y ?? 0.5) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${st.rotation || 0}deg) scale(${st.scale || 1.0})`
                }}
                className={`absolute z-20 cursor-grab active:cursor-grabbing p-1 text-3xl sm:text-4xl select-none transition-shadow ${
                  activeStickerId === st.id ? 'ring-2 ring-emerald-400 rounded-xl bg-black/30' : ''
                }`}
              >
                <span>{st.content}</span>
                {activeStickerId === st.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRemoveSticker) onRemoveSticker(st.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-30 hover:scale-110"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticker Tray Bar */}
        <div className="px-4 py-2.5 bg-black/50 border-t border-white/[0.08] flex items-center justify-between gap-2 z-30 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-zinc-400 hidden sm:inline">Stickers:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {STICKER_PALETTE.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onAddSticker && onAddSticker(emoji, 0.5, 0.45)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 text-lg flex items-center justify-center transition-all border border-white/10 shadow-sm flex-shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {stickers.length > 0 && (
            <button
              onClick={onClearStickers}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors flex-shrink-0"
              title="Clear all stickers"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-white/[0.08] bg-black/60 z-30 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetake}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-2xl text-xs shadow-[0_10px_25px_rgba(16,185,129,0.35)] border border-emerald-400/30 flex items-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Strip</span>
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
