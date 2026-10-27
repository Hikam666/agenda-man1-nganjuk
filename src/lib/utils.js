import ExcelJS from 'exceljs';
import { getRoleDisplayName, DEFAULT_PRINT_CONFIG } from './constants';

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

export const getEndDate = (a) => a.tgl_end || a.tgl_akhir || a.tglEnd || a.tgl;

export const onDate = (a, d) => {
  const end = getEndDate(a);
  return a.tgl <= d && d <= end;
};

export const tmin = (t) => {
  const [h, m] = (t || '0:0').split(':');
  return (+h || 0) * 60 + (+m || 0);
};

/**
 * Dynamic calculation of status based on current time
 */
export const computeDynamicStatus = (a, now = new Date()) => {
  if (a.status === 'Dibatalkan') return 'Dibatalkan';
  if (a.status === 'Sudah Terlaksana' || a.status === 'Selesai') return 'Sudah Terlaksana';

  try {
    const endD = getEndDate(a);
    const startDt = new Date(`${a.tgl}T${(a.mulai || '00:00').slice(0, 5)}:00`);
    const endDt = new Date(`${endD}T${(a.selesai || a.mulai || '23:59').slice(0, 5)}:00`);

    if (now < startDt) {
      return 'Terjadwal';
    } else if (now >= startDt && now <= endDt) {
      return 'Sedang Berlangsung';
    } else {
      return 'Sudah Terlaksana';
    }
  } catch (e) {
    return a.status || 'Terjadwal';
  }
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

/**
 * Generate official WhatsApp announcement for a single agenda
 */
export const generateAgendaWaText = (a, roleProfiles = {}) => {
  const endDate = getEndDate(a);
  const isMultiDay = endDate && endDate > a.tgl;
  const dateStr = isMultiDay 
    ? `${fmt(a.tgl, { weekday: 'long', day: 'numeric', month: 'long' })} s.d. ${fmt(endDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
    : fmt(a.tgl);

  const status = computeDynamicStatus(a);

  return `*Assalamu'alaikum Wr. Wb.*
Yth. Bapak/Ibu Dewan Guru & Tenaga Kependidikan MAN 1 Nganjuk.

Berikut disampaikan pemberitahuan agenda kegiatan madrasah:

📌 *Kegiatan:* ${a.judul}
🗓 *Hari/Tanggal:* ${dateStr}
⏰ *Waktu:* ${a.mulai} ${a.selesai ? `– ${a.selesai}` : ''} WIB
📍 *Tempat/Lokasi:* ${a.lokasi || 'Sesuai Arahan'}
👤 *Penanggung Jawab:* ${getRoleDisplayName(a.owner, roleProfiles)}
👥 *Peserta:* ${a.peserta || 'Seluruh Pihak Terkait'}
🏷 *Kategori:* ${a.kat}
📊 *Status:* ${status}
${a.ket ? `📝 *Keterangan:* ${a.ket}\n` : ''}${a.tautan ? `📎 *Tautan Berkas/Surat:* ${a.tautan}\n` : ''}
Mohon kehadiran dan persiapan bapak/ibu sekalian tepat waktu. Atas perhatian dan kerjasamanya kami sampaikan terima kasih.

*Wassalamu'alaikum Wr. Wb.*
_Humas & Sekretariat MAN 1 Nganjuk_
_MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia)_`;
};

/**
 * Generate daily morning briefing recap for WhatsApp group
 */
export const generateDailyRecapWaText = (todayAgendas = [], dateStr = iso(), roleProfiles = {}) => {
  const formattedDate = fmt(dateStr);
  if (!todayAgendas.length) {
    return `*Assalamu'alaikum Wr. Wb.*
Pemberitahuan Agenda MAN 1 Nganjuk
🗓 *Hari/Tanggal:* ${formattedDate}

Alhamdulillah, tidak ada agenda dinas khusus yang terjadwal untuk hari ini. Kegiatan KBM berjalan normal sesuai jadwal pelajaran.

_Humas MAN 1 Nganjuk_
_MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia)_`;
  }

  const items = todayAgendas.map((a, idx) => {
    return `${idx + 1}. *${a.judul}*
   ⏰ ${a.mulai} ${a.selesai ? `– ${a.selesai}` : ''} WIB
   📍 ${a.lokasi || '—'}
   👤 PJ: ${getRoleDisplayName(a.owner, roleProfiles)}${a.peserta ? ` | Peserta: ${a.peserta}` : ''}`;
  }).join('\n\n');

  return `*Assalamu'alaikum Wr. Wb.*
*REKAP AGENDA KEGIATAN MAN 1 NGANJUK*
🗓 *Hari/Tanggal:* ${formattedDate}
━━━━━━━━━━━━━━━━━━━━

${items}

━━━━━━━━━━━━━━━━━━━━
Mohon bapak/ibu menyesuaikan tugas dan jadwal masing-masing. Terima kasih.
*Wassalamu'alaikum Wr. Wb.*
_Sekretariat & Pimpinan MAN 1 Nganjuk_
_MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia)_`;
};

/**
 * Export official Excel (.xlsx) file using ExcelJS
 */
export const downloadExcel = async (agendas, roleProfiles = {}, printConfig = DEFAULT_PRINT_CONFIG) => {
  if (!agendas || !agendas.length) return false;

  const now = new Date();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MAN 1 Nganjuk - Agenda Harian';
  workbook.created = now;

  const sheet = workbook.addWorksheet('Agenda Madrasah', {
    views: [{ state: 'frozen', ySplit: 6 }]
  });

  // Setup Column Widths
  sheet.columns = [
    { key: 'no', width: 6 },
    { key: 'judul', width: 34 },
    { key: 'tglMulai', width: 14 },
    { key: 'tglSelesai', width: 14 },
    { key: 'jam', width: 15 },
    { key: 'kategori', width: 16 },
    { key: 'status', width: 20 },
    { key: 'lokasi', width: 22 },
    { key: 'penanggungJawab', width: 32 },
    { key: 'peserta', width: 28 },
    { key: 'keterangan', width: 32 },
    { key: 'hasil', width: 36 },
    { key: 'tautan', width: 24 }
  ];

  // Header Banner 1: Kemenag & MAN 1 Nganjuk
  sheet.mergeCells('A1:M1');
  const cellA1 = sheet.getCell('A1');
  cellA1.value = `${printConfig.kopHeader1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA'} - ${printConfig.kopMadrasah || 'MAN 1 NGANJUK'}`;
  cellA1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  cellA1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } }; // Islamic Green
  cellA1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 30;

  // Header Banner 2: Subtitle & Slogan
  sheet.mergeCells('A2:M2');
  const cellA2 = sheet.getCell('A2');
  cellA2.value = `MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia) · Diekspor pada ${fmt(iso(now))} pukul ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  cellA2.font = { name: 'Arial', size: 9, bold: true, italic: true, color: { argb: 'FF1B5E20' } };
  cellA2.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(2).height = 20;

  // Header Row 4: Summary Stat Bar
  sheet.mergeCells('A4:B4');
  const statTotal = sheet.getCell('A4');
  statTotal.value = `TOTAL: ${agendas.length} AGENDA`;
  statTotal.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1B5E20' } };
  statTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
  statTotal.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('C4:M4');
  const statDetails = sheet.getCell('C4');
  const terjadwal = agendas.filter(a => computeDynamicStatus(a, now) === 'Terjadwal').length;
  const berlangsung = agendas.filter(a => computeDynamicStatus(a, now) === 'Sedang Berlangsung').length;
  const terlaksana = agendas.filter(a => computeDynamicStatus(a, now) === 'Sudah Terlaksana').length;
  const dibatalkan = agendas.filter(a => a.status === 'Dibatalkan').length;

  statDetails.value = `Terjadwal: ${terjadwal}   ·   Sedang Berlangsung: ${berlangsung}   ·   Sudah Terlaksana: ${terlaksana}   ·   Dibatalkan: ${dibatalkan}`;
  statDetails.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF334155' } };
  statDetails.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  statDetails.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(4).height = 24;

  // Header Row 6: Table Column Headers
  const headerRow = sheet.getRow(6);
  headerRow.values = [
    'No.',
    'Nama Kegiatan / Agenda',
    'Tgl Mulai',
    'Tgl Selesai',
    'Waktu (WIB)',
    'Kategori',
    'Status Kegiatan',
    'Lokasi / Ruangan',
    'Penanggung Jawab',
    'Target Peserta',
    'Keterangan / Catatan',
    'Notula / Hasil Rapat',
    'Tautan Dokumen'
  ];
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }; // Dark Navy
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };
  });

  // Sort & Insert Rows
  const sorted = [...agendas].sort((a, b) =>
    (a.tgl + a.mulai).localeCompare(b.tgl + b.mulai)
  );

  sorted.forEach((a, idx) => {
    const endD = getEndDate(a);
    const status = computeDynamicStatus(a, now);
    const timeStr = `${a.mulai} ${a.selesai ? `- ${a.selesai}` : ''}`;
    const row = sheet.addRow([
      idx + 1,
      a.judul,
      a.tgl,
      endD,
      timeStr,
      a.kat,
      status,
      a.lokasi || '—',
      getRoleDisplayName(a.owner, roleProfiles),
      a.peserta || '—',
      a.ket || '—',
      a.hasil || '—',
      a.tautan || '—'
    ]);

    row.height = 22;
    const isEven = idx % 2 === 1;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 || colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6 || colNumber === 7 ? 'center' : 'left',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
  });

  // Signature Block at Bottom
  const lastRowIdx = sorted.length + 8;
  sheet.getCell(`J${lastRowIdx}`).value = `${printConfig.titimangsaKota || 'Nganjuk'}, ${fmt(iso(now), { day: 'numeric', month: 'long', year: 'numeric' })}`;
  sheet.getCell(`J${lastRowIdx + 1}`).value = printConfig.jabatanPenandatangan || 'Kepala Madrasah';
  sheet.getCell(`J${lastRowIdx + 5}`).value = printConfig.namaPenandatangan || 'Drs. H. Muh. Zuhal, M.Pd.I';
  sheet.getCell(`J${lastRowIdx + 5}`).font = { name: 'Arial', size: 10, bold: true, underline: true };
  sheet.getCell(`J${lastRowIdx + 6}`).value = `NIP. ${printConfig.nipPenandatangan || '197205102000031002'}`;

  // Export File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Agenda_MAN1_Nganjuk_${iso(now)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Universal CSV Export
 */
export const downloadCsv = (agendas, roleProfiles = {}) => {
  if (!agendas || !agendas.length) return false;

  const cell = (v) => {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  };

  const headers = [
    'No',
    'Tanggal Mulai',
    'Tanggal Selesai',
    'Jam Mulai',
    'Jam Selesai',
    'Nama Kegiatan',
    'Kategori',
    'Status Kegiatan',
    'Lokasi',
    'Penanggung Jawab',
    'Peserta',
    'Keterangan',
    'Notula / Hasil',
    'Tautan Berkas'
  ];

  const sorted = [...agendas].sort((a, b) =>
    (a.tgl + a.mulai).localeCompare(b.tgl + b.mulai)
  );

  const rows = sorted.map((a, idx) =>
    [
      idx + 1,
      a.tgl,
      getEndDate(a),
      a.mulai,
      a.selesai || '—',
      a.judul,
      a.kat,
      computeDynamicStatus(a),
      a.lokasi || '—',
      getRoleDisplayName(a.owner, roleProfiles),
      a.peserta || '—',
      a.ket || '—',
      a.hasil || '—',
      a.tautan || '—'
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
