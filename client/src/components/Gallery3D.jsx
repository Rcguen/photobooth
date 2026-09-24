import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Sparkles, Html } from '@react-three/drei';
import StripMesh from './StripMesh';
import { useWebRTC } from '../context/WebRTCContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Camera,
  Layers,
  Sparkles as SparklesIcon,
  RotateCcw,
  RefreshCw,
  Cloud,
  Lock,
  Heart
} from 'lucide-react';

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-emerald-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider text-zinc-300">Loading 3D Photo Strip...</span>
      </div>
    </Html>
  );
}

export default function Gallery3D({ strips = [], onBackToBooth }) {
  const { vaultId, partnerName, localName, isConnected, savedStrips } = useWebRTC();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cloudStrips, setCloudStrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore Real-Time Data Hydration from Dynamic Relationship Vault
  useEffect(() => {
    if (!vaultId) {
      setCloudStrips([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const photosQuery = query(
      collection(db, 'vaults', vaultId, 'photos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      photosQuery,
      (snapshot) => {
        const fetchedUrls = snapshot.docs.map((doc) => doc.data().url).filter(Boolean);
        setCloudStrips(fetchedUrls);
        setLoading(false);
      },
      (err) => {
        console.warn('[Firestore Gallery Sync Error]:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vaultId]);

  // Merge Cloudinary/Firestore persistent URLs with local session strips
  const allStrips = useMemo(() => {
    const merged = [...cloudStrips, ...(strips || []), ...(savedStrips || [])];
    return Array.from(new Set(merged));
  }, [cloudStrips, strips, savedStrips]);

  const hasStrips = allStrips.length > 0;
  const currentStripUrl = hasStrips ? allStrips[currentIndex % allStrips.length] : null;

  const handleNext = () => {
    if (hasStrips) {
      setCurrentIndex((prev) => (prev + 1) % allStrips.length);
    }
  };

  const handlePrev = () => {
    if (hasStrips) {
      setCurrentIndex((prev) => (prev - 1 + allStrips.length) % allStrips.length);
    }
  };

  const handleDownload = () => {
    if (!currentStripUrl) return;
    const link = document.createElement('a');
    link.download = `photobooth-scrapbook-strip-${(currentIndex % allStrips.length) + 1}.png`;
    link.href = currentStripUrl;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="relative w-full h-screen bg-[#08080a] text-white select-none overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 md:px-8 border-b border-white/10 bg-zinc-950/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToBooth}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white transition-all border border-white/10 text-xs font-medium flex items-center gap-2"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Back to Photobooth</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-emerald-400" />
            <h1 className="text-sm font-bold tracking-tight text-white">
              3D Scrapbook Gallery
            </h1>
            {hasStrips && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
                {(currentIndex % allStrips.length) + 1} / {allStrips.length}
              </span>
            )}
          </div>
        </div>

        {/* Gallery Top Actions */}
        {hasStrips && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_10px_25px_rgba(16,185,129,0.35)] border border-emerald-400/30 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Strip</span>
            </button>
          </div>
        )}
      </header>

      {/* Main 3D Canvas Area */}
      <main className="relative flex-1 w-full h-full">
        {!vaultId ? (
          /* Waiting for Partner State */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-2xl">
                <Lock className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)]"></span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
              Waiting for partner to unlock shared memories...
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
              This 3D scrapbook is encrypted and uniquely tied to your couple relationship vault. Once {partnerName || 'your partner'} connects to the room, your shared memories will instantly decrypt and assemble in 3D.
            </p>
            <button
              onClick={onBackToBooth}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-2xl text-sm transition-all shadow-[0_12px_30px_rgba(16,185,129,0.35)] border border-emerald-400/30 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Return to Photobooth</span>
            </button>
          </div>
        ) : loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">Syncing 3D scrapbook from cloud...</span>
          </div>
        ) : hasStrips ? (
          <>
            <Canvas
              dpr={[1, 1.5]}
              performance={{ min: 0.5 }}
              camera={{ position: [0, 0, 5.2], fov: 48 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              gl={{ powerPreference: 'high-performance', antialias: true }}
            >
              {/* Soft, warm photobooth ambient lighting */}
              <ambientLight intensity={0.9} />

              {/* Main key spotlight */}
              <spotLight
                position={[4, 6, 5]}
                angle={0.5}
                penumbra={0.9}
                intensity={1.6}
              />

              {/* Cool emerald & warm rim lights */}
              <directionalLight position={[-3, -2, -3]} intensity={0.45} color="#10b981" />
              <directionalLight position={[3, -2, 2]} intensity={0.3} color="#14b8a6" />

              {/* Floating ambient sparkles (Optimized count for mobile GPU) */}
              <Sparkles
                count={22}
                scale={6}
                size={2.0}
                speed={0.25}
                color="#34d399"
                opacity={0.35}
              />

              {/* Soft baked floor shadow */}
              <ContactShadows
                position={[0, -2.4, 0]}
                opacity={0.55}
                scale={7}
                blur={2.0}
                far={3.5}
                resolution={512}
              />

              {/* 3D Strip Mesh */}
              <Suspense fallback={<Loader />}>
                <StripMesh key={currentStripUrl} textureUrl={currentStripUrl} />
              </Suspense>
            </Canvas>

            {/* Left / Right Strip Switchers */}
            {allStrips.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  title="Previous Strip"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 text-white border border-white/15 shadow-2xl backdrop-blur-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  title="Next Strip"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 text-white border border-white/15 shadow-2xl backdrop-blur-2xl transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Layers className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Strips in Gallery Yet</h2>
            <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
              Take some photos in the live photobooth room with your partner. They will be automatically saved to Cloudinary and rendered in 3D!
            </p>
            <button
              onClick={onBackToBooth}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-2xl text-sm transition-all shadow-[0_12px_30px_rgba(16,185,129,0.35)] border border-emerald-400/30 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Go to Photobooth</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Hint Banner */}
      {hasStrips && (
        <footer className="relative z-20 p-3 text-center text-xs text-zinc-400 bg-zinc-950/80 border-t border-white/10 backdrop-blur-2xl flex items-center justify-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Click & drag the strip to rotate and inspect in 3D • Synced with Cloudinary & Firestore</span>
        </footer>
      )}
    </div>
  );
}
