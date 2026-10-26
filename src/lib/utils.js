import { getRoleDisplayName } from './constants';

export const iso = (d = new Date()) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const pd = (s) => new Date(`${s}T00:00:00`);

export const addD = (s, n) => {
  const d = pd(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const fmt = (s, options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!s) return '—';
  try {
    return pd(s).toLocaleDateString('id-ID', options);
  } catch (e) {
    return s;
  }
};

export const monday = (s) => {
  const d = pd(s);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return iso(d);
};

export const getEndDate = (a) => a.tgl_end || a.tglEnd || a.tgl;

export const onDate = (a, d) => {
  const end = getEndDate(a);
  return a.tgl <= d && d <= end;
};

export const tmin = (t) => {
  const [h, m] = (t || '0:0').split(':');
  return (+h || 0) * 60 + (+m || 0);
};

export const conflicts = (a, list = []) => {
  if (!a || a.status === 'Dibatalkan') return [];
  const aEnd = getEndDate(a);
  const aMul = tmin(a.mulai);
  const aSel = a.selesai ? tmin(a.selesai) : aMul;

  return list.filter((b) => {
    if (b.id && a.id && b.id === a.id) return false;
    if (b.status === 'Dibatalkan') return false;

    const bEnd = getEndDate(b);
    const dateOverlap = b.tgl <= aEnd && a.tgl <= bEnd;
    if (!dateOverlap) return false;

    const bMul = tmin(b.mulai);
    const bSel = b.selesai ? tmin(b.selesai) : bMul;

    const timeOverlap =
      aMul < bSel + (b.selesai ? 0 : 1) &&
      bMul < aSel + (a.selesai ? 0 : 1);

    if (!timeOverlap) return false;

    // Conflict occurs if same owner OR same room/location
    const sameOwner = b.owner === a.owner;
    const sameLocation =
      a.lokasi &&
      b.lokasi &&
      a.lokasi.trim().toLowerCase() === b.lokasi.trim().toLowerCase();

    return sameOwner || sameLocation;
  });
};

export const downloadCsv = (agendas, roleProfiles = {}) => {
  if (!agendas || !agendas.length) return false;

  const cell = (v) => {
    v = String(v == null ? '' : v);
    // Sanitize CSV formula injection
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  };

  const headers = [
    'Tanggal Mulai',
    'Tanggal Selesai',
    'Jam Mulai',
    'Jam Selesai',
    'Kegiatan',
    'Kategori',
    'Lokasi',
    'Penanggung Jawab',
    'Peserta',
    'Keterangan',
    'Status',
    'Catatan Hasil'
  ];

  const sorted = [...agendas].sort((a, b) =>
    (a.tgl + a.mulai).localeCompare(b.tgl + b.mulai)
  );

  const rows = sorted.map((a) =>
    [
      a.tgl,
      getEndDate(a),
      a.mulai,
      a.selesai || '—',
      a.judul,
      a.kat,
      a.lokasi || '—',
      getRoleDisplayName(a.owner, roleProfiles),
      a.peserta || '—',
      a.ket || '—',
      a.status,
      a.hasil || '—'
    ]
      .map(cell)
      .join(',')
  );

  const csvContent = '\ufeff' + [headers.map(cell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agenda-man1-nganjuk-${iso(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};
