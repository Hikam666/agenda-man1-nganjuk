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

export const STA = ["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

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
