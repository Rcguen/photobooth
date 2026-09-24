import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebRTC } from '../context/WebRTCContext';
import {
  captureVideoFrame,
  renderPhotoboothStrip,
  FILTER_CSS_MAP,
  FRAME_THEMES
} from '../utils/canvasHelper';
import PhotoModal from './PhotoModal';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Copy,
  Check,
  Camera,
  Layers,
  Palette,
  SlidersHorizontal,
  Scan,
  Edit2,
  Heart,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';

function ViewfinderGuide({ label = 'Safe Zone' }) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden flex items-center justify-center">
      <div
        className="relative h-full aspect-[438/620.5] max-w-full flex items-center justify-center"
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
        }}
      >
        <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 rounded-2xl" />
        <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full h-px bg-white/60" />
          <div className="h-full w-px bg-white/60 absolute" />
        </div>
        <div className="absolute bottom-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-medium text-emerald-300 border border-emerald-500/30">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function VideoRoom({ onOpenGallery }) {
  const {
    roomId,
    leaveRoom,
    localStream,
    remoteStream,
    peerId,
    isPeerReady,
    isConnected,
    isMuted,
    isVideoOff,
    error,
    localName,
    partnerName,
    updateNames,
    stickers,
    addSticker,
    moveSticker,
    removeSticker,
    clearStickers,
    countdown,
    isCountingDown,
    currentShot,
    totalShots,
    flashScreen,
    triggerMultiShot,
    registerMultiShotHandlers,
    toggleAudio,
    toggleVideo,
    saveStrip,
    savedStrips
  } = useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const rawShotsRef = useRef([]);

  const [copied, setCopied] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Customization & Viewfinder State
  const [activeFilter, setActiveFilter] = useState('normal');
  const [activeTheme, setActiveTheme] = useState('cream');
  const [showCropGuide, setShowCropGuide] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [editLocal, setEditLocal] = useState(localName);
  const [editPartner, setEditPartner] = useState(partnerName);

  // Immersive Fullscreen State & Logic
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setEditLocal(localName);
  }, [localName]);

  useEffect(() => {
    setEditPartner(partnerName);
  }, [partnerName]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleSingleShot = useCallback((shotIndex) => {
    if (shotIndex === 1) {
      rawShotsRef.current = [];
    }

    const localCanvas = captureVideoFrame(localVideoRef.current, true);
    const remoteCanvas = captureVideoFrame(remoteVideoRef.current, false);

    rawShotsRef.current.push({
      localCanvas,
      remoteCanvas
    });
  }, []);

  const handleSequenceComplete = useCallback(() => {
    if (rawShotsRef.current.length > 0) {
      const mergedStripDataUrl = renderPhotoboothStrip(rawShotsRef.current, {
        localName,
        partnerName,
        names: `${localName} & ${partnerName}`,
        subtitle: 'LONG DISTANCE PHOTO AUTOMAT',
        filterType: activeFilter,
        themeType: activeTheme,
        stickers: []
      });
      
      setCapturedImage(mergedStripDataUrl);
      setShowModal(true);

      if (saveStrip) {
        saveStrip(mergedStripDataUrl);
      }
    }
  }, [localName, partnerName, activeFilter, activeTheme, saveStrip]);

  useEffect(() => {
    registerMultiShotHandlers({
      onShot: handleSingleShot,
      onComplete: handleSequenceComplete
    });
  }, [registerMultiShotHandlers, handleSingleShot, handleSequenceComplete]);

  const handleGenerateDecoratedDownload = useCallback(() => {
    if (rawShotsRef.current.length > 0) {
      const finalDecoratedDataUrl = renderPhotoboothStrip(rawShotsRef.current, {
        localName,
        partnerName,
        names: `${localName} & ${partnerName}`,
        subtitle: 'LONG DISTANCE PHOTO AUTOMAT',
        filterType: activeFilter,
        themeType: activeTheme,
        stickers
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `photobooth-love-${timestamp}.png`;
      link.href = finalDecoratedDataUrl;
      link.click();
    }
  }, [localName, partnerName, activeFilter, activeTheme, stickers]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetake = () => {
    setShowModal(false);
    setCapturedImage(null);
    rawShotsRef.current = [];
    triggerMultiShot(4, 3, 2);
  };

  const handleSaveNames = (e) => {
    e.preventDefault();
    updateNames(editLocal.trim() || 'Ritchi', editPartner.trim() || 'Kristine');
    setIsEditingNames(false);
  };

  const currentVideoFilterStyle = {
    filter: FILTER_CSS_MAP[activeFilter] || 'none'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full min-h-[calc(100vh-5rem)] flex flex-col justify-between text-zinc-100 p-3 sm:p-5 select-none overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Screen Flash on Shot */}
      {flashScreen && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none transition-opacity duration-200 animate-out fade-out" />
      )}

      {/* Synchronized Big Countdown & Shot Overlay */}
      <AnimatePresence>
        {isCountingDown && countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-xl pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5"
            >
              <div className="px-6 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-semibold text-xs tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-2xl">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Shot {currentShot} of {totalShots}</span>
              </div>

              {countdown > 0 ? (
                <motion.div
                  key={`${currentShot}-${countdown}`}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_0_60px_rgba(16,185,129,0.7)] tracking-tight font-mono"
                >
                  {countdown}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]"
                >
                  Smile! 📸
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Edit Modal */}
      <AnimatePresence>
        {isEditingNames && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              className="max-w-md w-full bg-zinc-900/80 border border-white/10 border-t-white/20 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
            >
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                Customize Photobooth Names
              </h3>
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                These names are dynamically printed on the strip footer and synced across both screens in real-time.
              </p>

              <form onSubmit={handleSaveNames} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={editLocal}
                    onChange={(e) => setEditLocal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-emerald-400/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={editPartner}
                    onChange={(e) => setEditPartner(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 focus:border-emerald-400/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNames(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 rounded-2xl text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all"
                  >
                    Save & Sync
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Viewports */}
      <main className="relative z-10 flex-1 flex items-center justify-center max-w-6xl mx-auto w-full my-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl max-h-[72vh]">
          
          {/* Local Video Frame */}
          <div className="relative aspect-[4/3] bg-white/[0.025] backdrop-blur-3xl rounded-3xl overflow-hidden border-t border-white/20 border-x border-white/10 border-b border-black/70 shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] shadow-emerald-500/10 group">
            {/* Top Light Catching Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={currentVideoFilterStyle}
              className={`w-full h-full object-cover -scale-x-100 transition-all duration-300 ${isVideoOff ? 'hidden' : 'block'}`}
            />

            {showCropGuide && !isVideoOff && (
              <ViewfinderGuide label={`${localName}'s Safe Zone`} />
            )}

            {isVideoOff && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 text-zinc-500 gap-2">
                <VideoOff className="w-10 h-10 stroke-1 text-zinc-600" />
                <span className="text-xs font-medium text-zinc-400">Camera is paused</span>
              </div>
            )}

            {/* Glassmorphic Badge */}
            <div className="absolute top-3.5 left-3.5 z-30 bg-black/60 backdrop-blur-2xl px-3 py-1.5 rounded-full text-xs font-medium border-t border-white/25 border-x border-white/10 border-b border-black/60 flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
              <span className="text-zinc-200 font-medium">{localName} (You)</span>
              <button
                onClick={() => setIsEditingNames(true)}
                title="Edit Name"
                className="p-0.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="absolute bottom-3.5 left-3.5 z-30 flex gap-2">
              {isMuted && (
                <div className="bg-red-500/25 border border-red-500/40 backdrop-blur-md p-1.5 rounded-xl text-red-300 shadow-lg">
                  <MicOff className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          {/* Remote Video Frame */}
          <div className="relative aspect-[4/3] bg-white/[0.025] backdrop-blur-3xl rounded-3xl overflow-hidden border-t border-white/20 border-x border-white/10 border-b border-black/70 shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] shadow-emerald-500/10">
            {/* Top Light Catching Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-30" />

            {remoteStream ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={currentVideoFilterStyle}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {showCropGuide && (
                  <ViewfinderGuide label={`${partnerName}'s Safe Zone`} />
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/80 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-zinc-400 animate-pulse shadow-inner">
                  <Users className="w-7 h-7 text-emerald-400/90" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                  Waiting for {partnerName} to join...
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-3.5">
                  Share Room Code <span className="text-emerald-400 font-mono font-bold">{roomId}</span>
                </p>
                <button
                  onClick={copyRoomLink}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-zinc-200 flex items-center gap-2 transition-all hover:border-white/25 shadow-lg"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Invitation'}</span>
                </button>
              </div>
            )}

            {remoteStream && (
              <div className="absolute top-3.5 left-3.5 z-30 bg-black/60 backdrop-blur-2xl px-3 py-1.5 rounded-full text-xs font-medium border-t border-white/25 border-x border-white/10 border-b border-black/60 flex items-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]"></span>
                <span className="text-zinc-200 font-medium">{partnerName}</span>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Filter & Theme Floating Drawer Popup */}
      <AnimatePresence>
        {showFilterDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="relative z-30 max-w-md mx-auto mb-3 p-3.5 bg-zinc-950/70 border-t border-white/25 border-x border-white/10 border-b border-black/70 rounded-3xl backdrop-blur-3xl shadow-[0_25px_50px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col gap-2.5"
          >
            {/* Filters */}
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-emerald-400" /> Filter:
              </span>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'vintage', label: 'Vintage' },
                  { id: 'grayscale', label: 'B&W' },
                  { id: 'noir', label: 'Noir' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      activeFilter === f.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/[0.06]">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-emerald-400" /> Theme:
              </span>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'cream', label: 'Cream' },
                  { id: 'charcoal', label: 'Dark' },
                  { id: 'blush', label: 'Blush' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTheme(t.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      activeTheme === t.id
                        ? 'bg-white text-zinc-950 font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Glassmorphism Dock */}
      <footer className="relative z-20 flex items-center justify-center pb-2 sm:pb-3">
        <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-950/65 border-t border-white/25 border-x border-white/10 border-b border-black/80 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] shadow-emerald-500/10 backdrop-blur-3xl">
          
          {/* Left Controls: Mic, Cam, Crop Guide */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleAudio}
              title={isMuted ? 'Unmute' : 'Mute'}
              className={`p-3 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-t border-white/15 border-white/5 shadow-inner'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleVideo}
              title={isVideoOff ? 'Camera On' : 'Camera Off'}
              className={`p-3 rounded-full transition-all ${
                isVideoOff
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-t border-white/15 border-white/5 shadow-inner'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowCropGuide((prev) => !prev)}
              title={showCropGuide ? 'Hide Viewfinder Guides' : 'Show Viewfinder Guides'}
              className={`p-3 rounded-full transition-all ${
                showCropGuide
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-t border-white/15 border-white/5 shadow-inner'
              }`}
            >
              <Scan className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Central Prominent Glowing Gem Shutter Button */}
          <div className="relative flex items-center justify-center mx-1">
            {/* Outer soft ambient pulse */}
            <motion.span
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.35, 0.7, 0.35]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute w-16 h-16 rounded-full bg-emerald-500/30 blur-md pointer-events-none"
            />
            
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(16,185,129,0.5), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 6px rgba(0,0,0,0.5)',
                  '0 0 42px rgba(16,185,129,0.85), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 6px rgba(0,0,0,0.5)',
                  '0 0 20px rgba(16,185,129,0.5), inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 6px rgba(0,0,0,0.5)'
                ]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              onClick={() => triggerMultiShot(4, 3, 2)}
              disabled={isCountingDown}
              title="Take 4-Shot Strip"
              className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-300 border border-white/40 flex items-center justify-center disabled:opacity-50 group cursor-pointer"
            >
              {/* Inner Gem Facet */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400/40 via-teal-500/20 to-emerald-950/60 backdrop-blur-sm flex items-center justify-center border-t border-white/60 border-b border-black/40 group-hover:from-emerald-400/60 transition-all">
                <Camera className="w-6 h-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform" />
              </div>
            </motion.button>
          </div>

          {/* Right Controls: Filters, Fullscreen & Leave */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowFilterDrawer((prev) => !prev)}
              title="Filters & Themes"
              className={`p-3 rounded-full transition-all flex items-center gap-1 ${
                showFilterDrawer
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_18px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-t border-white/15 border-white/5 shadow-inner'
              }`}
            >
              <Palette className="w-4 h-4" />
            </motion.button>

            {/* Fullscreen Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className={`p-3 rounded-full transition-all flex items-center justify-center ${
                isFullscreen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-t border-white/15 border-white/5 shadow-inner'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={leaveRoom}
              title="Leave Room"
              className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-full transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            >
              <PhoneOff className="w-4 h-4" />
            </motion.button>
          </div>

        </div>
      </footer>

      {/* Preview Modal */}
      {showModal && (
        <PhotoModal
          imageSrc={capturedImage}
          onClose={() => setShowModal(false)}
          onRetake={handleRetake}
          stickers={stickers}
          onAddSticker={addSticker}
          onMoveSticker={moveSticker}
          onRemoveSticker={removeSticker}
          onClearStickers={clearStickers}
          onGenerateDecoratedDownload={handleGenerateDecoratedDownload}
        />
      )}
    </motion.div>
  );
}
