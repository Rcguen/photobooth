# 📸 Long-Distance Photobooth & Cinema 🎬

> **A real-time synchronized photobooth, watch-party cinema, and 3D memory gallery designed for long-distance couples and close friends.**  
> Bridge the distance with seamless peer-to-peer video calling, synchronized countdown photo captures, live collaborative sticker decorating, synchronized video streaming, and an immersive 3D gallery.

---

## 🌟 Key Features

- 📹 **Real-Time WebRTC Video Calling**:
  - Low-latency peer-to-peer (P2P) video streaming powered by **PeerJS** and a dedicated **Socket.io** signaling server.
  - Comprehensive global STUN/TURN fallback network (OpenRelay UDP, TCP, and TLS) ensuring rock-solid connectivity across carrier firewalls and mobile networks (4G/5G).
- 🎞️ **Synchronized Photobooth Strips (True 1:1 Aspect Ratio)**:
  - Custom camera viewports calibrated to real vertical photobooth strip proportions (`aspect-[438/620.5]`).
  - Synchronized countdown sound effects and flash visual cues triggered simultaneously for both participants.
  - Automatic composition into high-resolution multi-frame photobooth strips.
- ✨ **Live Collaborative Sticker Decorating**:
  - Interactive sticker palette with touch-optimized targets for both mobile and desktop.
  - Drag, drop, scale, and rotate emojis directly onto the photo strip with live positional synchronization between partners.
- 🎨 **3D Interactive Memory Gallery**:
  - Built with **Three.js** and **React Three Fiber (@react-three/fiber, @react-three/drei)**.
  - Orbit, inspect, and reminisce over past photo strips suspended in an interactive 3D virtual exhibition.
- 🎬 **Couple Cinema (Movie Room)**:
  - Watch videos together in real time.
  - Playback actions (play, pause, seek) are synchronized instantly across both participants.
- 🔒 **Cloud Authentication & Media Vault**:
  - Frictionless **Google Sign-In** via Firebase Authentication, specially hardened for mobile browser popups.
  - Permanent strip storage hosted on **Cloudinary**, with metadata and history indexed in **Cloud Firestore**.
- 📱 **Clean Dark Glass Aesthetic & Mobile Optimization**:
  - Elegant, minimal "Clean Dark Glass" design system built with Tailwind CSS.
  - Uses dynamic viewports (`100dvh`) and safe-area padding to avoid browser address bar cutoffs on iOS Safari and Android Chrome.
  - Tuned for buttery-smooth performance, even on budget and low-end mobile devices.

---

## 📁 Project Structure

```plaintext
photobooth/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # VideoRoom, PhotoModal, Gallery3D, MovieRoom, RoomJoin
│   │   ├── context/            # WebRTCContext (P2P, Socket.io, synchronized capture)
│   │   ├── utils/              # Canvas strip rendering, shutter/countdown audio helpers
│   │   ├── firebase.js         # Firebase Authentication, Firestore & Cloudinary setup
│   │   ├── App.jsx             # Top Navigation bar, route persistence & view switcher
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Signaling Server (Node.js + Express + Socket.io)
│   ├── index.js                # Room management, WebRTC signaling & peer coordination
│   └── package.json
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js**: Version 18.x or 20.x or higher.
- **npm** (or **yarn** / **pnpm**).
- A device with a working **Webcam / Camera** and **Microphone**.

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rcguen/photobooth.git
cd photobooth
```

### 2. Install all dependencies

Install dependencies for both client and server from the root directory:

```bash
npm run install:all
```

*(Alternatively, install each workspace individually:)*
```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 3. Environment Variables (Optional for Local Development)

#### 🔸 Client Configuration (`client/.env`):
Create a `client/.env` file if you are pointing to a custom remote backend:
```env
# Signaling server URL (defaults to http://localhost:5000 if omitted)
VITE_BACKEND_URL=http://localhost:5000

# Shared Vault ID for Firestore storage
VITE_SHARED_VAULT_ID=rk-permanent-vault

# Custom TURN server credentials (optional)
# VITE_TURN_SERVER_URL=
# VITE_TURN_USERNAME=
# VITE_TURN_CREDENTIAL=
```

#### 🔸 Server Configuration (`server/.env`):
Create a `server/.env` file:
```env
PORT=5000
```

---

## 💻 Running the Application

### Option A: Running concurrently from root (Recommended)

Open two terminal windows:

- **Terminal 1** (Start Signaling Server):
  ```bash
  npm run server
  ```
  *Signaling server runs on `http://localhost:5000`*

- **Terminal 2** (Start Frontend Client):
  ```bash
  npm run client
  ```
  *Client web app runs on `http://localhost:5173`*

### Option B: Running individually

- **Backend:**
  ```bash
  cd server
  npm run dev
  ```

- **Frontend:**
  ```bash
  cd client
  npm run dev
  ```

---

## 📖 Step-by-Step Usage Guide

1. **Open the App:**
   - Navigate to `http://localhost:5173` (or your deployed URL).
   - Grant **Camera & Microphone** permissions when prompted by your browser.

2. **Sign In:**
   - Click **"Sign in with Google"**.
   - Your account is automatically initialized upon successful authentication.

3. **Join a Photobooth Room:**
   - Enter a shared **Room ID** (e.g., `LOVE-SANCTUARY`) on both devices.
   - Click **"Enter Private Sanctuary"**.
   - Once both partners join, the room status will update to **Connected** (green badge), and both live camera feeds will display side-by-side.

4. **Take Photobooth Shots:**
   - Once connected, the shutter button at the bottom dock becomes active.
   - Click the **Shutter** button: a synchronized 3-second audio countdown triggers on both screens.
   - Following a screen flash, both camera feeds are captured and merged into a vertical photobooth strip.

5. **Decorate with Stickers & Download:**
   - In the post-capture preview dialog, tap any sticker emoji from the tray to place it on the strip.
   - Drag stickers to reposition them; changes replicate live to your partner's screen.
   - Click **"Download Strip"** to save the final composite image, or click **"Retake"** to snap another strip.

6. **Switch Experiences:**
   - **🎬 Cinema:** Click the **Cinema** tab in the top header to stream and watch synced videos together.
   - **🎨 3D Gallery:** Click the **Gallery** tab to explore your shared collection of photobooth memories in an interactive 3D virtual gallery.

---

## 🌐 Deployment Guide

### Deploying the Client (Frontend):
- Supported platforms: [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [Firebase Hosting].
- Set **Root Directory** to `client`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Set the environment variable: `VITE_BACKEND_URL` pointing to your deployed backend URL (using `https://`).

### Deploying the Server (Signaling Backend):
- Supported platforms: [Render](https://render.com), [Railway](https://railway.app), [Fly.io], or any VPS (Ubuntu/Docker).
- Set **Root Directory** to `server`.
- Start Command: `node index.js`.

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide Icons |
| **3D Rendering** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Realtime WebRTC & Sockets** | WebRTC, PeerJS, Socket.io-client |
| **Authentication & Database** | Firebase Authentication, Cloud Firestore |
| **Cloud Storage** | Cloudinary REST API |
| **Signaling Backend** | Node.js, Express, Socket.io |

---

## 💖 Contributing & License

Created with care for long-distance relationships. Contributions, feature requests, and issue reports are always welcome via GitHub Issues and Pull Requests!
