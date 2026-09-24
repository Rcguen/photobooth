import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { WebRTCProvider, useWebRTC } from './context/WebRTCContext';
import RoomJoin from './components/RoomJoin';
import VideoRoom from './components/VideoRoom';
import MovieRoom from './components/MovieRoom';
import Gallery3D from './components/Gallery3D';
import { Camera, Tv, Box, LogOut, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function NavigationHeader() {
  const { roomId, localName, partnerName, isConnected, leaveRoom, savedStrips } = useWebRTC();
  const navigate = useNavigate();

  if (!roomId) return null;

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full max-w-5xl mx-auto pt-2.5 sm:pt-4 px-2.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-4 select-none"
    >
      {/* Left Brand / Room Info Glass Pill */}
      <motion.div
        whileHover={{ scale: 1.02, y: -1 }}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-900/40 backdrop-blur-3xl border border-white/10 border-t-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.5)] shadow-emerald-500/5 flex-shrink-0"
      >
        <motion.div
          whileHover={{ rotate: 12, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 flex-shrink-0"
        >
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
        </motion.div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span className="font-bold text-white tracking-tight truncate max-w-[105px] sm:max-w-none">
            {isConnected ? `${localName} & ${partnerName}` : `${localName} (Waiting...)`}
          </span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />
          <span className="hidden sm:inline text-zinc-400 font-mono text-[11px]">{roomId}</span>
          <span
            className={`w-2 h-2 rounded-full ml-0.5 sm:ml-1 flex-shrink-0 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse'
            }`}
            title={isConnected ? 'Connected to partner' : 'Waiting for partner to join...'}
          />
        </div>
      </motion.div>

      {/* Center Floating Glass Navigation Dock */}
      <nav className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-zinc-900/40 backdrop-blur-3xl border border-white/10 border-t-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)] shadow-emerald-500/5 overflow-x-auto flex-nowrap">
        <NavLink
          to="/room"
          className={({ isActive }) =>
            `px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] border border-emerald-400/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            }`
          }
          title="Photobooth"
        >
          {({ isActive }) => (
            <motion.div
              whileHover={{ scale: isActive ? 1 : 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline tracking-tight">Photobooth</span>
            </motion.div>
          )}
        </NavLink>

        <NavLink
          to="/movie"
          className={({ isActive }) =>
            `px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] border border-emerald-400/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            }`
          }
          title="Cinema Room"
        >
          {({ isActive }) => (
            <motion.div
              whileHover={{ scale: isActive ? 1 : 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline tracking-tight">Cinema Room</span>
            </motion.div>
          )}
        </NavLink>

        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] border border-emerald-400/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
            }`
          }
          title="3D Scrapbook"
        >
          {({ isActive }) => (
            <motion.div
              whileHover={{ scale: isActive ? 1 : 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline tracking-tight">3D Scrapbook</span>
              {savedStrips.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-zinc-950 text-[9px] font-bold shadow-sm">
                  {savedStrips.length}
                </span>
              )}
            </motion.div>
          )}
        </NavLink>
      </nav>

      {/* Right Leave Room Button */}
      <motion.button
        whileHover={{ scale: 1.08, y: -1 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleLeave}
        className="p-2 sm:p-2.5 rounded-full bg-zinc-900/40 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 backdrop-blur-3xl transition-all duration-200 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex-shrink-0"
        title="Leave Room"
      >
        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </motion.button>
    </motion.header>
  );
}

function MainAppRoutes() {
  const { roomId, joinRoom, updateNames, savedStrips } = useWebRTC();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom && !roomId) {
      joinRoom(urlRoom.toUpperCase());
    }
  }, [roomId, joinRoom]);

  // Robust handleJoin that safely handles both object { roomId, localName, partnerName } and separate args (roomId, localName)
  const handleJoin = (arg1, arg2) => {
    let id = '';
    let lName = '';
    let pName = '';

    if (typeof arg1 === 'object' && arg1 !== null) {
      id = arg1.roomId || arg1.id || '';
      lName = arg1.localName || arg1.name || '';
      pName = arg1.partnerName || '';
    } else {
      id = arg1 || '';
      lName = arg2 || '';
    }

    if (id) {
      joinRoom(id, lName);
      if (pName && updateNames) {
        updateNames(lName, pName);
      }
      navigate('/room');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#040605] via-[#070d0a] to-[#030504] text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none z-0" />

      {/* Cinematic Film Grain Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0 mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Dynamic Animated Mesh Gradient Blobs (Meng To Style) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.92, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-[45vw] h-[45vw] min-w-[350px] min-h-[350px] bg-emerald-600/20 rounded-full blur-[130px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, -50, 35, 0],
          y: [0, 45, -35, 0],
          scale: [1, 0.88, 1.12, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-[50vw] h-[50vw] min-w-[380px] min-h-[380px] bg-teal-500/18 rounded-full blur-[150px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, 35, -25, 0],
          y: [0, 30, -40, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[38vw] h-[38vw] min-w-[300px] min-h-[300px] bg-emerald-400/12 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, -25, 25, 0],
          scale: [1, 1.08, 0.95, 1]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/3 left-10 w-[40vw] h-[40vw] min-w-[320px] min-h-[320px] bg-cyan-700/12 rounded-full blur-[140px] pointer-events-none z-0"
      />

      {/* Header */}
      {roomId && <NavigationHeader />}

      {/* Main View Router Stage */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <Routes>
          {/* Root path: If in room, redirect to /room, otherwise show RoomJoin */}
          <Route
            path="/"
            element={
              roomId ? <Navigate replace to="/room" /> : <RoomJoin onJoin={handleJoin} />
            }
          />

          {/* Protected Route: Photobooth */}
          <Route
            path="/room"
            element={
              roomId ? (
                <VideoRoom onOpenGallery={() => navigate('/gallery')} />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />

          {/* Protected Route: Cinema Room */}
          <Route
            path="/movie"
            element={
              roomId ? <MovieRoom /> : <Navigate replace to="/" />
            }
          />

          {/* Protected Route: 3D Scrapbook */}
          <Route
            path="/gallery"
            element={
              roomId ? (
                <Gallery3D strips={savedStrips} onBackToBooth={() => navigate('/room')} />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />

          {/* Catch-all fallback */}
          <Route
            path="*"
            element={<Navigate replace to={roomId ? "/room" : "/"} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WebRTCProvider>
        <MainAppRoutes />
      </WebRTCProvider>
    </BrowserRouter>
  );
}