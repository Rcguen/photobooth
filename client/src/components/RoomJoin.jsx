import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, ArrowRight, ShieldCheck, Heart, LogOut, Lock, UserCheck, ShieldAlert } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { SHARED_VAULT_ID } from '../context/WebRTCContext';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function RoomJoin({ onJoin }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const isAuthorized = ALLOWED_EMAILS.length === 0 || (user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase()));

  const handleEnterStudio = () => {
    if (user && isAuthorized) {
      onJoin({
        roomId: SHARED_VAULT_ID,
        localName: user.displayName || 'Ritchi',
        userId: user.uid
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full flex items-center justify-center p-4 text-zinc-100 select-none">
      {/* Centered Glassmorphic Card (Design+Code Floating Card) */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-zinc-900/70 via-zinc-900/50 to-zinc-950/80 backdrop-blur-3xl border-t border-white/25 border-x border-white/10 border-b border-black/80 rounded-3xl p-7 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] shadow-emerald-500/10"
      >
        {/* Top Light Catching Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Brand Icon & Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="relative mb-4 cursor-pointer"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/25 to-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)] backdrop-blur-xl">
              <Camera className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
            </span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Long-Distance Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-normal max-w-xs leading-relaxed">
            Private synchronized studio & cinematic room for two.
          </p>
        </div>

        {/* Auth Section / Profile Card */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">Verifying secure session...</span>
          </div>
        ) : !user ? (
          /* Google Sign In Call to Action */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <Lock className="w-5 h-5 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Sign in with Google to protect your photos, sync strips, and unlock the private cinema.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
                {authError}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="relative w-full py-3.5 px-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 text-white font-semibold text-sm border-t border-white/25 border-x border-white/10 border-b border-black/70 shadow-[0_12px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <GoogleIcon />
              <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </motion.button>
          </div>
        ) : (
          /* Authenticated State: Profile Card & Room Form */
          <div className="space-y-5">
            {/* Glass Profile Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border-t border-white/20 border-x border-white/5 border-b border-black/50 shadow-inner">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-emerald-400/40 shadow-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate block">
                      {user.displayName || 'Authenticated User'}
                    </span>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block font-mono">
                    {user.email}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors flex-shrink-0"
                title="Switch Account / Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Access State: Authorized vs Unauthorized */}
            {!isAuthorized ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center">
                  <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-xs font-bold text-amber-300 mb-1">Private Couple Sanctuary</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    This studio is reserved exclusively for authorized accounts. Please sign in with the designated couple email address to enter.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
                >
                  Switch Account
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
                    <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>Synchronized Private Studio</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Both devices connect to the persistent sanctuary automatically.
                  </p>
                </div>

                {/* Primary Action Button (Enter Our Studio) */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnterStudio}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-2xl text-sm transition-all shadow-[0_12px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer group"
                >
                  <span className="tracking-tight">Enter Our Studio</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Footer info badge */}
        <div className="mt-7 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Authenticated • Cloudinary Storage</span>
        </div>
      </motion.div>
    </div>
  );
}