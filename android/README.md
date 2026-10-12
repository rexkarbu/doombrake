# DoomBrake Android Native Engine & Build Guide

Dokumentasi teknis arsitektur Android, konfigurasi build sistem, penandatanganan rilis (*Release Keystore signing*), dan panduan pengujian lapangan pada perangkat fisik.

---

## 1. Arsitektur Native Android

```
com.doombrake/
├── MainActivity.kt          # Entrypoint aktivitas React Native
├── MainApplication.kt      # Registrasi PackageList & DoomBrakePackage
├── DoomBrakePackage.kt     # ReactPackage penghubung modul Kotlin ke JS
├── TrackingModule.kt       # NativeModule: Bridge permissions, battery saver, dan event dispatch
├── TrackingService.kt      # AccessibilityService: Deteksi micro-tracking Instagram Reels & TikTok
└── OverlayService.kt       # Foreground Service: Floating timer pill melayang di atas aplikasi lain
```

### Komponen Utama:
1. **`TrackingService` (Accessibility Service)**:
   - Memantau `com.instagram.android` dan `com.zhiliaoapp.musically` (TikTok).
   - Melakukan inspeksi pohon node aksesibilitas secara spesifik:
     - View IDs: `clips_viewer`, `reel_viewer`, `reels_tab`, `clips_video_container`.
     - Teks: `"Reels"`.
   - Mengirim event real-time `APP_OPENED` & `APP_CLOSED` ke JavaScript runtime.

2. **`OverlayService` (Foreground Service)**:
   - Menampilkan pil timer mengambang (*floating pill*) yang dapat digeser (*draggable*) saat target app terbuka.
   - Menyesuaikan warna berdasarkan tingkat bahaya:
     - **Hijau**: 0 - 15 menit (Aman)
     - **Kuning**: 15 - 30 menit (Peringatan)
     - **Merah**: > 30 menit (Bahaya / Over Limit)

3. **`TrackingModule`**:
   - Memeriksa & meminta izin sistem: Usage Stats, Accessibility, Draw Over Other Apps (`SYSTEM_ALERT_WINDOW`), serta Whitelist Optimasi Baterai (`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`).

---

## 2. Prasyarat Lingkungan Build

- **Java Development Kit**: JDK 17 atau JDK 21 (direkomendasikan Eclipse Temurin 17 / Microsoft OpenJDK 17).
- **Android SDK**:
  - `compileSdkVersion`: 34 (Android 14)
  - `minSdkVersion`: 24 (Android 7.0)
  - `targetSdkVersion`: 34 (Android 14)
  - `buildToolsVersion`: 34.0.0
- **Gradle**: 8.9 (Otomatis ditangani oleh wrapper `gradlew`).

---

## 3. Konfigurasi Awal (Local Setup)

### A. Konfigurasi `local.properties`
Buka file `android/local.properties` dan pastikan path ke Android SDK sudah sesuai dengan komputer Anda:

```properties
## Contoh di Windows:
sdk.dir=C\:\\Users\\Dimuy\\AppData\\Local\\Android\\Sdk

## Contoh di macOS:
# sdk.dir=/Users/username/Library/Android/sdk

## Contoh di Linux:
# sdk.dir=/home/username/Android/Sdk
```

### B. Membuat Release Keystore
Jalankan salah satu perintah berikut dari root proyek:

**Opsi 1 (NPM Shortcut):**
```bash
npm run android:generate-keystore
```

**Opsi 2 (Batch script langsung):**
```bash
scripts\generate-keystore.bat
```

Script akan:
1. Membuat keystore RSA 2048-bit di `android/app/doombrake-release.keystore`.
2. Membuat file kredensial `android/keystore.properties` secara otomatis.
3. Menjamin file rahasia tetap aman dan tidak ter-commit ke git karena sudah terdaftar di `.gitignore`.

---

## 4. Perintah Kompilasi (Build)

### A. Build Debug APK
Untuk pengujian cepat pada emulator atau USB debugging:
```bash
npm run android:build-debug
```
*Output binary*: `android/app/build/outputs/apk/debug/app-debug.apk`

### B. Build Release APK (Standalone Signed)
Untuk instalasi langsung di smartphone Android fisik tanpa lewat Play Store:
```bash
npm run android:build-release
```
*Output binary*: `android/app/build/outputs/apk/release/app-release.apk`

### C. Build Android App Bundle (AAB untuk Google Play Store)
Untuk publikasi ke Google Play Console:
```bash
npm run android:bundle-release
```
*Output bundle*: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Panduan Pengujian Lapangan di Perangkat Nyata (Task 8 Checklist)

Saat melakukan instalasi pada ponsel Android fisik (Samsung, Xiaomi, Oppo, Pixel, dll.), lakukan pengujian berikut secara berurutan:

### Checklist 1: Alur Izin Sistem Android
- [ ] Buka DoomBrake, masuk ke menu **Settings**.
- [ ] Berikan izin **Accessibility Service** untuk `DoomBrake`.
- [ ] Berikan izin **Tampilkan di Atas Aplikasi Lain** (*Display over other apps*).
- [ ] Matikan **Battery Optimization** (Pilih "Tidak Dibatasi" / "Unrestricted") agar Android tidak mematikan service di background.

### Checklist 2: Uji Deteksi TikTok
- [ ] Buka aplikasi **TikTok**.
- [ ] Verifikasi bahwa pil floating timer DoomBrake langsung muncul di layar.
- [ ] Geser pil timer untuk memastikan fitur *drag and reposition* responsif.
- [ ] Tekan tombol Home / keluar dari TikTok; verifikasi pil timer langsung hilang.

### Checklist 3: Uji Deteksi Instagram Reels vs Feed Biasa
- [ ] Buka aplikasi **Instagram** di beranda Feed utama (foto & carousel).
- [ ] Pastikan timer **TIDAK** berjalan (karena bukan konsumsi video pendek Reels).
- [ ] Masuk ke tab **Reels** atau buka video Reels; verifikasi timer DoomBrake **aktif** dan mulai menghitung.
- [ ] Kembali ke Feed atau DM; verifikasi timer DoomBrake **berhenti/pause**.

### Checklist 4: Uji Level Interupsi (Soft & Hard Limit)
- [ ] Buka menu Simulator di DoomBrake dan gunakan akselerator waktu `10x` atau `60x`.
- [ ] Pada menit ke-15 (Soft Limit): Banner peringatan kuning muncul dengan lembut.
- [ ] Pada menit ke-30 (Hard Limit): Fullscreen takeover modal muncul dengan timer friksi 3 detik.
- [ ] Tombol "Keluar Aplikasi" memicu navigasi keluar dari short-form video.
