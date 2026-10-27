import os
import sys
from fpdf import FPDF

class MadrasahGuidePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(left=20, top=20, right=20)
        
        # Color definitions
        self.C_DARK_GREEN = (6, 95, 70)      # Primary Kemenag Green #065f46
        self.C_EMERALD = (16, 185, 129)       # Accent Emerald #10b981
        self.C_SLATE = (30, 41, 59)          # Main text #1e293b
        self.C_MUTED = (100, 116, 139)       # Secondary text #64748b
        self.C_LIGHT_BG = (248, 250, 252)    # #f8fafc
        self.C_BOX_GREEN = (236, 253, 245)   # #ecfdf5
        self.C_BOX_AMBER = (254, 243, 199)   # #fef3c7
        self.C_LINE = (226, 232, 240)        # #e2e8f0

    def header(self):
        # Do not render header on Cover page (page 1)
        if self.page_no() == 1:
            return
        
        self.set_font("helvetica", "B", 8)
        self.set_text_color(*self.C_DARK_GREEN)
        self.cell(0, 5, "MAN 1 NGANJUK  |  PANDUAN APLIKASI AGENDA KEDINASAN TERPADU", align="L")
        self.ln(5)
        
        # Header separator line
        self.set_draw_color(*self.C_EMERALD)
        self.set_line_width(0.4)
        self.line(self.l_margin, self.get_y(), 210 - self.r_margin, self.get_y())
        self.ln(6)

    def footer(self):
        # Do not render footer on Cover page (page 1)
        if self.page_no() == 1:
            return
        
        self.set_y(-15)
        self.set_draw_color(*self.C_LINE)
        self.set_line_width(0.3)
        self.line(self.l_margin, self.get_y(), 210 - self.r_margin, self.get_y())
        
        self.set_font("helvetica", "I", 8)
        self.set_text_color(*self.C_MUTED)
        self.cell(100, 10, "Edisi Resmi 2026 - Kemenag Kab. Nganjuk", align="L")
        self.cell(0, 10, f"Halaman {self.page_no()}", align="R")

    def chapter_title(self, num_str, title_str):
        self.set_font("helvetica", "B", 13)
        self.set_text_color(*self.C_DARK_GREEN)
        
        # Chapter banner
        self.set_fill_color(240, 253, 244)
        self.set_draw_color(*self.C_DARK_GREEN)
        self.set_line_width(0.8)
        
        full_title = f"BAB {num_str} : {title_str.upper()}"
        self.cell(0, 9, f"  {full_title}", border="L", fill=True)
        self.ln(12)
        self.set_text_color(*self.C_SLATE)

    def section_title(self, title_str):
        self.set_font("helvetica", "B", 10.5)
        self.set_text_color(*self.C_DARK_GREEN)
        self.cell(0, 6, title_str)
        self.ln(7)
        self.set_text_color(*self.C_SLATE)

    def body_p(self, text):
        self.set_font("helvetica", "", 9.5)
        self.set_text_color(*self.C_SLATE)
        self.multi_cell(0, 5.2, text)
        self.ln(3)

    def bullet(self, bold_prefix, text):
        self.set_font("helvetica", "B", 9)
        self.set_text_color(*self.C_DARK_GREEN)
        bullet_char = "-"
        self.cell(5, 5, bullet_char)
        self.cell(self.get_string_width(bold_prefix) + 2, 5, bold_prefix)
        self.set_font("helvetica", "", 9)
        self.set_text_color(*self.C_SLATE)
        
        # Remaining width for text
        rem_w = 210 - self.l_margin - self.r_margin - 7 - (self.get_string_width(bold_prefix) + 2)
        if rem_w < 50:
            self.ln(5)
            self.set_x(self.l_margin + 7)
            self.multi_cell(0, 4.8, text)
        else:
            self.multi_cell(0, 4.8, text)
        self.ln(1.5)

    def callout(self, title, text, box_type="info"):
        bg_col = self.C_BOX_GREEN if box_type == "info" else self.C_BOX_AMBER
        border_col = self.C_DARK_GREEN if box_type == "info" else (180, 83, 9)
        title_col = self.C_DARK_GREEN if box_type == "info" else (146, 64, 14)

        cur_x = self.get_x()
        cur_y = self.get_y()
        w = 210 - self.l_margin - self.r_margin

        # Estimate height
        lines = len(text) // 85 + text.count('\n') + 2
        h = max(16, lines * 5 + 8)

        # Draw box
        self.set_fill_color(*bg_col)
        self.set_draw_color(*self.C_LINE)
        self.set_line_width(0.2)
        self.rect(cur_x, cur_y, w, h, style="FD")

        # Draw thick left bar
        self.set_fill_color(*border_col)
        self.rect(cur_x, cur_y, 2.5, h, style="F")

        # Content
        self.set_xy(cur_x + 5, cur_y + 2.5)
        self.set_font("helvetica", "B", 9)
        self.set_text_color(*title_col)
        self.cell(w - 7, 5, title)
        self.ln(5)

        self.set_x(cur_x + 5)
        self.set_font("helvetica", "", 8.5)
        self.set_text_color(*self.C_SLATE)
        self.multi_cell(w - 7, 4.5, text)
        
        self.set_y(cur_y + h + 4)

    def render_table(self, col_widths, headers, data):
        self.set_font("helvetica", "B", 8.5)
        self.set_fill_color(*self.C_DARK_GREEN)
        self.set_text_color(255, 255, 255)
        self.set_draw_color(*self.C_LINE)
        self.set_line_width(0.2)

        # Header row
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 6.5, f" {h}", border=1, fill=True)
        self.ln(6.5)

        # Data rows
        self.set_font("helvetica", "", 8)
        self.set_text_color(*self.C_SLATE)
        fill = False
        for row in data:
            self.set_fill_color(248, 250, 252) if fill else self.set_fill_color(255, 255, 255)
            # Find max height
            for i, cell_val in enumerate(row):
                self.cell(col_widths[i], 5.8, f" {str(cell_val)}", border=1, fill=True)
            self.ln(5.8)
            fill = not fill
        self.ln(4)

def build_pdf_document():
    pdf = MadrasahGuidePDF()
    
    # =========================================================================
    # HALAMAN 1: COVER RESMI
    # =========================================================================
    pdf.add_page()
    
    # Kop Instansi Atas
    pdf.set_y(25)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.cell(0, 5, "KEMENTERIAN AGAMA REPUBLIK INDONESIA", align="C")
    pdf.ln(5)
    pdf.set_font("helvetica", "", 9)
    pdf.cell(0, 4.5, "KANTOR KEMENTERIAN AGAMA KABUPATEN NGANJUK", align="C")
    pdf.ln(4.5)
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 5.5, "MADRASAH ALIYAH NEGERI 1 NGANJUK", align="C")
    pdf.ln(5)
    pdf.set_font("helvetica", "BI", 8.5)
    pdf.cell(0, 4.5, "MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia)", align="C")
    pdf.ln(8)
    
    # Double line decorative separator
    pdf.set_draw_color(*pdf.C_DARK_GREEN)
    pdf.set_line_width(0.8)
    pdf.line(pdf.l_margin + 20, pdf.get_y(), 210 - pdf.r_margin - 20, pdf.get_y())
    pdf.set_line_width(0.3)
    pdf.line(pdf.l_margin + 20, pdf.get_y() + 1.2, 210 - pdf.r_margin - 20, pdf.get_y() + 1.2)
    pdf.ln(12)
    
    # Logo Madrasah (Centered)
    logo_path = "public/logo-man1.png"
    if os.path.exists(logo_path):
        logo_x = (210 - 32) / 2
        pdf.image(logo_path, x=logo_x, y=pdf.get_y(), w=32)
        pdf.ln(38)
    else:
        pdf.ln(10)

    # Judul Buku
    pdf.set_font("helvetica", "B", 17)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.multi_cell(0, 8, "BUKU PANDUAN PENGGUNAAN\nSISTEM AGENDA KEDINASAN TERPADU", align="C")
    pdf.ln(4)
    
    # Subjudul
    pdf.set_font("helvetica", "", 10.5)
    pdf.set_text_color(*pdf.C_SLATE)
    pdf.multi_cell(0, 5.5, "Pedoman Teknis Operasional Manajemen Kegiatan, Otorisasi PIN Jabatan,\nTemplate Cetak Kedinasan, Ekspor Data Excel, & Kiosk TV Lobi", align="C")
    pdf.ln(12)

    # Box Fitur Unggulan Cover
    pdf.set_fill_color(240, 253, 244)
    pdf.set_draw_color(*pdf.C_DARK_GREEN)
    pdf.set_line_width(0.4)
    box_w = 150
    box_x = (210 - box_w) / 2
    pdf.rect(box_x, pdf.get_y(), box_w, 28, style="FD")
    
    cur_y = pdf.get_y() + 3
    pdf.set_xy(box_x + 5, cur_y)
    pdf.set_font("helvetica", "B", 8.5)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.cell(box_w - 10, 4.5, "FITUR TERPADU VERSI TERBARU (CLOUD EDITION):", align="C")
    pdf.ln(5)
    
    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(*pdf.C_SLATE)
    features_summary = [
        "Realtime Cloud Sync Supabase & Proteksi PIN 4-Digit per Jabatan",
        "3 Model Template Cetak Resmi Kemenag (Kop Dinas & Tanda Tangan)",
        "Ekspor Excel (.xlsx) Resmi & CSV dengan Filter Periode",
        "Mode Kiosk TV Smart Lobi & Berbagi Rekap Harian via WhatsApp (1-Klik)"
    ]
    for feat in features_summary:
        pdf.set_x(box_x + 10)
        pdf.cell(box_w - 20, 4, f"* {feat}", align="L")
        pdf.ln(4.2)
    
    pdf.ln(18)
    
    # Metadata Dokumen Bawah
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.cell(0, 4.5, "TIM PENGEMBANG & PENGELOLA SISTEM INFORMASI MAN 1 NGANJUK", align="C")
    pdf.ln(4.5)
    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(*pdf.C_MUTED)
    pdf.cell(0, 4, "Jalan Imam Bonjol No. 13 Nganjuk, Jawa Timur  |  Telp. (0358) 321683", align="C")
    pdf.ln(4)
    pdf.cell(0, 4, "Dokumen Resmi Panduan Operasional Madrasah - Tahun Ajaran 2025/2026", align="C")

    # =========================================================================
    # HALAMAN 2: DAFTAR ISI & BAB I (GAMBARAN UMUM)
    # =========================================================================
    pdf.add_page()
    
    # Box Daftar Isi
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(*pdf.C_LINE)
    pdf.rect(pdf.l_margin, pdf.get_y(), 170, 42, style="FD")
    
    pdf.set_xy(pdf.l_margin + 5, pdf.get_y() + 3)
    pdf.set_font("helvetica", "B", 9.5)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.cell(0, 5, "RINGKASAN DAFTAR ISI PANDUAN")
    pdf.ln(6)
    
    toc_items = [
        ("BAB I : Gambaran Umum & Arsitektur Sistem", "Hal 2"),
        ("BAB II : Langkah Awal Aktivasi Database Supabase", "Hal 3"),
        ("BAB III : Hak Akses, Profil Pejabat & Proteksi PIN", "Hal 3"),
        ("BAB IV : Manajemen Agenda & Deteksi Bentrok Jadwal", "Hal 4"),
        ("BAB V : Panduan 3 Model Template Cetak Dokumen Kedinasan", "Hal 5"),
        ("BAB VI : Panduan Template Unduh Data (Excel & CSV)", "Hal 6"),
        ("BAB VII : Master Template Agenda Cepat & Berulang", "Hal 7"),
        ("BAB VIII : Panduan Mode Kiosk TV Lobi / Ruang Guru", "Hal 7"),
        ("BAB IX : Integrasi WhatsApp & Panduan Deploy Vercel", "Hal 8"),
        ("BAB X : Tanya Jawab (FAQ) & Lembar Verifikasi Operasional", "Hal 9")
    ]
    
    col1 = toc_items[:5]
    col2 = toc_items[5:]
    start_y = pdf.get_y()
    
    for item in col1:
        pdf.set_font("helvetica", "", 7.8)
        pdf.set_text_color(*pdf.C_SLATE)
        pdf.cell(65, 4.2, item[0])
        pdf.set_font("helvetica", "I", 7.8)
        pdf.set_text_color(*pdf.C_MUTED)
        pdf.cell(15, 4.2, f"... {item[1]}", align="R")
        pdf.ln(4.2)
        
    pdf.set_xy(pdf.l_margin + 90, start_y)
    for item in col2:
        pdf.set_x(pdf.l_margin + 90)
        pdf.set_font("helvetica", "", 7.8)
        pdf.set_text_color(*pdf.C_SLATE)
        pdf.cell(65, 4.2, item[0])
        pdf.set_font("helvetica", "I", 7.8)
        pdf.set_text_color(*pdf.C_MUTED)
        pdf.cell(15, 4.2, f"... {item[1]}", align="R")
        pdf.ln(4.2)
        
    pdf.set_y(pdf.l_margin + 50)
    pdf.ln(3)

    # BAB I
    pdf.chapter_title("I", "Gambaran Umum & Arsitektur Sistem")
    pdf.body_p(
        "Aplikasi Agenda Kedinasan Terpadu MAN 1 Nganjuk adalah platform digital modern yang dirancang "
        "untuk menata alur koordinasi kegiatan madrasah secara real-time. Sistem ini menggantikan pencatatan manual "
        "konvensional dengan sistem berbasis komputasi awan yang dapat diakses secara simultan oleh pimpinan, "
        "dewan guru, tata usaha, serta staf asisten melalui komputer kerja, tablet, maupun telepon pintar."
    )
    
    pdf.section_title("1.1 Arsitektur & Landasan Teknologi")
    pdf.body_p(
        "Sistem ini dibangun di atas arsitektur Single Page Application (SPA) modern yang cepat dan efisien:"
    )
    pdf.bullet("Frontend Framework: ", "React 19 & Vite 6 untuk rendering antarmuka reaktif dan pemuatan secepat kilat.")
    pdf.bullet("Styling & Tata Letak: ", "Tailwind CSS v4 dengan dukungan penuh aturan media cetak formal (@media print).")
    pdf.bullet("Database & Realtime Sync: ", "Supabase PostgreSQL dengan protokol WebSocket Realtime Replication.")
    pdf.bullet("Pustaka Berkas Dinas: ", "ExcelJS untuk kompilasi berkas lembar kerja Excel berformat dinas resmi.")
    pdf.bullet("Mode Fail-Safe: ", "Dilengkapi local storage fallback otomatis jika koneksi jaringan madrasah terputus.")
    
    pdf.section_title("1.2 Peran Utama dalam Organisasi Madrasah")
    pdf.body_p(
        "Sistem memetakan wewenang ke dalam 6 divisi pimpinan madrasah, di mana masing-masing divisi "
        "memiliki 1 akun pimpinan utama dan 2 akun staf asisten. Dengan demikian, delegasi pengisian agenda dapat "
        "dilakukan oleh asisten tanpa mengurangi akuntabilitas divisi terkait."
    )

    # =========================================================================
    # HALAMAN 3: BAB II & BAB III
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("II", "Langkah Awal Aktivasi Database Supabase")
    
    pdf.body_p(
        "Sebelum sistem digunakan pertama kali di lingkungan madrasah, basis data Supabase harus diinisialisasi "
        "melalui skrip DDL resmi. Skrip ini telah disediakan di dalam repositori proyek pada berkas 'supabase-schema.sql'."
    )
    
    pdf.section_title("2.1 Prosedur Eksekusi Skrip SQL")
    steps_sql = [
        "Masuk ke browser dan buka Dashboard Supabase: https://supabase.com/dashboard",
        "Pilih proyek madrasah (ID: kxmebhhabhcykwnvcqed / 'man').",
        "Pada bilah menu sebelah kiri, klik menu 'SQL Editor' (ikon berkas terminal).",
        "Klik tombol '+ New query' di pojok atas editor.",
        "Buka berkas 'supabase-schema.sql', salin (copy) seluruh isinya, dan tempel (paste) ke editor.",
        "Klik tombol hijau 'Run' (atau tekan tombol pintas keyboard Ctrl + Enter)."
    ]
    for i, st in enumerate(steps_sql, 1):
        pdf.bullet(f"Langkah {i}: ", st)
        
    pdf.ln(2)
    pdf.callout(
        "PERHATIAN: REPLIKASI REALTIME",
        "Skrip SQL di atas secara otomatis mendaftarkan tabel 'agenda', 'role_pins', 'role_profiles', dan "
        "'agenda_templates' ke dalam publikasi realtime ('supabase_realtime'). Setiap perubahan agenda yang "
        "dilakukan oleh satu staf akan langsung muncul di layar staf lain dalam pecahan detik tanpa perlu me-refresh browser.",
        box_type="info"
    )

    pdf.chapter_title("III", "Hak Akses, Profil Pejabat & Proteksi PIN")
    pdf.body_p(
        "Untuk menjaga integritas jadwal kedinasan, aplikasi menerapkan pembatasan hak modifikasi. Seluruh dewan guru "
        "dapat melihat (read-only) semua jadwal, tetapi penambahan, pengubahan, dan penghapusan agenda hanya boleh dilakukan "
        "oleh penanggung jawab divisi yang sah setelah memasukkan PIN pengaman 4-digit."
    )
    
    pdf.section_title("3.1 Matriks Jabatan & PIN Awal")
    role_headers = ["Kode", "Divisi Jabatan", "Akun Tersedia", "PIN Standar"]
    role_data = [
        ["kamad", "Kepala Madrasah", "Kamad Utama, Asisten 1, Asisten 2", "1234"],
        ["ktu", "Kepala Tata Usaha (KTU)", "KTU Utama, Asisten 1, Asisten 2", "1234"],
        ["akd", "Waka Bidang Akademik", "Waka Utama, Asisten 1, Asisten 2", "1234"],
        ["sis", "Waka Bidang Kesiswaan", "Waka Utama, Asisten 1, Asisten 2", "1234"],
        ["sar", "Waka Bidang Sarana Prasarana", "Waka Utama, Asisten 1, Asisten 2", "1234"],
        ["hum", "Waka Bidang Kehumasan", "Waka Utama, Asisten 1, Asisten 2", "1234"]
    ]
    pdf.render_table([16, 52, 72, 30], role_headers, role_data)

    pdf.section_title("3.2 Mengisi Nama Asli Pejabat & NIP")
    pdf.body_p(
        "Agar dokumen cetak dinas dan berkas Excel memuat identitas pejabat yang akurat, lakukan pemutakhiran profil:\n"
        "1. Klik tombol 'Pengaturan' (ikon gerigi) pada bilah samping (sidebar).\n"
        "2. Pilih tab 'Profil Pejabat'.\n"
        "3. Masukkan Nama Lengkap beserta Gelar Akademik dan NIP untuk tiap pimpinan.\n"
        "4. Klik tombol 'Simpan Profil Pejabat'. Data akan tersimpan di cloud dan terpasang pada semua template cetak."
    )

    # =========================================================================
    # HALAMAN 4: BAB IV (MANAJEMEN AGENDA & BENTROK)
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("IV", "Manajemen Agenda & Deteksi Bentrok Jadwal")
    
    pdf.section_title("4.1 Tata Cara Menambah Agenda Baru")
    pdf.body_p(
        "Penambahan agenda dapat dilakukan kapan saja melalui tombol '+ Agenda Baru' di bilah atas. Formulir agenda "
        "dirancang komprehensif mencakup atribut-atribut penting kedinasan madrasah:"
    )
    pdf.bullet("Judul Agenda: ", "Nama kegiatan yang jelas dan lugas (misal: Rapat Pleno RKA Madrasah).")
    pdf.bullet("Kategori: ", "Pilihan kategori standar: Rapat, KBM/Ujian, Dinas Luar, Tamu, Upacara, Kesiswaan, Keagamaan, Sarpras, Lainnya.")
    pdf.bullet("Waktu Pelaksanaan: ", "Tanggal mulai, tanggal selesai (opsional untuk agenda multi-hari), jam mulai, dan jam selesai.")
    pdf.bullet("Lokasi Kegiatan: ", "Ruangan atau tempat dilaksanakannya agenda (misal: Aula Utama, Ruang Guru, Lab Komputer).")
    pdf.bullet("Sasaran Peserta: ", "Target undangan atau pihak yang dilibatkan (misal: Seluruh Dewan Guru & Pegawai).")
    pdf.bullet("Tautan Berkas (Link): ", "Tautan Google Drive surat undangan, juknis, materi tayang, atau SK terkait.")

    pdf.section_title("4.2 Mekanisme Cerdas Deteksi Bentrok Jadwal (Conflict Engine)")
    pdf.body_p(
        "Salah satu masalah utama koordinasi madrasah adalah terjadinya tumpang tindih waktu pada ruangan yang sama "
        "atau penugasan pejabat yang bersamaan. Sistem ini dilengkapi Conflict Engine otomatis yang bekerja secara real-time:"
    )
    
    pdf.callout(
        "CARA KERJA DETEKSI BENTROK OTOMATIS",
        "Sistem akan membandingkan rentang jam (jam mulai sampai jam selesai) dari setiap agenda pada tanggal yang sama.\n"
        "1. Bentrok Ruangan: Jika terdapat dua kegiatan pada jam yang bersinggungan di ruangan yang sama, sistem langsung "
        "menampilkan peringatan bertuliskan 'Bentrok Ruangan' dengan latar oranye/merah.\n"
        "2. Bentrok Pejabat: Jika seorang pejabat dijadwalkan menghadiri dua acara sekaligus pada jam yang sama, sistem "
        "akan memberi label 'Bentrok Waktu Pejabat' agar penanggung jawab dapat segera melakukan penjadwalan ulang.",
        box_type="warning"
    )

    pdf.section_title("4.3 Dynamic Auto-Status (Perhitungan Status Berjalan)")
    pdf.body_p(
        "Berbeda dengan aplikasi konvensional di mana status kegiatan harus diubah manual, sistem MAN 1 Nganjuk menghitung "
        "status agenda secara cerdas berdasarkan jam perangkat saat ini:"
    )
    pdf.bullet("Terjadwal: ", "Waktu pelaksanaan agenda belum tiba.")
    pdf.bullet("Sedang Berlangsung: ", "Jam saat ini berada di antara jam mulai dan jam selesai agenda (kartu diberi aksen hijau terang).")
    pdf.bullet("Sudah Terlaksana: ", "Waktu selesai kegiatan telah terlewati.")
    pdf.bullet("Dibatalkan: ", "Dapat dipilih secara manual apabila kegiatan kedinasan ditunda atau ditiadakan.")

    pdf.section_title("4.4 Perlindungan Fitur Hapus (Double-Click Confirmation)")
    pdf.body_p(
        "Untuk mencegah terhapusnya data penting secara tidak sengaja, tombol 'Hapus' pada kartu agenda menerapkan sistem "
        "konfirmasi dua langkah. Pada klik pertama, tombol akan berubah warna menjadi merah pekat dengan teks 'Yakin hapus? "
        "Ketuk lagi' selama 4 detik. Penghapusan permanen hanya akan dieksekusi jika pengguna mengonfirmasi klik kedua."
    )

    # =========================================================================
    # HALAMAN 5: BAB V (TEMPLATE CETAK DOKUMEN KEDINASAN)
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("V", "Panduan 3 Model Template Cetak Dokumen Kedinasan")
    
    pdf.body_p(
        "Sesuai kebutuhan administrasi instansi Kementerian Agama, sistem menyediakan menu cetak terdedikasi "
        "dengan 3 varian template resmi. Seluruh template dilengkapi Kop Surat resmi kementerian, logo MAN 1 Nganjuk, "
        "garis ganda pembatas formal, serta blok tanda tangan digital pimpinan."
    )
    
    pdf.section_title("5.1 Rincian Karakteristik 3 Model Template")
    
    print_models = [
        ["Model A : Rekap Eksekutif Dinas", "Format tabel ringkasan formal. Berisi kolom No, Hari/Tanggal, Jam, Agenda, Penanggung Jawab, Lokasi, dan Keterangan. Sangat cocok untuk lampiran laporan mingguan/bulanan kepada Kantor Kemenag Kabupaten Nganjuk."],
        ["Model B : Matriks Mading Guru", "Format kartu ringkas dan padat (grid format) yang dioptimalkan untuk dicetak pada kertas A4/F4 dan ditempelkan pada papan pengumuman ruang guru, meja resepsionis, atau pos keamanan."],
        ["Model C : Notula Berita Acara", "Format lembar kerja per agenda. Menampilkan detail acara, target peserta, uraian deskripsi kerja, dan kolom khusus 'Notula & Hasil Evaluasi' yang siap ditandatangani oleh notulis dan pimpinan rapat."]
    ]
    
    for title, desc in print_models:
        pdf.set_font("helvetica", "B", 9)
        pdf.set_text_color(*pdf.C_DARK_GREEN)
        pdf.cell(0, 5, f"> {title}")
        pdf.ln(5)
        pdf.set_font("helvetica", "", 8.5)
        pdf.set_text_color(*pdf.C_SLATE)
        pdf.multi_cell(0, 4.8, desc)
        pdf.ln(2.5)

    pdf.section_title("5.2 Menyesuaikan Kop Surat & Penandatangan Cetak")
    pdf.body_p(
        "Pengguna dapat menyesuaikan format kop dan pejabat yang bertanda tangan langsung dari antarmuka cetak tanpa perlu koding:\n"
        "1. Klik tombol 'Cetak' (ikon printer) pada bilah atas.\n"
        "2. Pilih model cetak yang dikehendaki pada tombol tab atas.\n"
        "3. Tentukan rentang tanggal kegiatan (Semua, Hari Ini, Pekan Ini, atau Bulan Ini).\n"
        "4. Periksa blok 'Pengaturan Kop & Penandatangan' di bagian bawah modal:\n"
        "   - Kota Titimangsa (default: Nganjuk)\n"
        "   - Jabatan Penandatangan (default: Kepala Madrasah)\n"
        "   - Nama & NIP Penandatangan (otomatis terisi dari profil pejabat yang tersimpan)\n"
        "5. Klik tombol 'Buka Jendela Cetak / Simpan PDF'."
    )
    
    pdf.callout(
        "TIPS CETAK DOKUMEN KE PDF / KERTAS FISIK",
        "Saat dialog cetak browser muncul:\n"
        "- Pastikan opsi 'Background graphics' (Grafik latar belakang) dicentang agar warna badge dan garis kop tampil sempurna.\n"
        "- Pilih ukuran kertas 'A4' dengan margin 'Default' atau 'Minimum'.\n"
        "- Anda dapat memilih printer fisik untuk mencetak ke kertas, atau memilih opsi 'Save as PDF' untuk menyimpan file PDF digital.",
        box_type="info"
    )

    # =========================================================================
    # HALAMAN 6: BAB VI (TEMPLATE UNDUH DATA EXCEL & CSV)
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("VI", "Panduan Template Unduh Data (Excel & CSV)")
    
    pdf.body_p(
        "Untuk kebutuhan rekapitulasi data, audit kepegawaian, maupun integrasi ke aplikasi pengolah data lain, "
        "sistem menyediakan modul ekspor terstruktur menggunakan pustaka canggih ExcelJS."
    )
    
    pdf.section_title("6.1 Fitur Unggulan Template Excel Resmi (.xlsx)")
    pdf.body_p(
        "Ekspor Excel yang dihasilkan BUKAN sekadar tabel mentah, melainkan dokumen dinas yang telah distilisasi rapi:"
    )
    pdf.bullet("Kop Surat Lembaga: ", "Header dokumen memuat nama instansi resmi Kemenag dan MAN 1 Nganjuk pada baris paling atas.")
    pdf.bullet("Header Hijau Kementerian: ", "Baris kepala tabel diwarnai hijau khas Kemenag (#065F46) dengan font tebal berwarna putih.")
    pdf.bullet("Auto-Fit Lebar Kolom: ", "Lebar setiap kolom dihitung otomatis sesuai panjang isi teks terpanjang sehingga tidak ada data yang terpotong.")
    pdf.bullet("Garis Batas Sel Formal: ", "Tiap sel diberi garis pembatas tipis (border grid) berwarna abu-abu profesional.")
    pdf.bullet("Auto-Wrap Teks: ", "Kolom deskripsi, peserta, dan hasil notula otomatis dibungkus rapi (wrap text).")

    pdf.section_title("6.2 Struktur Kolom Berkas Excel")
    excel_cols = ["No", "Nama Kolom", "Tipe Data", "Deskripsi Kolom"]
    excel_data = [
        ["1", "No", "Angka", "Nomor urut kegiatan."],
        ["2", "Tanggal", "Teks", "Tanggal mulai dan tanggal selesai kegiatan."],
        ["3", "Waktu", "Teks", "Rentang jam pelaksanaan (mulai s.d selesai)."],
        ["4", "Nama Kegiatan", "Teks", "Judul lengkap agenda kedinasan."],
        ["5", "Kategori", "Teks", "Klasifikasi bidang kegiatan madrasah."],
        ["6", "Penanggung Jawab", "Teks", "Jabatan serta nama resmi dan NIP pejabat terkait."],
        ["7", "Lokasi", "Teks", "Ruangan atau alamat pelaksanaan."],
        ["8", "Sasaran Peserta", "Teks", "Daftar undangan atau warga madrasah yang terlibat."],
        ["9", "Deskripsi / Catatan", "Teks", "Uraian teknis atau arahan khusus agenda."],
        ["10", "Status", "Teks", "Status terkini (Terjadwal / Sedang Berlangsung / Terlaksana)."],
        ["11", "Notula / Hasil", "Teks", "Catatan evaluasi atau hasil rapat dinas."]
    ]
    pdf.render_table([10, 36, 24, 100], excel_cols, excel_data)

    pdf.section_title("6.3 Opsi Ekspor CSV")
    pdf.body_p(
        "Bagi pengguna yang membutuhkan data mentah untuk diproses menggunakan Google Sheets, formula spreadsheet, "
        "atau analisis data Python, format CSV dapat diunduh instan dengan pemisah koma standar dan encoding UTF-8."
    )

    # =========================================================================
    # HALAMAN 7: BAB VII & BAB VIII
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("VII", "Master Template Agenda Cepat & Berulang")
    
    pdf.body_p(
        "Madrasah memiliki banyak agenda yang berlangsung secara rutin dengan lokasi, jam, dan peserta yang sama "
        "(misalnya Upacara Bendera setiap Senin, Sholat Dhuha, atau Rapat Evaluasi Pimpinan). Fitur Template Cepat "
        "memungkinkan penginputan agenda rutin tersebut hanya dalam 1 kali klik."
    )
    
    pdf.section_title("7.1 Menggunakan Template Saat Menambah Agenda")
    pdf.body_p(
        "Ketika membuka modal '+ Agenda Baru', sebuah kotak pilihan 'Gunakan Template Cepat' akan muncul di baris teratas. "
        "Pilih salah satu template yang relevan, maka seluruh kolom (judul, jam, kategori, lokasi, peserta, dan catatan) "
        "akan terisi seketika. Anda cukup memastikan tanggal kegiatan lalu menekan tombol 'Simpan Agenda'."
    )
    
    pdf.section_title("7.2 Menambah & Mengelola Template Baru")
    pdf.body_p(
        "Staf pimpinan dapat menambahkan template baru kapan saja:\n"
        "1. Masuk ke menu 'Pengaturan' di bilah samping.\n"
        "2. Pilih tab 'Template Agenda'.\n"
        "3. Klik tombol '+ Tambah Template Baru'.\n"
        "4. Isikan nama template dan atribut standarnya, lalu klik simpan."
    )

    pdf.chapter_title("VIII", "Panduan Mode Kiosk TV Lobi / Ruang Guru")
    pdf.body_p(
        "Mode Kiosk TV dirancang khusus untuk ditayangkan pada Smart TV atau monitor layar besar di lobi madrasah, "
        "ruang pimpinan, maupun ruang dewan guru. Tampilan ini menghadirkan keterbukaan informasi yang elegan dan profesional."
    )
    
    pdf.section_title("8.1 Karakteristik Tampilan Kiosk")
    pdf.bullet("Tema Gelap Elegan: ", "Warna latar abu-abu gelap kebiruan (#0f172a) yang nyaman dipandang berjam-jam dan hemat daya layar TV.")
    pdf.bullet("Jam Digital Live: ", "Jam dan detik berjalan presisi dengan indikator tanggal Hijriyah/Masehi.")
    pdf.bullet("Sorotan Agenda Terdekat: ", "Kartu besar di bagian atas yang menyoroti kegiatan yang sedang berlangsung atau yang akan mulai dalam waktu terdekat.")
    pdf.bullet("Daftar Agenda Harian: ", "Daftar agenda hari ini lengkap dengan penanggung jawab, lokasi, dan badge status berkedip lembut.")

    pdf.section_title("8.2 Cara Mengaktifkan True Fullscreen")
    pdf.body_p(
        "1. Klik tombol 'Layar TV' (ikon monitor) pada bilah atas atau bilah samping.\n"
        "2. Tekan tombol F11 pada keyboard untuk mengaktifkan mode layar penuh tanpa bilah peramban.\n"
        "3. Untuk keluar dari mode layar penuh, tekan kembali tombol F11 atau tombol 'Esc'."
    )

    # =========================================================================
    # HALAMAN 8: BAB IX (INTEGRASI WA & DEPLOY VERCEL)
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("IX", "Integrasi WhatsApp & Panduan Deploy Vercel")
    
    pdf.section_title("9.1 Berbagi Agenda & Rekap Harian via WhatsApp (1-Klik)")
    pdf.body_p(
        "Untuk mempercepat diseminasi informasi ke grup WhatsApp dewan guru dan pimpinan, sistem menyediakan "
        "dua generator pesan WhatsApp terformat otomatis:"
    )
    pdf.bullet("Tombol WA pada Kartu Agenda: ", "Membagikan detail 1 kegiatan spesifik mencakup nama acara, waktu, tempat, peserta, dan tautan berkas pendukung.")
    pdf.bullet("Tombol WA Rekap Harian di Header: ", "Mengumpulkan seluruh agenda yang berlangsung pada hari ini ke dalam satu format pesan rangkuman dinas yang rapi dan siap kirim.")

    pdf.section_title("9.2 Panduan Deploy ke Vercel (Produksi Publik)")
    pdf.body_p(
        "Repositori proyek ini telah dikonfigurasi lengkap dengan berkas 'vercel.json' untuk Single Page Application. "
        "Langkah-langkah peluncuran ke Vercel adalah sebagai berikut:"
    )
    
    vercel_steps = [
        "Buka dashboard Vercel: https://vercel.com/dashboard",
        "Klik tombol 'Add New Project' di pojok kanan atas.",
        "Pilih akun GitHub Anda dan impor repositori 'Hikam666/agenda-man1-nganjuk'.",
        "Pada bagian 'Build and Output Settings', biarkan nilai default (Vite framework).",
        "Buka bagian 'Environment Variables' dan daftarkan 2 kunci berikut:\n"
        "  - VITE_SUPABASE_URL = https://kxmebhhabhcykwnvcqed.supabase.co\n"
        "  - VITE_SUPABASE_ANON_KEY = [masukkan anon key supabase Anda]",
        "Klik tombol 'Deploy'. Tunggu proses build sekitar 30 detik hingga status menjadi 'Ready'."
    ]
    for i, vs in enumerate(vercel_steps, 1):
        pdf.bullet(f"Langkah {i}: ", vs)

    pdf.callout(
        "UPDATE OTOMATIS (CONTINUOUS DEPLOYMENT)",
        "Setiap kali tim pengembang melakukan 'git push' ke cabang utama (main) di GitHub, Vercel akan otomatis "
        "melakukan rebuild dan memperbarui sistem di internet tanpa jeda waktu henti (zero downtime).",
        box_type="info"
    )

    # =========================================================================
    # HALAMAN 9: BAB X (FAQ & VERIFIKASI OPERASIONAL)
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title("X", "Tanya Jawab (FAQ) & Verifikasi Operasional")
    
    faqs = [
        ("Bagaimana jika staf pimpinan lupa PIN 4-digit?", 
         "PIN disimpan di tabel 'role_pins' pada Supabase. Admin IT madrasah dapat membuka menu Table Editor di Supabase "
         "dan mereset nilai kolom pin pada role terkait kembali menjadi '1234'."),
        
        ("Apakah agenda yang diinput di HP langsung muncul di laptop lain?",
         "Ya. Replikasi Supabase Realtime menggunakan koneksi WebSocket persisten. Selama kedua perangkat terhubung ke internet, "
         "jadwal akan sinkron dalam hitungan milidetik secara nirkabel."),
        
        ("Bagaimana jika madrasah mengalami gangguan internet sesaat?",
         "Sistem dilengkapi local storage fail-safe. Data terakhir tetap dapat dilihat di layar, dan jika ada agenda baru yang "
         "diinput saat offline, data akan disimpan di memori peramban lokal hingga koneksi tersambung kembali."),
        
        ("Apakah format cetak mendukung ukuran kertas F4 / Folio?",
         "Sangat mendukung. Pada jendela cetak browser, pilih Paper Size 'Legal' atau 'Folio' (215 x 330 mm). Tabel dan matriks mading "
         "akan menyesuaikan secara elastis mengikuti proporsi kertas.")
    ]
    
    for q, a in faqs:
        pdf.set_font("helvetica", "B", 9)
        pdf.set_text_color(*pdf.C_DARK_GREEN)
        pdf.cell(0, 5, f"T: {q}")
        pdf.ln(5)
        pdf.set_font("helvetica", "", 8.5)
        pdf.set_text_color(*pdf.C_SLATE)
        pdf.multi_cell(0, 4.6, f"J: {a}")
        pdf.ln(3)

    pdf.ln(5)
    
    # Lembar Pengesahan / Lembar Tanda Tangan
    pdf.set_font("helvetica", "B", 9)
    pdf.set_text_color(*pdf.C_DARK_GREEN)
    pdf.cell(0, 5, "LEMBAR PENGESAHAN OPERASIONAL MADRASAH", align="C")
    pdf.ln(8)
    
    sig_w = 80
    pdf.set_font("helvetica", "", 8.5)
    pdf.set_text_color(*pdf.C_SLATE)
    
    # Kiri: KTU, Kanan: Kepala Madrasah
    start_sig_y = pdf.get_y()
    pdf.set_xy(pdf.l_margin + 5, start_sig_y)
    pdf.cell(sig_w, 4.5, "Mengetahui,", align="C")
    pdf.ln(4.5)
    pdf.set_x(pdf.l_margin + 5)
    pdf.cell(sig_w, 4.5, "Kepala Tata Usaha MAN 1 Nganjuk", align="C")
    pdf.ln(22)
    pdf.set_x(pdf.l_margin + 5)
    pdf.set_font("helvetica", "B", 8.5)
    pdf.cell(sig_w, 4.5, "( ..................................................... )", align="C")
    pdf.ln(4)
    pdf.set_x(pdf.l_margin + 5)
    pdf.set_font("helvetica", "", 8)
    pdf.cell(sig_w, 4, "NIP. .................................................", align="C")

    pdf.set_xy(210 - pdf.r_margin - sig_w - 5, start_sig_y)
    pdf.set_font("helvetica", "", 8.5)
    pdf.cell(sig_w, 4.5, "Nganjuk, .................................... 2026", align="C")
    pdf.ln(4.5)
    pdf.set_x(210 - pdf.r_margin - sig_w - 5)
    pdf.cell(sig_w, 4.5, "Kepala MAN 1 Nganjuk", align="C")
    pdf.ln(22)
    pdf.set_x(210 - pdf.r_margin - sig_w - 5)
    pdf.set_font("helvetica", "B", 8.5)
    pdf.cell(sig_w, 4.5, "Drs. H. Muh. Zuhal, M.Pd.I", align="C")
    pdf.ln(4)
    pdf.set_x(210 - pdf.r_margin - sig_w - 5)
    pdf.set_font("helvetica", "", 8)
    pdf.cell(sig_w, 4, "NIP. 197205102000031002", align="C")

    # Save PDF output
    output_filename = "Buku_Panduan_Penggunaan_Agenda_MAN1_Nganjuk.pdf"
    output_path = os.path.join("D:\\MAN", output_filename)
    pdf.output(output_path)
    print(f"SUCCESS: PDF Buku Panduan successfully generated at: {output_path}")

if __name__ == "__main__":
    build_pdf_document()
