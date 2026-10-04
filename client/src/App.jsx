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
  const { roomId, localName, partnerName, isConnected, savedStrips, leaveRoom } = useWebRTC();
  const navigate = useNavigate();

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full mx-auto px-4 py-3 flex items-center justify-between gap-4 select-none bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
      {/* Left Brand / Room Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
          <Heart className="w-4 h-4 fill-emerald-400/50" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
            {isConnected ? `${localName} & ${partnerName}` : `${localName} (Waiting...)`}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 font-mono mt-0.5">
            <span>{roomId}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
        <NavLink
          to="/room"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Photobooth</span>
        </NavLink>
        <NavLink
          to="/movie"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Cinema</span>
        </NavLink>
        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isActive ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Box className="w-3.5 h-3.5" />
          <span>Scrapbook</span>
          {savedStrips.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
              {savedStrips.length}
            </span>
          )}
        </NavLink>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-1">
          <NavLink to="/room" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}><Camera className="w-4 h-4" /></NavLink>
          <NavLink to="/movie" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}><Tv className="w-4 h-4" /></NavLink>
          <NavLink to="/gallery" className={({isActive}) => `p-2 rounded-full ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}><Box className="w-4 h-4" /></NavLink>
        </div>

        <div className="w-px h-4 bg-white/10 hidden sm:block" />

        <button
          onClick={handleLeave}
          className="p-2 rounded-full hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function MainAppRoutes() {
  const { roomId, joinRoom, updateNames, savedStrips } = useWebRTC();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = React.useMemo(() => {
    if (location.pathname.startsWith('/movie')) return 'movie';
    if (location.pathname.startsWith('/gallery')) return 'gallery';
    return 'photobooth';
  }, [location.pathname]);

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

      {/* Header */}
      {roomId && <NavigationHeader />}

      {/* Main View Stage: Stacked DOM Persistence */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {!roomId ? (
          <RoomJoin onJoin={handleJoin} />
        ) : (
          <div className="relative w-full h-full flex-1 overflow-hidden">
            {/* Photobooth Tab */}
            <div
              className={`w-full h-full transition-opacity duration-200 ${
                activeTab === 'photobooth'
                  ? 'relative z-10 opacity-100'
                  : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
              }`}
            >
              <VideoRoom onOpenGallery={() => navigate('/gallery')} />
            </div>

            {/* Cinema Room Tab */}
            <div
              className={`w-full h-full transition-opacity duration-200 ${
                activeTab === 'movie'
                  ? 'relative z-10 opacity-100'
                  : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
              }`}
            >
              <MovieRoom />
            </div>

            {/* 3D Scrapbook Tab */}
            <div
              className={`w-full h-full transition-opacity duration-200 ${
                activeTab === 'gallery'
                  ? 'relative z-10 opacity-100'
                  : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
              }`}
            >
              <Gallery3D
                isActive={activeTab === 'gallery'}
                strips={savedStrips}
                onBackToBooth={() => navigate('/room')}
              />
            </div>
          </div>
        )}
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