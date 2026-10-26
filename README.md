# 📅 Aplikasi Agenda Harian Kedinasan - MAN 1 Nganjuk

Aplikasi web manajemen agenda kegiatan madrasah terpadu, berbasis **Vite + React 19 + Tailwind CSS + Supabase Realtime + ExcelJS**. Dirancang khusus untuk memfasilitasi koordinasi Kepala Madrasah, Kepala Tata Usaha (KTU), para Wakil Kepala Madrasah (Waka), dan staf asisten dengan sistem proteksi PIN, deteksi jadwal bentrok, template cetak kedinasan resmi, ekspor Excel berseri, dan mode tayang Kiosk TV.

---

## 🌟 Fitur-Fitur Utama & Keunggulan

### 1. 🖨️ Template Cetak Agenda Kedinasan Resmi
Mendukung 3 format cetak standar instansi Kementerian Agama dengan Kop Surat resmi, logo madrasah, dan titimangsa tanda tangan otomatis:
- **Model A: Rekap Eksekutif Dinas**: Tabel formal rangkuman kegiatan untuk laporan dinas ke Kemenag atau pimpinan.
- **Model B: Matriks Mading Guru**: Format kartu ringkas dan jelas, ideal untuk ditempel di papan pengumuman ruang guru.
- **Model C: Notula Berita Acara**: Lembar kerja evaluasi per agenda, mencakup target peserta, deskripsi pelaksanaan, dan notula hasil kegiatan.
- **Kustomisasi Kop & Pejabat**: Pengaturan kop surat, alamat, kota titimangsa, dan nama/NIP penandatangan dapat diedit langsung di menu Pengaturan.

### 2. 📊 Template & Fitur Unduh Data (Excel Berwarna & CSV)
- **Ekspor Excel (.xlsx) Resmi**: Dokumen Excel terformat rapi dengan kop dinas, header hijau Kementerian Agama, garis batas (border) sel, auto-wrap text, dan lebar kolom otomatis via `exceljs`.
- **Ekspor CSV**: Format standar untuk analisis data atau integrasi spreadsheet lain.
- **Filter Periode Unduh**: Pilihan unduh Semua Data, Hari Ini, Pekan Ini, atau Bulan Ini.

### 3. 👥 Manajemen Nama Pejabat & NIP per Jabatan
- Setiap jabatan (Kepala Madrasah, KTU, Waka Akademik, Waka Kesiswaan, Waka Sarpras, Waka Kehumasan) dapat didaftarkan **Nama Lengkap & Gelar** serta **NIP**.
- Nama pejabat otomatis tampil di kartu agenda, rincian kegiatan, template cetak, dan berkas Excel hasil ekspor.

### 4. ⚡ Template Agenda Rutin (Input Cepat)
- Simpan template kegiatan rutin madrasah (misal: *Upacara Bendera Hari Senin*, *Rapat Koordinasi Pimpinan*, *Sholat Dhuha Berjamaah*, *Supervisi Kelas*, *Jumat Bersih*).
- Cukup pilih template saat menambah agenda, seluruh kolom (waktu, lokasi, kategori, deskripsi, peserta) otomatis terisi instan.

### 5. 📺 Mode Display Kiosk TV (Lobi & Ruang Guru)
- Mode layar penuh (*fullscreen*) resolusi tinggi dengan latar belakang gelap elegan dan jam digital live.
- Menyorot **Agenda Terdekat Berikutnya** dalam kartu besar beranimasi lembut.
- Menampilkan jadwal harian berjalan dengan badge status dinamis. Sangat cocok dipasang pada Smart TV di lobi madrasah atau ruang guru.

### 6. 📱 Integrasi WhatsApp (1-Klik Share)
- **Kirim Agenda Spesifik**: Tombol WhatsApp di setiap kartu agenda untuk meneruskan rincian kegiatan ke grup WhatsApp madrasah.
- **Kirim Rekap Harian**: Tombol di header untuk menyusun rangkuman seluruh agenda hari ini ke format pesan teks rapi dan membagikannya ke WhatsApp dalam satu ketukan.

### 7. ⏱️ Status Otomatis & Deteksi Bentrok Jadwal
- **Status Live**: Menghitung status kegiatan secara otomatis (*Terjadwal* ➔ *Sedang Berlangsung* ➔ *Sudah Terlaksana*) berdasarkan jam perangkat saat ini.
- **Deteksi Bentrok Cerdas**: Memperingatkan jika ada 2 kegiatan pada jam yang sama dengan penanggung jawab sama atau lokasi ruangan yang sama.

### 8. 🔒 Proteksi PIN 4-Digit per Jabatan
- Setiap profil jabatan dilindungi PIN 4-angka (default: `1234`).
- Pengguna hanya dapat menambah, mengubah, atau menghapus agenda yang menjadi kewenangan jabatannya. PIN dapat diubah mandiri per jabatan.

---

## 🚀 Panduan Instalasi & Setup Database

### Langkah 1: Setup Supabase Database
1. Buka dashboard proyek Supabase Anda: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Masuk ke menu **SQL Editor** pada bilah menu sebelah kiri.
3. Klik **New query**.
4. Salin dan tempel seluruh isi berkas [`supabase-schema.sql`](supabase-schema.sql) ke editor.
5. Klik tombol **Run** (atau tekan `Ctrl + Enter`).
6. Seluruh tabel (`agenda`, `role_pins`, `role_profiles`, `agenda_templates`), kebijakan RLS, dan replikasi Realtime akan otomatis aktif.

### Langkah 2: Menjalankan di Lokal (Development)
```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan server lokal
npm run dev
```
Akses aplikasi di browser melalui URL: `http://localhost:5173`.

---

## 📖 Panduan Penggunaan Aplikasi

### 1. Masuk & Ganti Jabatan
- Klik menu profil jabatan di pojok kanan atas atau sidebar.
- Pilih jabatan Anda (misal: *Kepala Madrasah* atau *Waka Kesiswaan*).
- Masukkan PIN 4-digit (PIN default awal: **`1234`**).
- Anda kini berhak mengelola agenda untuk jabatan tersebut.

### 2. Menambah Agenda Baru
- Klik tombol **+ Agenda Baru** di header.
- Anda dapat memilih **Template Cepat** di bagian atas formulir jika kegiatan merupakan rutinitas madrasah.
- Lengkapi tanggal, jam mulai/selesai, kategori, lokasi, peserta, dan tautan dokumen pendukung (Google Drive/PDF).
- Sistem otomatis memvalidasi potensi bentrok jadwal.

### 3. Mengatur Nama Pejabat & NIP
- Buka menu **Pengaturan** (ikon gerigi di sidebar).
- Pada tab **Profil Pejabat**, isi nama lengkap beserta gelar dan NIP untuk masing-masing jabatan.
- Klik **Simpan Profil Pejabat**. Data otomatis tersinkronisasi ke seluruh sistem.

### 4. Menggunakan & Mengubah Template
- Buka menu **Pengaturan** ➔ tab **Template Agenda**.
- Tambah atau edit template agenda rutin madrasah sesuai kebutuhan.

### 5. Mencetak Laporan & Dokumen
- Klik tombol **Cetak** (ikon printer) di header.
- Pilih template cetak yang diinginkan (**Rekap Eksekutif**, **Matriks Mading Guru**, atau **Notula Berita Acara**).
- Atur periode tanggal dan sesuaikan kop surat serta nama penandatangan bila diperlukan.
- Klik **Buka Jendela Cetak / Simpan PDF** (bisa langsung dicetak ke kertas fisik atau disimpan sebagai file PDF).

### 6. Mengekspor Data ke Excel
- Klik tombol **Ekspor** di header.
- Pilih format **Excel (.xlsx)** atau **CSV**.
- Tentukan cakupan data (Semua, Hari Ini, Pekan Ini, atau Bulan Ini).
- Klik **Unduh Berkas**.

### 7. Menampilkan Mode TV Lobi
- Klik tombol **Layar TV** di header atau sidebar.
- Tekan `F11` di keyboard browser untuk tampilan penuh (*True Fullscreen*).

---

## 🌐 Panduan Deploy ke Vercel

Aplikasi ini sudah siap langsung dideploy ke [Vercel](https://vercel.com):

1. **Push Proyek ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: setup agenda harian MAN 1 Nganjuk lengkap"
   git push -u origin main
   ```
2. **Impor ke Vercel**:
   - Masuk ke [dashboard Vercel](https://vercel.com/dashboard) dan klik **Add New Project**.
   - Pilih repositori `Hikam666/agenda-man1-nganjuk`.
3. **Environment Variables**:
   Pada pengaturan **Environment Variables** di Vercel, tambahkan dua kunci berikut:
   - `VITE_SUPABASE_URL`: `https://kxmebhhabhcykwnvcqed.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: *(masukkan anon key supabase Anda)*
4. Klik **Deploy**. Website akan aktif dalam hitungan detik dengan domain gratis HTTPS (misal: `https://agenda-man1-nganjuk.vercel.app`).
