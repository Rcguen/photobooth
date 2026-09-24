import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebRTC } from '../context/WebRTCContext';
import {
  Tv,
  MonitorPlay,
  MonitorOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Volume2,
  Volume1,
  VolumeX,
  Sparkles,
  Heart,
  Users
} from 'lucide-react';

export default function MovieRoom() {
  const {
    screenStream,
    isSharingScreen,
    startScreenShare,
    stopScreenShare,
    localStream,
    remoteStream,
    localName,
    partnerName,
    isMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo
  } = useWebRTC();

  const screenVideoRef = useRef(null);
  const localPipRef = useRef(null);
  const remotePipRef = useRef(null);
  const cinemaContainerRef = useRef(null);

  const [isPipMinimized, setIsPipMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMutedAudio, setIsMutedAudio] = useState(false);
  const [movieVolume, setMovieVolume] = useState(0.8);

  // Sync volume state directly with HTML5 video element
  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.volume = isMutedAudio ? 0 : movieVolume;
    }
  }, [movieVolume, isMutedAudio, screenStream]);

  // Global Page Fullscreen Logic
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

  // Attach WebRTC screen share stream to main cinema player
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Attach webcam streams to PiP feeds
  useEffect(() => {
    if (localPipRef.current && localStream) {
      localPipRef.current.srcObject = localStream;
    }
  }, [localStream, isPipMinimized]);

  useEffect(() => {
    if (remotePipRef.current && remoteStream) {
      remotePipRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isPipMinimized]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-[calc(100dvh-5rem)] min-h-[500px] flex flex-col justify-between items-center p-2 sm:p-4 md:p-6 select-none overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-emerald-600/10 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-teal-500/10 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />

      {/* Main Cinematic Video Stage */}
      <div
        ref={cinemaContainerRef}
        className="relative z-10 w-full flex-1 flex items-center justify-center bg-zinc-950/80 border border-white/10 border-t-white/20 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl"
      >
        {screenStream ? (
          /* Active Screen Share View */
          <div className="relative w-full h-full flex items-center justify-center bg-black group overflow-hidden">
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted={isMutedAudio}
              className="w-full h-full object-contain max-h-full"
            />

            {/* Quick Floating Top Bar (Autohides, reveals on hover/touch) */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-2xl border border-white/10 border-t-white/20 text-[11px] sm:text-xs font-medium text-zinc-200 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                <span className="truncate max-w-[140px] sm:max-w-xs">
                  {isSharingScreen ? 'You are sharing screen' : `${partnerName}'s shared screen`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
                {/* Movie Volume Slider Control */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/10 border-t-white/20 text-zinc-300 backdrop-blur-2xl transition-all shadow-md">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMutedAudio(!isMutedAudio)}
                    className="text-zinc-300 hover:text-white transition-colors"
                    title={isMutedAudio ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMutedAudio || movieVolume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                    ) : movieVolume < 0.5 ? (
                      <Volume1 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    )}
                  </motion.button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMutedAudio ? 0 : movieVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setMovieVolume(val);
                      if (isMutedAudio && val > 0) {
                        setIsMutedAudio(false);
                      }
                    }}
                    className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                    title={`Movie Volume: ${Math.round((isMutedAudio ? 0 : movieVolume) * 100)}%`}
                  />
                  <span className="text-[10px] font-mono text-zinc-400 min-w-[28px] text-right hidden sm:inline">
                    {Math.round((isMutedAudio ? 0 : movieVolume) * 100)}%
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={toggleFullscreen}
                  className="p-2 sm:p-2.5 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-2xl transition-all shadow-md"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          /* Screen Share Empty State */
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-md w-full">
            <div className="relative mb-5 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border border-emerald-400/25 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.25)] backdrop-blur-2xl">
                <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />
              </div>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Ready for Movie Night?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed max-w-xs sm:max-w-sm">
              Share your browser tab or app window with audio to watch movies and videos in perfect sync with {partnerName}.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startScreenShare}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-[0_12px_30px_rgba(16,185,129,0.35)] border border-emerald-400/30 flex items-center gap-2.5 transition-all"
            >
              <MonitorPlay className="w-4 h-4" />
              <span>Start Screen Sharing</span>
            </motion.button>
          </div>
        )}

        {/* Responsive Draggable Picture-in-Picture (PiP) Webcams Overlay */}
        <motion.div
          drag
          dragConstraints={cinemaContainerRef}
          dragElastic={0.1}
          dragMomentum={false}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex flex-col gap-1.5 p-2 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 border-t-white/20 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.7)] cursor-grab active:cursor-grabbing select-none max-w-[90vw]"
        >
          <div className="flex items-center justify-between gap-2 px-1 pb-1 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 fill-emerald-400" />
              <span>Couples PiP</span>
            </div>
            <button
              onClick={() => setIsPipMinimized(!isPipMinimized)}
              className="text-[9px] sm:text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isPipMinimized ? 'Expand' : 'Hide'}
            </button>
          </div>

          <AnimatePresence>
            {!isPipMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-row gap-2 overflow-hidden pt-0.5"
              >
                {/* Local Webcam PiP */}
                <div className="relative w-20 h-14 sm:w-32 sm:h-20 md:w-36 md:h-24 bg-black/60 rounded-xl overflow-hidden border border-white/10 shadow-md flex items-center justify-center flex-shrink-0">
                  <video
                    ref={localPipRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover -scale-x-100 ${isVideoOff ? 'hidden' : 'block'}`}
                  />
                  {isVideoOff && (
                    <div className="text-[8px] sm:text-[10px] text-zinc-500 font-medium">Cam Off</div>
                  )}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[7px] sm:text-[9px] font-medium text-zinc-200 border border-white/10 truncate max-w-[80%]">
                    {localName} (You)
                  </div>
                  {isMuted && (
                    <div className="absolute top-1 right-1 p-0.5 bg-red-500/80 rounded-md text-white text-[7px] sm:text-[8px]">
                      <MicOff className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </div>
                  )}
                </div>

                {/* Remote Webcam PiP */}
                <div className="relative w-20 h-14 sm:w-32 sm:h-20 md:w-36 md:h-24 bg-black/60 rounded-xl overflow-hidden border border-white/10 shadow-md flex items-center justify-center flex-shrink-0">
                  {remoteStream ? (
                    <video
                      ref={remotePipRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-500 text-[8px] sm:text-[10px] p-1 text-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mb-0.5 sm:mb-1 text-emerald-400/70" />
                      <span className="truncate max-w-[65px] sm:max-w-none">{partnerName}...</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[7px] sm:text-[9px] font-medium text-zinc-200 border border-white/10 truncate max-w-[80%]">
                    {partnerName}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Bottom Cinema Toolbar */}
      <footer className="relative z-20 flex items-center justify-center pt-2 sm:pt-3">
        <div className="flex items-center gap-2 sm:gap-3.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-zinc-950/80 border border-white/10 border-t-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
          {/* Audio Mute */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-all border ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-white/5'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </motion.button>

          {/* Video Mute */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all border ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-white/5'
            }`}
            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </motion.button>

          {/* Fullscreen Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleFullscreen}
            className={`p-3 rounded-full transition-all border ${
              isFullscreen
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-white/5'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>

          {/* Primary Screen Share Action Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSharingScreen ? stopScreenShare : startScreenShare}
            className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs transition-all shadow-xl ${
              isSharingScreen
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-rose-500/40 border border-red-400/30'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.35)] border border-emerald-400/30'
            }`}
          >
            {isSharingScreen ? (
              <>
                <MonitorOff className="w-4 h-4" />
                <span className="hidden sm:inline">Stop Sharing</span>
                <span className="sm:hidden">Stop</span>
              </>
            ) : (
              <>
                <MonitorPlay className="w-4 h-4" />
                <span className="hidden sm:inline">Share Screen</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </motion.div>
  );
}