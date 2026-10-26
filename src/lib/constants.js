export const JAB = [
  ["kamad", "Kepala Madrasah"],
  ["ktu", "Kepala Tata Usaha (KTU)"],
  ["akd", "Waka Akademik"],
  ["sis", "Waka Kesiswaan"],
  ["sar", "Waka Sarana Prasarana"],
  ["hum", "Waka Kehumasan"]
];

export const KAT = [
  "Rapat",
  "KBM/Ujian",
  "Kesiswaan",
  "Keagamaan",
  "Kunjungan/Tamu",
  "Dinas Luar",
  "Lainnya"
];

export const STA = ["Otomatis", "Terjadwal", "Sedang Berlangsung", "Sudah Terlaksana", "Dibatalkan"];

export const ROLES = [];
JAB.forEach(([k, n]) => {
  [0, 1, 2].forEach(l => {
    ROLES.push({
      key: k + l,
      j: k,
      l,
      n: l ? `Asisten ${n} ${l}` : n,
      jn: n,
      isPrimary: l === 0
    });
  });
});

export const getRoleName = (key) => {
  const found = ROLES.find(r => r.key === key);
  return found ? found.n : "—";
};

export const getRoleDisplayName = (key, roleProfiles = {}) => {
  const roleName = getRoleName(key);
  const profile = roleProfiles[key];
  if (profile && profile.pejabat_name && profile.pejabat_name.trim()) {
    return `${profile.pejabat_name.trim()} (${roleName})`;
  }
  return roleName;
};

export const getPejabatOnly = (key, roleProfiles = {}) => {
  const profile = roleProfiles[key];
  if (profile && profile.pejabat_name && profile.pejabat_name.trim()) {
    return profile.pejabat_name.trim();
  }
  return null;
};

export const DEFAULT_PRINT_CONFIG = {
  kopHeader1: "KEMENTERIAN AGAMA REPUBLIK INDONESIA",
  kopHeader2: "KANTOR KEMENTERIAN AGAMA KABUPATEN NGANJUK",
  kopMadrasah: "MADRASAH ALIYAH NEGERI 1 NGANJUK",
  kopAlamat: "Jalan Imam Bonjol No. 13 Nganjuk · Telp. (0358) 321683 · Email: man1nganjuk@kemenag.go.id",
  titimangsaKota: "Nganjuk",
  jabatanPenandatangan: "Kepala Madrasah",
  namaPenandatangan: "Drs. H. Muh. Zuhal, M.Pd.I",
  nipPenandatangan: "197205102000031002",
  templateType: "rekap" // 'rekap' | 'matriks' | 'notula'
};

export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-1',
    nama: 'Upacara Bendera Hari Senin',
    judul: 'Upacara Bendera Hari Senin & Pengarahan Pembina',
    kat: 'Kesiswaan',
    mulai: '07:00',
    selesai: '07:45',
    lokasi: 'Lapangan Utama Madrasah',
    peserta: 'Seluruh Dewan Guru, Tenaga Kependidikan, dan Siswa',
    ket: 'Pakaian PSH / Seragam Kemenag rapi lengkap.'
  },
  {
    id: 'tpl-2',
    nama: 'Rapat Koordinasi Pimpinan (Kamad & Waka)',
    judul: 'Rapat Koordinasi Evaluasi Mingguan Pimpinan',
    kat: 'Rapat',
    mulai: '08:30',
    selesai: '10:30',
    lokasi: 'Ruang Kepala Madrasah',
    peserta: 'Kepala Madrasah, KTU, dan Seluruh Waka',
    ket: 'Membahas evaluasi program kerja dan agenda kedinasan sepekan ke depan.'
  },
  {
    id: 'tpl-3',
    nama: 'Rapat Pleno Dewan Guru & Karyawan',
    judul: 'Rapat Pleno Dewan Guru dan Tenaga Kependidikan',
    kat: 'Rapat',
    mulai: '13:00',
    selesai: '15:30',
    lokasi: 'Aula Utama MAN 1 Nganjuk',
    peserta: 'Seluruh Guru dan Karyawan',
    ket: 'Membawa berkas administrasi dan perangkat ajar.'
  },
  {
    id: 'tpl-4',
    nama: 'Pembiasaan Pagi (Sholat Dhuha & Istighosah)',
    judul: 'Pembiasaan Sholat Dhuha Berjamaah & Tadarus Al-Quran',
    kat: 'Keagamaan',
    mulai: '06:45',
    selesai: '07:20',
    lokasi: 'Masjid Madrasah',
    peserta: 'Seluruh Siswa dan Guru Pembina',
    ket: 'Membawa mushaf Al-Quran dan perlengkapan sholat masing-masing.'
  },
  {
    id: 'tpl-5',
    nama: 'Supervisi Akademik & KBM Terjadwal',
    judul: 'Supervisi Akademik Pembelajaran di Kelas',
    kat: 'KBM/Ujian',
    mulai: '08:00',
    selesai: '11:00',
    lokasi: 'Ruang Kelas Pembelajaran',
    peserta: 'Guru Mata Pelajaran dan Tim Penilai Supervisi',
    ket: 'Menyiapkan RPP / Modul Ajar dan instrumen asesmen.'
  },
  {
    id: 'tpl-6',
    nama: 'Senam Sehat & Gerakan Kebersihan Lingkungan',
    judul: 'Jumat Bersih & Senam Kesegaran Jasmani',
    kat: 'Kesiswaan',
    mulai: '06:30',
    selesai: '08:00',
    lokasi: 'Lapangan & Lingkungan Madrasah',
    peserta: 'Seluruh Warga Madrasah',
    ket: 'Pakaian olahraga madrasah dan membawa perlengkapan kebersihan kelas.'
  }
];

export const CATEGORY_COLORS = {
  "Rapat": {
    bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    dot: "#1f5fa8",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
  },
  "KBM/Ujian": {
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dot: "#d97706",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
  },
  "Kesiswaan": {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dot: "#10b981",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
  },
  "Keagamaan": {
    bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    dot: "#8b5cf6",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200"
  },
  "Kunjungan/Tamu": {
    bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dot: "#e11d48",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
  },
  "Dinas Luar": {
    bg: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
    dot: "#06b6d4",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200"
  },
  "Lainnya": {
    bg: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dot: "#64748b",
    badge: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
  }
};
