# DoomBrake: Task Master Plan & Progress Tracker

Dokumen ini berisi rincian seluruh tugas implementasi aplikasi **DoomBrake** (Real-Time Doomscrolling Limiter untuk Instagram Reels dan TikTok). Setiap tugas dirinci dengan tujuan, file terkait, kriteria keberhasilan (*acceptance criteria*), dan status penyelesaian.

---

## Ringkasan Progres Utama

| Task | Modul / Fitur | Status | File Kunci |
|---|---|---|---|
| **Task 1** | Inisialisasi Proyek & Arsitektur | Selesai | [package.json](file:///d:/project/reel/package.json), [AppNavigator.tsx](file:///d:/project/reel/src/navigation/AppNavigator.tsx) |
| **Task 2** | Native Android Tracking Bridge | Selesai | [TrackingService.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/TrackingService.kt), [TrackingBridge.ts](file:///d:/project/reel/src/native/TrackingBridge.ts) |
| **Task 3** | Timer & Storage State Engine | Selesai | [useTimerStore.ts](file:///d:/project/reel/src/store/useTimerStore.ts), [StorageService.ts](file:///d:/project/reel/src/services/StorageService.ts) |
| **Task 4** | Floating Overlay Widget ("Doom-Widget") | Selesai | [OverlayService.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/OverlayService.kt), [FloatingTimerView.tsx](file:///d:/project/reel/src/components/overlay/FloatingTimerView.tsx) |
| **Task 5** | Interruption & Hard Takeover System | Selesai | [InterruptionManager.ts](file:///d:/project/reel/src/services/InterruptionManager.ts), [InterruptionModal.tsx](file:///d:/project/reel/src/components/modals/InterruptionModal.tsx) |
| **Task 6** | Dashboard & Analytics UI | Selesai | [DashboardScreen.tsx](file:///d:/project/reel/src/screens/DashboardScreen.tsx), [DailyChart.tsx](file:///d:/project/reel/src/components/dashboard/DailyChart.tsx) |

---

## Rincian Task Breakdown

### Task 1: Project Initialization & Architecture Setup
**Tujuan**: Menyiapkan fondasi aplikasi React Native + TypeScript, konfigurasi tema (*dark/light mode*), dan navigasi tab.

- [x] **1.1 Konfigurasi Lingkungan & Dependensi**
  - Menginisialisasi `package.json` dengan React 18, React Native Web, TypeScript, Vite, dan Vitest.
  - File: [package.json](file:///d:/project/reel/package.json), [tsconfig.json](file:///d:/project/reel/tsconfig.json), [vite.config.ts](file:///d:/project/reel/vite.config.ts)
- [x] **1.2 Sistem Desain & Token Warna**
  - Membuat pedoman warna (Obsidian Dark & Crisp Light), warna ambang batas (Emerald, Amber, Ruby Red), serta aturan kontras WCAG AA.
  - File: [DESIGN.md](file:///d:/project/reel/DESIGN.md), [theme.ts](file:///d:/project/reel/src/styles/theme.ts), [tailwind.config.js](file:///d:/project/reel/tailwind.config.js)
- [x] **1.3 State Management & Navigasi Utama**
  - Membuat store Zustand terpusat untuk state navigasi, tema, dan izin.
  - Membuat navigasi tab bawah (*Dashboard*, *Simulator*, *Settings*) dengan target sentuh ergonomis (minimal 44px).
  - File: [useDoomStore.ts](file:///d:/project/reel/src/store/useDoomStore.ts), [AppNavigator.tsx](file:///d:/project/reel/src/navigation/AppNavigator.tsx), [App.tsx](file:///d:/project/reel/src/App.tsx)

---

### Task 2: Android Native Tracking Module (Accessibility & UsageStats)
**Tujuan**: Mendeteksi saat aplikasi TikTok (`com.zhiliaoapp.musically`) atau Instagram (`com.instagram.android`) aktif di foreground, membedakan feed Reels dengan aktivitas biasa.

- [x] **2.1 Konfigurasi Android Manifest & Permissions**
  - Mendeklarasikan izin `PACKAGE_USAGE_STATS`, `SYSTEM_ALERT_WINDOW`, `BIND_ACCESSIBILITY_SERVICE`, dan `FOREGROUND_SERVICE`.
  - File: [AndroidManifest.xml](file:///d:/project/reel/android/app/src/main/AndroidManifest.xml), [accessibility_service_config.xml](file:///d:/project/reel/android/app/src/main/res/xml/accessibility_service_config.xml)
- [x] **2.2 Layanan Deteksi Accessibility (Kotlin)**
  - Mengimplementasikan `AccessibilityService` untuk memantau event pergantian jendela aktif (`TYPE_WINDOW_STATE_CHANGED`).
  - Menambahkan *micro-tracking* khusus Instagram untuk mendeteksi ID tampilan Reels (`clips_viewer`, `reel_viewer`).
  - File: [TrackingService.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/TrackingService.kt)
- [x] **2.3 React Native Module & TypeScript Bridge**
  - Membuat modul `TrackingModule.kt` dan package `DoomBrakePackage.kt`.
  - Mengirim event real-time `APP_OPENED` dan `APP_CLOSED` ke JavaScript.
  - File: [TrackingModule.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/TrackingModule.kt), [DoomBrakePackage.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/DoomBrakePackage.kt), [TrackingBridge.ts](file:///d:/project/reel/src/native/TrackingBridge.ts)
- [x] **2.4 Pengujian Otomatis Bridge**
  - File Pengujian: [TrackingBridge.test.ts](file:///d:/project/reel/tests/TrackingBridge.test.ts) (4 pengujian lulus)

---

### Task 3: Timer & Local Storage State Engine
**Tujuan**: Menghitung durasi sesi doomscrolling secara akurat, memastikan timer otomatis berhenti saat beralih aplikasi, dan mengarsipkan data harian.

- [x] **3.1 Layanan Penyimpanan Lokal Cepat (MMKV-Compatible)**
  - Menyimpan rekap durasi per hari, jumlah interupsi, dan waktu yang diselamatkan.
  - File: [StorageService.ts](file:///d:/project/reel/src/services/StorageService.ts)
- [x] **3.2 Mesin State Timer (`useTimerStore`)**
  - Menghitung detik aktif hanya ketika aplikasi target berada di foreground.
  - Otomatis pause saat pengguna berpindah ke home atau aplikasi non-target.
  - Mengarsipkan riwayat berdasarkan format tanggal `YYYY-MM-DD`.
  - File: [useTimerStore.ts](file:///d:/project/reel/src/store/useTimerStore.ts)
- [x] **3.3 Utilitas Kalkulasi Waktu & Tahapan**
  - Mengonversi format detik ke tampilan digital (`MM:SS`) dan teks ringkas (`14m 20s`).
  - Mengkalkulasi tahapan: Safe (0 sampai 15m), Warning (15 sampai 30m), Danger (>30m).
  - File: [timeFormatters.ts](file:///d:/project/reel/src/utils/timeFormatters.ts)
- [x] **3.4 Pengujian Unit Mesin Timer**
  - File Pengujian: [TimerEngine.test.ts](file:///d:/project/reel/tests/TimerEngine.test.ts) (5 pengujian lulus)

---

### Task 4: Floating Overlay Screen ("Doom-Widget")
**Tujuan**: Menampilkan widget waktu melayang di atas TikTok dan Instagram yang dapat digeser (*draggable*) dengan perubahan warna bertahap.

- [x] **4.1 Native Android Overlay Service (Kotlin)**
  - Layanan `WindowManager` berbasis `TYPE_APPLICATION_OVERLAY` untuk menggambar widget di atas aplikasi lain.
  - Mendukung drag gesture touch listener (`ACTION_DOWN`, `ACTION_MOVE`, `ACTION_UP`).
  - File: [OverlayService.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/OverlayService.kt)
- [x] **4.2 Komponen Widget Floating React Native**
  - Menampilkan timer berjalan (`14m 20s scroll`) dan lencana platform (TikTok/Reels).
  - Warna otomatis berubah: Hijau (0-15m), Kuning (15-30m), Merah (>30m).
  - Menggunakan `PanResponder` untuk interaksi geser yang mulus.
  - Tombol aksi cepat: minimalkan ukuran dan tombol henti sesi (*quick stop*).
  - File: [FloatingTimerView.tsx](file:///d:/project/reel/src/components/overlay/FloatingTimerView.tsx)

---

### Task 5: Interruption & Hard Stop Trigger System
**Tujuan**: Mekanisme friksi dopamin bertahap (peringatan halus pada 15 menit dan pemblokiran layar penuh pada 30 menit).

- [x] **5.1 Layanan Evaluasi Interupsi & Getaran Haptic**
  - Menentukan level interupsi dan memicu pola getaran (nudge lembut vs getaran ganda).
  - File: [InterruptionManager.ts](file:///d:/project/reel/src/services/InterruptionManager.ts)
- [x] **5.2 Level 1: Soft Nudge Banner (15 Menit)**
  - Banner peringatan kuning dengan indikator denyut (*pulse dot*) yang muncul di bagian atas tanpa menutup layar secara agresif.
  - File: [InterruptionModal.tsx](file:///d:/project/reel/src/components/modals/InterruptionModal.tsx)
- [x] **5.3 Level 2: Full-Screen Takeover Modal (30 Menit)**
  - Pop-up layar penuh yang menghentikan siklus scrolling.
  - Kunci friksi (*friction countdown lock*) selama 3 detik untuk mencegah tombol tertekan secara refleks.
  - Pilihan tindakan: **"Keluar Aplikasi (Rekomendasi)"** atau **"Lanjut Scroll (+5 Menit)"**.
  - File: [InterruptionModal.tsx](file:///d:/project/reel/src/components/modals/InterruptionModal.tsx)
- [x] **5.4 Pengujian Unit Sistem Interupsi**
  - File Pengujian: [InterruptionManager.test.ts](file:///d:/project/reel/tests/InterruptionManager.test.ts) (4 pengujian lulus)

---

### Task 6: Analytics Dashboard UI & Settings
**Tujuan**: Dashboard analitik untuk melihat ringkasan harian, grafik riwayat mingguan, pembagian platform, dan pengaturan ambang batas.

- [x] **6.1 Komponen Kartu Statistik Dinamis**
  - Menampilkan total konsumsi, persentase kuota harian, dan waktu diselamatkan (*time saved*).
  - File: [StatCard.tsx](file:///d:/project/reel/src/components/dashboard/StatCard.tsx)
- [x] **6.2 Grafik Bar Interaktif Riwayat 7 Hari**
  - Grafik batang bertumpuk (*stacked bar chart*) TikTok vs Instagram Reels.
  - Garis batas anggaran harian (*daily budget guideline*).
  - Pemilih hari interaktif untuk melihat detail waktu per tanggal.
  - File: [DailyChart.tsx](file:///d:/project/reel/src/components/dashboard/DailyChart.tsx)
- [x] **6.3 Halaman Utama Dashboard**
  - Menyatukan banner sesi aktif, grafik harian, dan ringkasan interupsi.
  - File: [DashboardScreen.tsx](file:///d:/project/reel/src/screens/DashboardScreen.tsx)
- [x] **6.4 Halaman Pengaturan (Threshold & Permissions)**
  - Mengubah ambang batas soft limit (10m, 15m, 20m), hard limit (25m, 30m, 45m), dan kuota harian (30m, 45m, 60m, 90m).
  - Status toggle izin Android (Usage Access, Accessibility, Overlay).
  - Pengalihan tema Gelap/Terang dan reset data.
  - File: [SettingsScreen.tsx](file:///d:/project/reel/src/screens/SettingsScreen.tsx)
- [x] **6.5 Simulator Interaktif untuk Testing**
  - Menyediakan simulator untuk membuka/menutup TikTok & Reels serta akselerator waktu (1x, 10x, 60x).
  - File: [SimulatorScreen.tsx](file:///d:/project/reel/src/screens/SimulatorScreen.tsx)

---

## Langkah Lanjutan / Roadmap Produksi

Tugas-tugas opsional untuk persiapan rilis final ke perangkat fisik Android:

- [x] **Task 7: Build & Packaging Android (APK / AAB)**
  - Konfigurasi Gradle wrapper (`gradlew`, `gradlew.bat`, `gradle-8.9-bin`) dan build pipeline (`build.gradle.kts`, `app/build.gradle.kts`).
  - Penandatanganan rilis (*Release Keystore signing*) via script otomatis [generate-keystore.bat](file:///d:/project/reel/scripts/generate-keystore.bat) & [generate-keystore.ps1](file:///d:/project/reel/scripts/generate-keystore.ps1).
  - Entrypoint native: [MainActivity.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/MainActivity.kt) & [MainApplication.kt](file:///d:/project/reel/android/app/src/main/java/com/doombrake/MainApplication.kt).
  - Tema, warna, dan ikon adaptif: [styles.xml](file:///d:/project/reel/android/app/src/main/res/values/styles.xml), [colors.xml](file:///d:/project/reel/android/app/src/main/res/values/colors.xml), [ic_launcher.xml](file:///d:/project/reel/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml).
  - Script build di `package.json`: `android:build-debug`, `android:build-release`, `android:bundle-release`.
  - Panduan build lengkap: [android/README.md](file:///d:/project/reel/android/README.md).
- [x] **Task 8: Pengujian Lapangan di Perangkat Nyata (Field Testing Checklist)**
  - Dokumentasi prosedur pengujian lapangan di [android/README.md](file:///d:/project/reel/android/README.md#5-panduan-pengujian-lapangan-di-perangkat-nyata-task-8-checklist).
  - Filter node Accessibility Service multi-heuristik (`clips_viewer`, `reel_viewer`, `reels_tab`, teks "Reels").
  - Whitelist Battery Optimization (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`) untuk keandalan service di Android OEM (Samsung/Xiaomi/Oppo).

