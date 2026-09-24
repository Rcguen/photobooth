import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { playCountdownBeep, playShutterSound } from '../utils/audioHelper';
import { auth, db, CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SIGNALING_SERVER_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:5000';
export const SHARED_VAULT_ID = import.meta.env.VITE_SHARED_VAULT_ID || 'rk-permanent-vault';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_SERVER_URL ? [{
    urls: import.meta.env.VITE_TURN_SERVER_URL,
    username: import.meta.env.VITE_TURN_USERNAME || '',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
  }] : [])
];

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
  const [roomId, setRoomId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Screen Sharing Streams
  const [localScreenStream, setLocalScreenStream] = useState(null);
  const [remoteScreenStream, setRemoteScreenStream] = useState(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const [socket, setSocket] = useState(null);

  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Names
  const [localName, setLocalName] = useState('Ritchi');
  const [partnerName, setPartnerName] = useState('Kristine');

  // Interactive Synchronized Stickers State
  const [stickers, setStickers] = useState([]);

  // Multi-shot state
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [currentShot, setCurrentShot] = useState(null);
  const [totalShots, setTotalShots] = useState(4);
  const [flashScreen, setFlashScreen] = useState(false);

  // Saved photobooth strips in session
  const [savedStrips, setSavedStrips] = useState([]);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const screenCallRef = useRef(null);
  const remoteScreenCallRef = useRef(null);
  const dataConnRef = useRef(null);
  const localStreamRef = useRef(null);
  const localScreenStreamRef = useRef(null);
  const localNameRef = useRef(localName);
  const remotePeerIdRef = useRef('');

  const timerRef = useRef(null);
  const onShotCallbackRef = useRef(null);
  const onSequenceCompleteCallbackRef = useRef(null);

  useEffect(() => {
    localNameRef.current = localName;
  }, [localName]);

  const registerMultiShotHandlers = useCallback(({ onShot, onComplete }) => {
    onShotCallbackRef.current = onShot;
    onSequenceCompleteCallbackRef.current = onComplete;
  }, []);

  const sendP2PMessage = useCallback((payload) => {
    if (dataConnRef.current && dataConnRef.current.open) {
      dataConnRef.current.send(payload);
    }
  }, []);

  const updateNames = useCallback((newLocalName, newPartnerName) => {
    if (newLocalName !== undefined) setLocalName(newLocalName);
    if (newPartnerName !== undefined) setPartnerName(newPartnerName);

    sendP2PMessage({
      type: 'NAME_SYNC',
      senderName: newLocalName || localNameRef.current
    });
  }, [sendP2PMessage]);

  const addSticker = useCallback((content, x = 0.5, y = 0.5) => {
    const newSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content,
      x,
      y,
      rotation: 0,
      scale: 1.0
    };

    setStickers((prev) => [...prev, newSticker]);
    sendP2PMessage({
      type: 'STICKER_ADDED',
      sticker: newSticker
    });
  }, [sendP2PMessage]);

  const moveSticker = useCallback((id, x, y, rotation, scale) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y, ...(rotation !== undefined && { rotation }), ...(scale !== undefined && { scale }) } : s))
    );

    sendP2PMessage({
      type: 'STICKER_MOVED',
      id,
      x,
      y,
      rotation,
      scale
    });
  }, [sendP2PMessage]);

  const removeSticker = useCallback((id) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    sendP2PMessage({
      type: 'STICKER_REMOVED',
      id
    });
  }, [sendP2PMessage]);

  const clearStickers = useCallback(() => {
    setStickers([]);
    sendP2PMessage({
      type: 'STICKERS_SYNC',
      stickers: []
    });
  }, [sendP2PMessage]);

  // Cloudinary Upload & Firestore Sync
  const saveStrip = useCallback(async (stripDataUrl, metadata = {}) => {
    // 1. Immediately update local state for responsive UI
    setSavedStrips((prev) => [stripDataUrl, ...prev]);

    // 2. Upload to Cloudinary via unsigned preset
    try {
      let blob;
      if (stripDataUrl instanceof Blob) {
        blob = stripDataUrl;
      } else {
        const res = await fetch(stripDataUrl);
        blob = await res.blob();
      }

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!cloudRes.ok) {
        throw new Error(`Cloudinary upload failed with status ${cloudRes.status}`);
      }

      const cloudData = await cloudRes.json();
      const secureUrl = cloudData.secure_url;

      if (!secureUrl) {
        throw new Error('No secure_url returned from Cloudinary');
      }

      console.log('[Cloudinary] Successfully uploaded photobooth strip:', secureUrl);

      // 3. Sync metadata and secure URL to Firestore under vaults/{SHARED_VAULT_ID}/photos
      const targetVaultId = SHARED_VAULT_ID;
      const photosRef = collection(db, 'vaults', targetVaultId, 'photos');

      await addDoc(photosRef, {
        url: secureUrl,
        createdAt: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        authorName: auth.currentUser?.displayName || localName || 'Guest',
        authorPhoto: auth.currentUser?.photoURL || null,
        names: `${localName} & ${partnerName}`,
        vaultId: targetVaultId,
        roomId: targetVaultId,
        ...metadata
      });

      console.log('[Firestore] Synced photo strip document to room collection:', targetRoomId);
      return secureUrl;
    } catch (err) {
      console.error('[Cloudinary/Firestore Sync Error]:', err);
    }
  }, [roomId, localName, partnerName]);

  // Setup PeerJS DataConnection handlers
  const setupDataConnection = useCallback((conn) => {
    dataConnRef.current = conn;

    conn.on('open', () => {
      conn.send({
        type: 'NAME_SYNC',
        senderName: localNameRef.current
      });
    });

    conn.on('data', (data) => {
      if (!data) return;

      if (data.type === 'NAME_SYNC' && data.senderName) {
        setPartnerName(data.senderName);
      } else if (data.type === 'STICKER_ADDED' && data.sticker) {
        setStickers((prev) => {
          if (prev.some((s) => s.id === data.sticker.id)) return prev;
          return [...prev, data.sticker];
        });
      } else if (data.type === 'STICKER_MOVED' && data.id) {
        setStickers((prev) =>
          prev.map((s) =>
            s.id === data.id
              ? {
                  ...s,
                  x: data.x,
                  y: data.y,
                  ...(data.rotation !== undefined && { rotation: data.rotation }),
                  ...(data.scale !== undefined && { scale: data.scale })
                }
              : s
          )
        );
      } else if (data.type === 'STICKER_REMOVED' && data.id) {
        setStickers((prev) => prev.filter((s) => s.id !== data.id));
      } else if (data.type === 'STICKERS_SYNC') {
        setStickers(data.stickers || []);
      }
    });

    conn.on('close', () => {
      console.log('[PeerJS DataChannel] Closed');
    });
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Screen Sharing Functions
  const stopScreenShare = useCallback(() => {
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current = null;
      setLocalScreenStream(null);
    }

    if (screenCallRef.current) {
      screenCallRef.current.close();
      screenCallRef.current = null;
    }

    setIsSharingScreen(false);
  }, []);

  const applyScreenSenderBitrateLimit = useCallback((call) => {
    if (!call || !call.peerConnection) return;
    const applyParameters = () => {
      try {
        const senders = call.peerConnection.getSenders();
        senders.forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            const params = sender.getParameters();
            if (!params.encodings || params.encodings.length === 0) {
              params.encodings = [{}];
            }
            // Strict 1.0 Mbps bitrate cap & 24fps limit to preserve connection stability
            params.encodings[0].maxBitrate = 1000000;
            params.encodings[0].maxFramerate = 24;
            sender.setParameters(params).catch((e) => {
              console.warn('[WebRTC] Error applying video sender bitrate cap:', e);
            });
          }
        });
      } catch (e) {
        console.warn('[WebRTC] Could not inspect senders for bitrate limit:', e);
      }
    };

    applyParameters();
    if (call.peerConnection) {
      call.peerConnection.addEventListener('connectionstatechange', () => {
        if (call.peerConnection.connectionState === 'connected') {
          applyParameters();
        }
      });
      call.peerConnection.addEventListener('negotiationneeded', () => {
        setTimeout(applyParameters, 400);
      });
    }
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { max: 1280 },
          height: { max: 720 },
          frameRate: { ideal: 24, max: 24 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      // Apply contentHint to prioritize smooth motion over static sharpness
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        if ('contentHint' in videoTrack) {
          videoTrack.contentHint = 'motion';
        }
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      const audioTrack = displayStream.getAudioTracks()[0];
      if (audioTrack && 'contentHint' in audioTrack) {
        audioTrack.contentHint = 'music';
      }

      localScreenStreamRef.current = displayStream;
      setLocalScreenStream(displayStream);
      setIsSharingScreen(true);

      // If connected with remote peer, initiate a second PeerJS call with metadata { type: 'screen' }
      if (peerRef.current && remotePeerIdRef.current) {
        try {
          const screenCall = peerRef.current.call(remotePeerIdRef.current, displayStream, {
            metadata: { type: 'screen' }
          });
          screenCallRef.current = screenCall;

          // Apply 1.0 Mbps bitrate throttling on video sender
          applyScreenSenderBitrateLimit(screenCall);

          screenCall.on('close', () => {
            screenCallRef.current = null;
          });

          screenCall.on('error', (err) => {
            console.warn('[WebRTC Screen Call Error]:', err);
            stopScreenShare();
          });
        } catch (callErr) {
          console.error('[WebRTC] Failed to call remote peer with screen stream:', callErr);
        }
      }
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
      stopScreenShare();
    }
  }, [stopScreenShare, applyScreenSenderBitrateLimit]);

  const triggerMultiShot = useCallback((shots = 4, initialDuration = 3, intervalDuration = 2) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('start-multi-shot', {
        roomId,
        totalShots: shots,
        initialDuration,
        intervalDuration
      });
    }
  }, [roomId]);

  const runMultiShotSequence = useCallback(({ totalShots: shots = 4, initialDuration = 3, intervalDuration = 2 }) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setIsCountingDown(true);
    setTotalShots(shots);

    let shotNum = 1;
    let secondsLeft = initialDuration;

    setCurrentShot(shotNum);
    setCountdown(secondsLeft);
    playCountdownBeep(880);

    timerRef.current = setInterval(() => {
      secondsLeft -= 1;

      if (secondsLeft > 0) {
        setCountdown(secondsLeft);
        playCountdownBeep(880);
      } else if (secondsLeft === 0) {
        setCountdown(0);
        setFlashScreen(true);
        playShutterSound();
        setTimeout(() => setFlashScreen(false), 250);

        if (onShotCallbackRef.current) {
          onShotCallbackRef.current(shotNum);
        }

        if (shotNum < shots) {
          shotNum += 1;
          secondsLeft = intervalDuration + 1;
          setTimeout(() => setCurrentShot(shotNum), 300);
        } else {
          clearInterval(timerRef.current);
          setTimeout(() => {
            setCountdown(null);
            setIsCountingDown(false);
            setCurrentShot(null);
            if (onSequenceCompleteCallbackRef.current) {
              onSequenceCompleteCallbackRef.current();
            }
          }, 600);
        }
      }
    }, 1000);
  }, []);

  // Initialize Room Connection
  useEffect(() => {
    if (!roomId) return;
    let isSubscribed = true;

    async function initConnection() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 },
            facingMode: 'user'
          },
          audio: true
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const peer = new Peer(undefined, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
          config: {
            iceServers: ICE_SERVERS,
            iceCandidatePoolSize: 10
          }
        });
        peerRef.current = peer;

        peer.on('connection', (conn) => {
          setupDataConnection(conn);
        });

        peer.on('open', (id) => {
          if (!isSubscribed) return;
          setPeerId(id);
          setIsPeerReady(true);

          const socket = io(SIGNALING_SERVER_URL, { transports: ['websocket', 'polling'] });
          socketRef.current = socket;
          setSocket(socket);

          socket.on('connect', () => {
            socket.emit('join-room', { roomId, peerId: id });
          });

          socket.on('multi-shot-started', ({ totalShots: shots, initialDuration, intervalDuration }) => {
            runMultiShotSequence({ totalShots: shots, initialDuration, intervalDuration });
          });

          socket.on('user-connected', ({ peerId: remoteId }) => {
            remotePeerIdRef.current = remoteId;
            setRemotePeerId(remoteId);

            // Call remote peer with local webcam stream
            const call = peer.call(remoteId, stream);
            currentCallRef.current = call;

            call.on('stream', (incomingStream) => {
              setRemoteStream(incomingStream);
              setIsConnected(true);
            });

            call.on('close', () => {
              setRemoteStream(null);
              setIsConnected(false);
            });

            // If we are already sharing screen, initiate a screen call as well
            if (localScreenStreamRef.current) {
              const screenCall = peer.call(remoteId, localScreenStreamRef.current, {
                metadata: { type: 'screen' }
              });
              screenCallRef.current = screenCall;
              applyScreenSenderBitrateLimit(screenCall);
            }

            const conn = peer.connect(remoteId);
            setupDataConnection(conn);
          });

          socket.on('user-disconnected', () => {
            if (currentCallRef.current) currentCallRef.current.close();
            if (screenCallRef.current) screenCallRef.current.close();
            if (dataConnRef.current) dataConnRef.current.close();
            remotePeerIdRef.current = '';
            setRemotePeerId('');
            setRemoteStream(null);
            setRemoteScreenStream(null);
            setIsConnected(false);
          });
        });

        // Answer incoming calls (Webcam or Screen)
        peer.on('call', (incomingCall) => {
          if (incomingCall.metadata && incomingCall.metadata.type === 'screen') {
            incomingCall.answer(); // Answer without attaching camera stream
            remoteScreenCallRef.current = incomingCall;

            incomingCall.on('stream', (incomingScreenStream) => {
              setRemoteScreenStream(incomingScreenStream);
            });

            incomingCall.on('close', () => {
              setRemoteScreenStream(null);
            });
          } else {
            incomingCall.answer(stream);
            currentCallRef.current = incomingCall;

            incomingCall.on('stream', (incomingStream) => {
              setRemoteStream(incomingStream);
              setIsConnected(true);
            });

            incomingCall.on('close', () => {
              setRemoteStream(null);
              setIsConnected(false);
            });
          }
        });

        peer.on('error', (err) => {
          console.error('PeerJS error:', err);
          setError(`PeerJS error: ${err.type || err.message}`);
        });

      } catch (err) {
        console.error('Media init error:', err);
        setError(err.name === 'NotAllowedError'
          ? 'Camera/microphone permissions were denied.'
          : `Media error: ${err.message}`);
      }
    }

    initConnection();

    return () => {
      isSubscribed = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.disconnect();
      if (currentCallRef.current) currentCallRef.current.close();
      if (screenCallRef.current) screenCallRef.current.close();
      if (remoteScreenCallRef.current) remoteScreenCallRef.current.close();
      if (dataConnRef.current) dataConnRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
      if (localScreenStreamRef.current) localScreenStreamRef.current.getTracks().forEach((t) => t.stop());

      setSocket(null);
      remotePeerIdRef.current = '';
      setRemotePeerId('');
      setLocalStream(null);
      setRemoteStream(null);
      setLocalScreenStream(null);
      setRemoteScreenStream(null);
      setIsSharingScreen(false);
      setIsConnected(false);
      setIsPeerReady(false);
      setIsCountingDown(false);
      setCountdown(null);
      setCurrentShot(null);
    };
  }, [roomId, runMultiShotSequence, setupDataConnection]);

  // Combined screenStream (whichever is active: local or remote)
  const screenStream = localScreenStream || remoteScreenStream;

  const leaveRoom = useCallback(() => {
    setRoomId('');
  }, []);

  const joinRoom = useCallback((id, name) => {
    if (name) setLocalName(name);
    setRoomId(id);
  }, []);

  const value = useMemo(() => ({
    roomId,
    setRoomId,
    joinRoom,
    leaveRoom,
    socket,
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    screenStream,
    isSharingScreen,
    startScreenShare,
    stopScreenShare,
    peerId,
    remotePeerId,
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
    savedStrips,
    saveStrip
  }), [
    roomId,
    joinRoom,
    leaveRoom,
    socket,
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    screenStream,
    isSharingScreen,
    startScreenShare,
    stopScreenShare,
    peerId,
    remotePeerId,
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
    savedStrips,
    saveStrip
  ]);

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
}
export { WebRTCContext };
