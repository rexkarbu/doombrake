# 🛑 DoomBrake

> **Real-Time Doomscrolling Limiter & Reel Counter for Instagram Reels & TikTok**

DoomBrake adalah aplikasi mobile pengukur dan pengontrol waktu *doomscrolling* yang dirancang khusus untuk mendeteksi, memantau, menandai jumlah video pendek yang di-scroll, dan membatasi konsumsi video pendek secara *real-time* di platform **Instagram Reels** dan **TikTok**.

---

## 🚀 Fitur Unggulan

1. **🎬 Penghitung Scroll Real-Time (*Scroll & Video Reel Counter*)**:
   - Menghitung dan menandai setiap kali pengguna berpindah (*swipe*) ke video berikutnya.
   - Menampilkan tanda interaktif `🎬 Video ke-X` dan banner pop-up kesadaran diri.
2. **📱 Pil Timer Mengambang (*Draggable Floating Pill Overlay*)**:
   - Widget melayang (*always-on-top*) yang terus mengikuti di atas layar Instagram Reels & TikTok.
   - Indikator warna dinamis: Hijau (<15m), Kuning (15-30m), Merah (>30m).
3. **⚡ Sistem Interupsi Bertingkat (*Mindful Friction Engine*)**:
   - **Level 1 (Soft Nudge)**: Banner peringatan berdenyut kuning halus di menit ke-15.
   - **Level 2 (Hard Takeover)**: Pop-up layar penuh di menit ke-30 dengan *friction countdown lock* 3 detik untuk memecah siklus scrolling otomatis.
4. **📊 Analytics Dashboard**:
   - Grafik riwayat mingguan 7 hari (proporsi TikTok vs Reels).
   - Rata-rata durasi detik per pergantian video.
   - Estimasi *Time Saved* dibanding kuota harian.
5. **🌐 Simulator Interaktif Web**:
   - Tersedia online di **[https://reel-lilac.vercel.app](https://reel-lilac.vercel.app)**.

---

## 📥 Download Aplikasi Android (APK)

Anda dapat mengunduh rilis binary APK terbaru langsung dari halaman GitHub Releases:

👉 **[Download APK Terbaru di GitHub Releases](https://github.com/rexkarbu/doombrake/releases)**

### Cara Instalasi di HP Android:
1. Unduh file `DoomBrake-Release.apk` dari rilis di atas.
2. Buka file APK dan izinkan *"Install Unknown Apps"* (*Pasang aplikasi tidak dikenal*).
3. Buka DoomBrake, masuk ke menu **Settings**, lalu aktifkan:
   - **Accessibility Service**: Untuk mendeteksi saat Instagram Reels atau TikTok dibuka.
   - **Display over other apps**: Untuk menampilkan pil timer melayang.
   - **Battery Optimization Whitelist**: Agar Android tidak mematikan service di background.

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend / UI**: React 18, React Native for Web, TypeScript, Vite, Zustand
- **Native Android Engine**:
  - `TrackingService.kt`: Android Accessibility Service (`TYPE_VIEW_SCROLLED`, `TYPE_WINDOW_CONTENT_CHANGED`)
  - `OverlayService.kt`: Android Foreground Service (`SYSTEM_ALERT_WINDOW`, Draggable WindowManager)
  - `TrackingModule.kt`: React Native Java/Kotlin Bridge & DeviceEventManagerModule
- **CI / CD Pipeline**:
  - **Vercel**: Web Simulator hosting di [https://reel-lilac.vercel.app](https://reel-lilac.vercel.app)
  - **GitHub Actions**: Otomatis kompilasi APK dan publikasi GitHub Release setiap push ke branch `main`.

---

## 💻 Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/rexkarbu/doombrake.git
cd doombrake

# Install dependencies
npm install

# Jalankan Web Simulator
npm run dev

# Jalankan Unit Tests (14 passing tests)
npm test

# Build Web Bundle
npm run build
```

---

## 📄 Lisensi
ISC License © 2026 DoomBrake Team
