import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, ArrowRight, User, ShieldCheck, Heart, Wand2 } from 'lucide-react';

export default function RoomJoin({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('Ritchi');

  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoin(roomId.trim().toUpperCase(), name.trim() || 'Ritchi');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-4 text-zinc-100 select-none">
      
      {/* Centered Glassmorphic Card (Design+Code Floating Card) */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-zinc-900/70 via-zinc-900/50 to-zinc-950/80 backdrop-blur-3xl border border-white/10 border-t-white/25 rounded-3xl p-8 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.7)] shadow-emerald-500/5"
      >
        {/* Brand Icon & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="relative mb-5 cursor-pointer"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/25 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)] backdrop-blur-xl">
              <Camera className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
            </span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Long-Distance Photobooth
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-normal max-w-xs leading-relaxed">
            A cozy, synchronized virtual studio crafted with love for two.
          </p>
        </div>

        {/* Room & Name Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User Name Input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your Name</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ritchi"
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 border-t-white/15 rounded-2xl text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/15 backdrop-blur-xl transition-all duration-200 shadow-inner"
                required
              />
            </div>
          </div>

          {/* Room Code Input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Room Code</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={generateRoomId}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto Generate</span>
              </motion.button>
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="e.g. LOVE-2026"
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 border-t-white/15 rounded-2xl text-white font-mono text-center tracking-[0.25em] placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/15 backdrop-blur-xl transition-all duration-200 shadow-inner uppercase"
                required
              />
            </div>
          </div>

          {/* Action Button (Glowing Emerald Gradient) */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!roomId.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-2xl text-sm transition-all shadow-[0_12px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border border-emerald-400/30"
            >
              <span className="tracking-tight">Enter Private Photobooth</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </form>

        {/* Footer info badge */}
        <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Peer-to-Peer Media Channels</span>
        </div>
      </motion.div>
    </div>
  );
}