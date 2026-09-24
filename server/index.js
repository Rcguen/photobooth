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

// Track sockets to peer IDs and room IDs
const socketToPeer = new Map();
const socketToRoom = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // User joins a photobooth room
  socket.on('join-room', ({ roomId, peerId }) => {
    if (!roomId || !peerId) {
      console.warn(`[Join-Room Failed] Missing roomId or peerId from socket ${socket.id}`);
      return;
    }

    socketToPeer.set(socket.id, peerId);
    socketToRoom.set(socket.id, roomId);

    socket.join(roomId);
    console.log(`[User Joined] Peer: ${peerId} joined Room: ${roomId} (Socket: ${socket.id})`);

    // Notify other peers in the room that a new user connected
    socket.to(roomId).emit('user-connected', { peerId });
  });

  // Synchronized 4-shot photobooth sequence trigger
  socket.on('start-multi-shot', ({ roomId, totalShots = 4, initialDuration = 3, intervalDuration = 2 }) => {
    if (!roomId) return;
    console.log(`[Multi-Shot Sequence Started] Room: ${roomId}, Total Shots: ${totalShots}`);
    io.in(roomId).emit('multi-shot-started', { totalShots, initialDuration, intervalDuration });
  });

  // URL Sync Mode Events (Weak Network Fallback)
  socket.on('sync-video-url', ({ roomId, url }) => {
    if (!roomId) return;
    console.log(`[URL Sync] Room: ${roomId}, New URL: ${url}`);
    socket.to(roomId).emit('video-url-synced', { url });
    socket.to(roomId).emit('sync-url-received', { url });
  });

  socket.on('sync-url', ({ roomId, url }) => {
    if (!roomId) return;
    console.log(`[URL Sync] Room: ${roomId}, New URL: ${url}`);
    socket.to(roomId).emit('video-url-synced', { url });
    socket.to(roomId).emit('sync-url-received', { url });
  });

  socket.on('sync-play', ({ roomId, currentTime }) => {
    if (!roomId) return;
    socket.to(roomId).emit('video-play-synced', { currentTime });
  });

  socket.on('sync-pause', ({ roomId, currentTime }) => {
    if (!roomId) return;
    socket.to(roomId).emit('video-pause-synced', { currentTime });
  });

  socket.on('sync-seek', ({ roomId, currentTime }) => {
    if (!roomId) return;
    socket.to(roomId).emit('video-seek-synced', { currentTime });
  });

  socket.on('sync-buffering', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('video-buffering-synced', { from: socket.id });
  });

  socket.on('sync-canplay', ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit('video-canplay-synced', { from: socket.id });
  });

  // Handle peer disconnection
  socket.on('disconnect', () => {
    const peerId = socketToPeer.get(socket.id);
    const roomId = socketToRoom.get(socket.id);

    if (roomId && peerId) {
      console.log(`[User Left] Peer: ${peerId} disconnected from Room: ${roomId}`);
      socket.to(roomId).emit('user-disconnected', { peerId });
    }

    socketToPeer.delete(socket.id);
    socketToRoom.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Signaling server is listening on http://localhost:${PORT}`);
});
