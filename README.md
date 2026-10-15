# 📸 Long-Distance Photobooth & Cinema 🎬

> **Ứng dụng Photobooth & Rạp Chiếu Phim Đôi Thời Gian Thực Dành Cho Cặp Đôi Yêu Xa**  
> Kết nối khoảng cách với trải nghiệm gọi video call p2p, đếm ngược chụp ảnh đồng bộ, trang trí sticker trực tiếp, xem phim chung và triển lãm kỷ niệm 3D sống động.

---

## 🌟 Tính Năng Nổi Bật

- 📹 **Real-time WebRTC Video Call**:
  - Kết nối trực tiếp P2P độ trễ thấp thông qua PeerJS và máy chủ Signaling (Socket.io).
  - Tích hợp mạng lưới STUN/TURN quốc tế (OpenRelay UDP/TCP/TLS), vượt qua mọi rào cản firewall hoặc mạng di động (4G/5G).
- 🎞️ **Photobooth Strip Đồng Bộ 1:1**:
  - Hai camera căn chuẩn tỷ lệ dải photobooth thực tế (`aspect-[438/620.5]`).
  - Đếm ngược âm thanh và chụp ảnh đồng bộ thời gian thực cho cả 2 người chỉ với 1 cú click.
  - Tự động ghép thành dải ảnh phim lưu niệm chuyên nghiệp.
- ✨ **Trang Trí Sticker Thời Gian Thực (Live Decorated Strip)**:
  - Bảng sticker emoji đa dạng, kích thước tối ưu cho cả cảm ứng điện thoại và chuột máy tính.
  - Kéo thả tự do, phóng to, xoay và đồng bộ vị trí sticker tức thì với bạn gái/bạn trai bên kia đầu cầu.
- 🎨 **Triển Lãm Kỷ Niệm 3D (3D Interactive Gallery)**:
  - Trưng bày các dải ảnh kỷ niệm trong không gian 3D lãng mạn xây dựng bằng Three.js / React Three Fiber.
  - Hỗ trợ xoay camera, tương tác và chiêm ngưỡng từng khoảnh khắc đáng nhớ.
- 🎬 **Rạp Chiếu Phim Đôi (Movie Room / Cinema)**:
  - Xem video cùng nhau với khả năng đồng bộ trạng thái phát (Play, Pause, Seek) theo thời gian thực.
- 🔒 **Xác Thực & Lưu Trữ Đám Mây**:
  - Đăng nhập bảo mật qua Google (Firebase Authentication), hỗ trợ tối ưu trên trình duyệt di động.
  - Lưu trữ dải ảnh vĩnh viễn trên Cloudinary và đồng bộ dữ liệu qua Cloud Firestore.
- 📱 **Giao Diện Clean Dark Glass & Tối Ưu Mọi Thiết Bị**:
  - Thiết kế tối giản, hiện đại theo phong cách Clean Dark Glass.
  - Sử dụng Dynamic Viewport (`100dvh`) và padding an toàn tránh bị che bởi thanh điều hướng trên điện thoại (iOS Safari, Android Chrome).
  - Tối ưu hóa hiệu năng mượt mà cho cả máy tính và các dòng điện thoại cấu hình khiêm tốn.

---

## 📁 Cấu Trúc Dự Án

```plaintext
photobooth/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Các màn hình chính (VideoRoom, PhotoModal, Gallery3D, MovieRoom, RoomJoin)
│   │   ├── context/            # WebRTCContext quản lý kết nối P2P, Socket.io, đếm ngược & chụp ảnh
│   │   ├── utils/              # Tiện ích xử lý ảnh dải phim, âm thanh shutter, countdown
│   │   ├── firebase.js         # Cấu hình Firebase & Cloudinary
│   │   ├── App.jsx             # Điều hướng Navigation Bar & layout chính
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Signaling Server (Node.js + Express + Socket.io)
│   ├── index.js                # Server xử lý ghép phòng, định tuyến tín hiệu WebRTC giữa 2 người
│   └── package.json
├── package.json                # Quản lý scripts chạy đồng thời client và server
└── README.md
```

---

## 🛠️ Yêu Cầu Hệ Thống

- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên.
- **npm** (hoặc **yarn** / **pnpm**).
- Thiết bị có **Camera** và **Microphone** (hỗ trợ cấp quyền trên trình duyệt web).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Tải mã nguồn về máy

```bash
git clone https://github.com/Rcguen/photobooth.git
cd photobooth
```

### 2. Cài đặt các gói phụ thuộc (Dependencies)

Bạn có thể cài đặt cho cả Client và Server chỉ với một câu lệnh tại thư mục gốc:

```bash
npm run install:all
```

*(Hoặc cài đặt thủ công từng phần:)*
```bash
# Cài đặt server
cd server && npm install

# Cài đặt client
cd ../client && npm install
```

### 3. Cấu hình biến môi trường (Environment Variables)

#### 🔸 Phía Client (`client/.env` - Tùy chọn nếu chạy môi trường khác `localhost`):
Tạo file `client/.env` nếu cần tuỳ chỉnh địa chỉ server hoặc STUN/TURN:
```env
# Địa chỉ Signaling Server (mặc định trỏ về http://localhost:5000 nếu không thiết lập)
VITE_BACKEND_URL=http://localhost:5000

# ID phòng lưu trữ kỷ niệm chung
VITE_SHARED_VAULT_ID=rk-permanent-vault

# Cấu hình TURN Server bổ sung (nếu có riêng)
# VITE_TURN_SERVER_URL=
# VITE_TURN_USERNAME=
# VITE_TURN_CREDENTIAL=
```

#### 🔸 Phía Server (`server/.env` - Tùy chọn):
Tạo file `server/.env`:
```env
PORT=5000
```

---

## 💻 Khởi Chạy Dự Án

### Cách 1: Chạy song song từ thư mục gốc (Khuyên dùng)

Mở 2 cửa sổ dòng lệnh (Terminal):

- **Terminal 1** (Chạy Signaling Server):
  ```bash
  npm run server
  ```
  *Server sẽ khởi động tại `http://localhost:5000`*

- **Terminal 2** (Chạy Client Frontend):
  ```bash
  npm run client
  ```
  *Client sẽ khởi động tại `http://localhost:5173`*

### Cách 2: Chạy trực tiếp từ từng thư mục con

- **Khởi động Server:**
  ```bash
  cd server
  npm run dev
  ```

- **Khởi động Client:**
  ```bash
  cd client
  npm run dev
  ```

---

## 📖 Hướng Dẫn Sử Dụng Chi Tiết

1. **Truy cập ứng dụng:**
   - Mở trình duyệt và truy cập `http://localhost:5173` (hoặc tên miền nếu đã deploy).
   - Hãy cấp quyền **Cho phép sử dụng Camera và Micro** khi trình duyệt yêu cầu.

2. **Đăng nhập:**
   - Nhấn **"Sign in with Google"** để đăng nhập.
   - Ứng dụng tự động kích hoạt tài khoản ngay lần đầu đăng nhập.

3. **Vào phòng Photobooth đôi:**
   - Nhập cùng một **Mã phòng (Room ID)** (ví dụ: `LOVE-ROOM`) cho cả 2 người.
   - Nhấn **"Enter Private Sanctuary"**.
   - Khi cả 2 người cùng vào phòng, trạng thái sẽ chuyển sang **Connected** (màu xanh lá) và màn hình hiển thị song song 2 camera.

4. **Chụp ảnh Photobooth:**
   - Khi đã kết nối, nút chụp ảnh ở thanh công cụ dưới cùng sẽ được mở khóa.
   - Bấm nút **Chụp**: Hệ thống sẽ phát âm thanh đếm ngược 3 giây cho cả 2 bên cùng tạo dáng.
   - Sau hiệu ứng chớp sáng (flash), dải ảnh sẽ tự động được ghép lại và hiển thị lên màn hình xem trước.

5. **Trang trí Sticker & Tải ảnh về:**
   - Tại màn hình xem trước, bấm vào các biểu tượng cảm xúc trong thanh **Stickers** để dán lên dải ảnh.
   - Kéo thả sticker đến vị trí mong muốn; người yêu bên kia cũng sẽ thấy sticker di chuyển theo thời gian thực.
   - Nhấn **"Download Strip"** để lưu dải ảnh kỷ niệm độ nét cao về máy, hoặc **"Retake"** để chụp lại.

6. **Khám phá các tính năng khác:**
   - **🎬 Cinema (Rạp phim đôi):** Chuyển sang tab **Cinema** ở thanh điều hướng trên cùng để cùng xem video đồng bộ.
   - **🎨 3D Gallery (Phòng tranh 3D):** Chuyển sang tab **Gallery** để dạo bước trong phòng trưng bày các dải ảnh đã chụp dưới dạng 3D tương tác.

---

## 🌐 Hướng Dẫn Triển Khai (Deployment)

### Phía Frontend (Client):
- Có thể deploy dễ dàng lên [Vercel](https://vercel.com), [Netlify](https://netlify.com) hoặc [Firebase Hosting].
- Đặt `Root Directory` là `client`.
- Lệnh build: `npm run build`.
- Thư mục output: `dist`.
- Cấu hình Environment Variable: `VITE_BACKEND_URL` trỏ tới URL server backend của bạn (dùng giao thức `https://`).

### Phía Backend (Signaling Server):
- Có thể deploy lên [Render](https://render.com), [Railway](https://railway.app), [Fly.io] hoặc VPS.
- Đặt `Root Directory` là `server`.
- Lệnh start: `node index.js`.

---

## 🧰 Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ chính |
|---|---|
| **Frontend Core** | React 18, Vite |
| **Giao diện & Chuyển động** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Đồ họa 3D** | Three.js, @react-three/fiber, @react-three/drei |
| **Realtime & P2P** | WebRTC, PeerJS, Socket.io-client |
| **Xác thực & Database** | Firebase Authentication, Cloud Firestore |
| **Lưu trữ ảnh** | Cloudinary REST API |
| **Backend Signaling** | Node.js, Express, Socket.io |

---

## 💖 Tác Quyền & Đóng Góp

Dự án được xây dựng với tình yêu dành cho các cặp đôi yêu xa. Mọi đóng góp, báo lỗi hoặc ý tưởng phát triển tính năng mới đều được hoan nghênh qua GitHub Issues và Pull Requests!
