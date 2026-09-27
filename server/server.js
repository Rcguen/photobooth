import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Enable universal CORS for Express REST & preflight endpoints
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send({ status: 'Photobooth Signaling Server is running' });
});

// Socket.io initialization with open production CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Track sockets to peer IDs, room IDs, and per-room participants
const socketToPeer = new Map();
const socketToRoom = new Map();
const roomParticipants = new Map(); // roomId -> Map(socketId -> { peerId, uid, name, photo, socketId })

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // User joins a photobooth room
  socket.on('join-room', ({ roomId, peerId, uid, name, photo }) => {
    if (!roomId || !peerId) {
      console.warn(`[Join-Room Failed] Missing roomId or peerId from socket ${socket.id}`);
      return;
    }

    const normalizedRoom = roomId.trim().toUpperCase();

    socketToPeer.set(socket.id, peerId);
    socketToRoom.set(socket.id, normalizedRoom);

    if (!roomParticipants.has(normalizedRoom)) {
      roomParticipants.set(normalizedRoom, new Map());
    }
    const currentRoom = roomParticipants.get(normalizedRoom);

    // Get list of existing users in this room (excluding self)
    const existingUsers = Array.from(currentRoom.values()).filter((u) => u.socketId !== socket.id);

    // Add current user to room
    const userData = { peerId, uid, name, photo, socketId: socket.id };
    currentRoom.set(socket.id, userData);

    socket.join(normalizedRoom);
    console.log(`[User Joined] Peer: ${peerId}, UID: ${uid || 'N/A'}, Name: ${name || 'N/A'} joined Room: ${normalizedRoom} (Existing peers: ${existingUsers.length})`);

    // 1. Send existing users in the room to the newly joined client
    socket.emit('room-users', { users: existingUsers });

    // 2. Notify other peers in the room that a new user connected
    socket.to(normalizedRoom).emit('user-connected', userData);
  });

  // Synchronized 4-shot photobooth sequence trigger
  socket.on('start-multi-shot', ({ roomId, totalShots = 4, initialDuration = 3, intervalDuration = 2 }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    console.log(`[Multi-Shot Sequence Started] Room: ${normalizedRoom}, Total Shots: ${totalShots}`);
    io.in(normalizedRoom).emit('multi-shot-started', { totalShots, initialDuration, intervalDuration });
  });

  // URL Sync Mode Events (Weak Network Fallback)
  socket.on('sync-video-url', ({ roomId, url }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    console.log(`[URL Sync] Room: ${normalizedRoom}, New URL: ${url}`);
    socket.to(normalizedRoom).emit('video-url-synced', { url });
    socket.to(normalizedRoom).emit('sync-url-received', { url });
  });

  socket.on('sync-url', ({ roomId, url }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    console.log(`[URL Sync] Room: ${normalizedRoom}, New URL: ${url}`);
    socket.to(normalizedRoom).emit('video-url-synced', { url });
    socket.to(normalizedRoom).emit('sync-url-received', { url });
  });

  socket.on('sync-play', ({ roomId, currentTime }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    socket.to(normalizedRoom).emit('video-play-synced', { currentTime });
  });

  socket.on('sync-pause', ({ roomId, currentTime }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    socket.to(normalizedRoom).emit('video-pause-synced', { currentTime });
  });

  socket.on('sync-seek', ({ roomId, currentTime }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    socket.to(normalizedRoom).emit('video-seek-synced', { currentTime });
  });

  socket.on('sync-buffering', ({ roomId }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    socket.to(normalizedRoom).emit('video-buffering-synced', { from: socket.id });
  });

  socket.on('sync-canplay', ({ roomId }) => {
    if (!roomId) return;
    const normalizedRoom = roomId.trim().toUpperCase();
    socket.to(normalizedRoom).emit('video-canplay-synced', { from: socket.id });
  });

  // Handle peer disconnection
  socket.on('disconnect', () => {
    const peerId = socketToPeer.get(socket.id);
    const roomId = socketToRoom.get(socket.id);

    if (roomId) {
      const currentRoom = roomParticipants.get(roomId);
      if (currentRoom) {
        currentRoom.delete(socket.id);
        if (currentRoom.size === 0) {
          roomParticipants.delete(roomId);
        }
      }
      if (peerId) {
        console.log(`[User Left] Peer: ${peerId} disconnected from Room: ${roomId}`);
        socket.to(roomId).emit('user-disconnected', { peerId });
      }
    }

    socketToPeer.delete(socket.id);
    socketToRoom.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Signaling server is listening on http://localhost:${PORT}`);
});
