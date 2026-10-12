# DoomBrake - PRD & Mission Breakdown

## 1. Overview & Problem Statement

### Overview

**DoomBrake** adalah aplikasi mobile pengukur dan pengontrol waktu _doomscrolling_ yang dirancang khusus untuk mendeteksi, memantau, dan membatasi konsumsi video pendek di platform **Instagram Reels** dan **TikTok**.

### Problem Statement

Pengguna smartphone sering terjebak dalam siklus _doomscrolling_ (menonton video pendek berdurasi singkat secara terus-menerus tanpa sadar) pada Instagram Reels dan TikTok. Hal ini menguraangi produktivitas, mengganggu pola tidur, dan menurunkan rentang perhatian (_attention span_). Aplikasi _Screen Time_ bawaan OS terlalu umum dan tidak memberikan peringatan waktu nyata (_real-time nudge_) saat pengguna sedang aktif berada di dalam _feed_ video pendek.

### Core Value Proposition

- **Real-Time Floating Doom-Timer**: Overlay waktu melayang langsung di atas aplikasi TikTok/Instagram yang menghitung durasi _scrolling_ secara _real-time_.
- **Targeted Micro-Tracking**: Membedakan penggunaan aplikasi biasa (misal: membalas DM Instagram) dengan aktivitas _doomscrolling_ (Reels/TikTok Feed).
- **Friction-Based Intervention**: Memberikan interupsi bertahap (peringatan halus, layar redup, hingga pemblokiran sementara) untuk memutus dopamin loop.

---

## 2. Target User & Persona

### Primary Audience

- **Gen Z & Milenial (Usia 15–35 tahun)** yang merasa kehilangan waktu berjam-jam setiap hari karena _doomscrolling_.
- **Profesional & Pelajar** yang membutuhkan fokus tinggi dan ingin mengurangi distraksi media sosial di jam kerja/belajar.

### Key Persona

- **Nama**: Rizky (24 tahun, Software Engineer)
- **Pola Perilaku**: Membuka Instagram/TikTok "hanya untuk 5 menit" saat istirahat, namun berlanjut hingga 1,5 jam tanpa sadar.
- **Kebutuhan**: Pengingat visual yang tidak mematikan HP secara drastis, tetapi cukup mengganggu (_interrupted friction_) agar ia sadar dan berhenti secara sukarela.

---

## 3. Core Features (Scope for MVP)

### 1. App & Screen Detection Service

- **Deskripsi**: Layanan di latar belakang (_background service_) yang mendeteksi saat TikTok atau Instagram sedang dibuka di _foreground_.
- **Acceptance Criteria**:
  - Menggunakan Android Accessibility API / UsageStatsManager untuk mendeteksi nama paket aplikasi (`com.zhiliaoapp.musically` untuk TikTok dan `com.instagram.android` untuk Instagram).
  - Memulai _timer_ otomatis ketika aplikasi target dibuka dan menghentikannya (_pause_) saat aplikasi ditutup/berpindah.

### 2. Live Floating Overlay Widget ("Doom-Widget")

- **Deskripsi**: Widget melayang kecil dan semi-transparan yang muncul di pojok layar saat TikTok atau Reels aktif.
- **Acceptance Criteria**:
  - Menampilkan penghitung waktu mundur atau berjalan (contoh: "14m 20s scroll").
  - Warna widget berubah secara bertahap: Hijau (0-15m), Kuning (15-30m), Merah (>30m).
  - Posisi widget dapat digeser (_draggable_) agar tidak mengganggu UI penting Instagram/TikTok.

### 3. Interruption & Nudge System

- **Deskripsi**: Mekanisme interupsi saat pengguna melewati batas waktu harian atau sesi (_session threshold_).
- **Acceptance Criteria**:
  - **Level 1 (Soft Nudge)**: Notifikasi getar + warna overlay merah terang pada 15 menit.
  - **Level 2 (Hard Interruption)**: Pop-up layar penuh (_Full-screen takeover_) pada 30 menit yang memaksa pengguna mengonfirmasi "Lanjut Scroll" atau "Keluar Aplikasi".

### 4. Daily Analytics Dashboard

- **Deskripsi**: Halaman utama aplikasi yang menampilkan ringkasan statistik harian dan mingguan.
- **Acceptance Criteria**:
  - Grafik batang menampilkan total durasi _doomscrolling_ per hari.
  - Pembagian durasi antara TikTok vs Instagram Reels.
  - Informasi "Waktu Diselamatkan" (_Time Saved_) jika pengguna berhasil berhenti sebelum batas waktu.

---

## 4. Non-Goals & Out of Scope (MVP Boundaries)

- **Tidak Ada Dukungan iOS di MVP**: Karena keterbatasan API Accessibility & Overlay pada iOS, MVP difokuskan 100% pada platform Android.
- **Tidak Ada Content/AI Video Analysis**: Aplikasi tidak menganalisis isi konten video yang ditonton pengguna.
- **Tidak Ada Fitur Social/Leaderboard**: Belum ada fitur kompetisi atau membagikan statistik ke teman pada versi awal.
- **Tidak Ada Hard Parental Lock**: MVP tidak menggunakan PIN/Password yang tidak bisa dibuka sama sekali (fokus pada kesadaran diri/mindfulness, bukan penguncian mutlak).

---

## 5. Recommended Tech Stack & Architecture

- **Framework**: React Native (dengan Bare Workflow / Custom Dev Client) atau Flutter.
  - _Rekomendasi Agent_: **React Native + TypeScript** untuk kecepatan pembuatan UI dan integrasi Native Modules.
- **State Management**: Zustand / Redux Toolkit.
- **Local Storage**: MMKV (untuk penyimpanan log waktu yang sangat cepat dan ringan).
- **Android Native Modules (Java/Kotlin)**:
  - `UsageStatsManager` / `AccessibilityService` (Untuk mendeteksi app foreground & event kelakuan UI).
  - `SYSTEM_ALERT_WINDOW` permission (Untuk menggambar Overlay UI di atas aplikasi lain).
- **Styling**: NativeWind (Tailwind CSS untuk React Native) atau StyleSheets.
- **Charts**: `react-native-svg-charts` atau `victory-native`.

---

## 6. Actionable Implementation Tasks (Step-by-Step)

Berikut adalah urutan tugas terstruktur yang dirancang untuk dieksekusi oleh AI Agent / Software Engineer:

```
[Task 1: Project Initialization & Boilerplate]
       │
       ▼
[Task 2: Native Android Permission & Tracking Bridge]
       │
       ▼
[Task 3: Core Tracking & Timer State Engine]
       │
       ▼
[Task 4: Floating Overlay Widget Implementation]
       │
       ▼
[Task 5: Interruption Modal System]
       │
       ▼
[Task 6: Dashboard & Analytics UI]
```

### Task 1: Project Initialization & Architecture Setup

- **Objective**: Menginisialisasi proyek React Native dengan TypeScript, mengonfigurasi prapemrosesan CSS, dan struktur folder.
- **Key Files/Components**:
  - `package.json`
  - `src/navigation/ AppNavigator.tsx`
  - `src/store/useDoomStore.ts`
  - `tailwind.config.js` / NativeWind configuration
- **Verification/Done Criteria**: Aplikasi berhasil di-build dan berjalan di Android Emulator/Device dengan navigasi tab dasar.

### Task 2: Android Native Tracking Module (Accessibility / UsageStats)

- **Objective**: Membuat Android Native Module (Java/Kotlin) untuk mendeteksi apakah aplikasi TikTok (`com.zhiliaoapp.musically`) atau Instagram (`com.instagram.android`) sedang aktif di foreground.
- **Key Files/Components**:
  - `android/app/src/main/java/com/doombrake/TrackingModule.kt`
  - `android/app/src/main/java/com/doombrake/TrackingService.kt`
  - `src/native/TrackingBridge.ts`
- **Verification/Done Criteria**: Console log di JavaScript menerima event _real-time_ `APP_OPENED` dan `APP_CLOSED` beserta nama paket aplikasi ketika pengguna membuka/menutup TikTok atau Instagram.

### Task 3: Timer & Local Storage State Engine

- **Objective**: Mengimplementasikan logika perhitungan waktu sesi, penyimpanan data harian menggunakan MMKV, dan kalkulasi ambang batas waktu.
- **Key Files/Components**:
  - `src/services/StorageService.ts`
  - `src/store/useTimerStore.ts`
  - `src/utils/timeFormatters.ts`
- **Verification/Done Criteria**: Waktu membalas penambahan detik secara akurat saat app target aktif, ter-pause saat app non-aktif, dan data terarsip berdasarkan tanggal (`YYYY-MM-DD`).

### Task 4: Floating Overlay Screen ("Doom-Widget")

- **Objective**: Mengimplementasikan _Floating Overlay Window_ menggunakan izin `SYSTEM_ALERT_WINDOW` Android yang menampilkan waktu _scrolling_ secara melayang di atas TikTok/Instagram.
- **Key Files/Components**:
  - `android/app/src/main/java/com/doombrake/OverlayService.kt`
  - `src/components/overlay/FloatingTimerView.tsx`
- **Verification/Done Criteria**: Timer melayang muncul secara otomatis di atas aplikasi TikTok/Instagram, dapat digeser dengan gestur drag, dan warnanya berubah sesuai durasi _doomscrolling_.

### Task 5: Interruption & Hard Stop Trigger

- **Objective**: Membuat sistem dialog peringatan/interupsi yang muncul ketika pengguna melebihi batas waktu sesi (misal: 15m & 30m).
- **Key Files/Components**:
  - `src/components/modals/InterruptionModal.tsx`
  - `src/services/InterruptionManager.ts`
- **Verification/Done Criteria**: Saat timer menyentuh batas 30 menit, layar interupsi penuh langsung menutupi screen, memaksa interaksi pengguna sebelum dapat kembali mengakses HP.

### Task 6: Analytics Dashboard UI & History

- **Objective**: Membangun antarmuka utama aplikasi untuk menampilkan grafik statistik harian, pemisahan platform, dan pengaturan ambang batas waktu (_threshold settings_).
- **Key Files/Components**:
  - `src/screens/DashboardScreen.tsx`
  - `src/screens/SettingsScreen.tsx`
  - `src/components/dashboard/DailyChart.tsx`
  - `src/components/dashboard/StatCard.tsx`
- **Verification/Done Criteria**: Dashboard berhasil merefleksikan data dari MMKV dalam bentuk grafik bar dan kartu statistik dengan fungsionalitas pengubahan limit waktu yang bekerja secara dinamis.
