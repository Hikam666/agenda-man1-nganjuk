import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { KAT, STA, getRoleDisplayName } from '../lib/constants';
import { iso, tmin, conflicts } from '../lib/utils';

export default function AgendaFormModal({
  isOpen,
  onClose,
  initialData = null,
  activeRole,
  allAgendas = [],
  templates = [],
  roleProfiles = {},
  onSave
}) {
  const [formData, setFormData] = useState({
    judul: '',
    tgl: iso(),
    tgl_end: iso(),
    mulai: '07:00',
    selesai: '08:00',
    kat: KAT[0],
    lokasi: '',
    peserta: '',
    ket: '',
    status: 'Terjadwal',
    hasil: '',
    owner: ''
  });

  const [warned, setWarned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [conflictList, setConflictList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        judul: initialData.judul || '',
        tgl: initialData.tgl || iso(),
        tgl_end: initialData.tgl_end || initialData.tglEnd || initialData.tgl || iso(),
        mulai: initialData.mulai || '07:00',
        selesai: initialData.selesai || '',
        kat: initialData.kat || KAT[0],
        lokasi: initialData.lokasi || '',
        peserta: initialData.peserta || '',
        ket: initialData.ket || '',
        status: initialData.status || 'Terjadwal',
        hasil: initialData.hasil || '',
        owner: initialData.owner || activeRole || ''
      });
    } else {
      setFormData({
        judul: '',
        tgl: iso(),
        tgl_end: iso(),
        mulai: '07:00',
        selesai: '08:00',
        kat: KAT[0],
        lokasi: '',
        peserta: '',
        ket: '',
        status: 'Terjadwal',
        hasil: '',
        owner: activeRole || ''
      });
    }
    setWarned(false);
    setErrorMessage('');
    setConflictList([]);
    setSelectedTemplateId('');
  }, [initialData, activeRole, isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setFormData((prev) => ({
        ...prev,
        judul: tpl.judul || prev.judul,
        kat: tpl.kat || prev.kat,
        mulai: tpl.mulai || prev.mulai,
        selesai: tpl.selesai || prev.selesai,
        lokasi: tpl.lokasi || prev.lokasi,
        peserta: tpl.peserta || prev.peserta,
        ket: tpl.ket || prev.ket
      }));
      setWarned(false);
    }
  };

  const handleStartDateChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, tgl: val };
      if (next.tgl_end < val) {
        next.tgl_end = val;
      }
      return next;
    });
    setWarned(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.judul.trim() || !formData.tgl || !formData.mulai) {
      setErrorMessage('Isi kegiatan, tanggal, dan jam mulai terlebih dahulu.');
      return;
    }

    if (formData.tgl_end < formData.tgl) {
      setErrorMessage('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    if (formData.selesai && tmin(formData.selesai) <= tmin(formData.mulai)) {
      setErrorMessage('Jam selesai harus setelah jam mulai.');
      return;
    }

    // Check conflict
    const potentialAgenda = {
      id: initialData?.id || '',
      ...formData
    };

    const detectedConflicts = conflicts(potentialAgenda, allAgendas);
    if (detectedConflicts.length > 0 && !warned) {
      setConflictList(detectedConflicts);
      setWarned(true);
      return;
    }

    // Proceed saving
    setIsSubmitting(true);
    try {
      await onSave(formData, initialData?.id);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal menyimpan agenda. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {initialData ? 'Ubah Agenda Kegiatan' : 'Tambah Agenda Baru'}
            </h3>
            <p className="text-xs text-emerald-100">
              Penanggung Jawab: {getRoleDisplayName(formData.owner || activeRole, roleProfiles)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Template Selector */}
          {!initialData && templates.length > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gunakan Template Agenda (Isi Otomatis 1-Klik):</span>
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full text-xs font-medium py-1.5 px-3 rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Template Kegiatan Rutin --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.nama} ({tpl.kat})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Judul Kegiatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kegiatan / Agenda: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Rapat Koordinasi Kurikulum Semester Ganjil"
              value={formData.judul}
              onChange={(e) => {
                setFormData({ ...formData, judul: e.target.value });
                setWarned(false);
              }}
              className="w-full text-sm font-medium py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Tanggal Mulai & Tanggal Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai: <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.tgl}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.tgl_end}
                  min={formData.tgl}
                  onChange={(e) => {
                    setFormData({ ...formData, tgl_end: e.target.value });
                    setWarned(false);
                  }}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Jam Mulai, Jam Selesai & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai: <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.mulai}
                onChange={(e) => {
                  setFormData({ ...formData, mulai: e.target.value });
                  setWarned(false);
                }}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai:
              </label>
              <input
                type="time"
                value={formData.selesai}
                onChange={(e) => {
                  setFormData({ ...formData, selesai: e.target.value });
                  setWarned(false);
                }}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori:
              </label>
              <select
                value={formData.kat}
                onChange={(e) => setFormData({ ...formData, kat: e.target.value })}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {KAT.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lokasi & Target Peserta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi / Ruangan:
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang Guru, Aula Utama, Lapangan"
                value={formData.lokasi}
                onChange={(e) => {
                  setFormData({ ...formData, lokasi: e.target.value });
                  setWarned(false);
                }}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Peserta:
              </label>
              <input
                type="text"
                placeholder="Contoh: Seluruh Dewan Guru, OSIM, Kelas X"
                value={formData.peserta}
                onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Keterangan & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Catatan Persiapan:
              </label>
              <input
                type="text"
                placeholder="Catatan perlengkapan, dress code, surat tugas"
                value={formData.ket}
                onChange={(e) => setFormData({ ...formData, ket: e.target.value })}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kegiatan:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {STA.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan Hasil / Notula */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Notula / Hasil Kegiatan (Opsional):
            </label>
            <textarea
              rows={2}
              placeholder="Tuliskan ringkasan hasil rapat atau keputusan kegiatan jika sudah terlaksana"
              value={formData.hasil}
              onChange={(e) => setFormData({ ...formData, hasil: e.target.value })}
              className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-y min-h-[60px]"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Conflict Warning Box */}
          {warned && conflictList.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Peringatan Jadwal Bentrok Terdeteksi!</span>
              </div>
              <p className="text-amber-800">
                Jadwal ini bertabrakan waktu dengan:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-medium pl-1 text-amber-900">
                {conflictList.map((c) => (
                  <li key={c.id}>
                    “{c.judul}” (Jam {c.mulai}, {getRoleDisplayName(c.owner, roleProfiles)}{c.lokasi ? `, Lokasi: ${c.lokasi}` : ''})
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 pt-1 font-semibold">
                👉 Ketuk tombol <strong className="underline">“Simpan Tetap Lanjut”</strong> di bawah jika Anda tetap ingin menjadwalkan agenda ini.
              </p>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2.5 px-5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                warned
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : warned
                ? 'Simpan Tetap Lanjut ⚠'
                : initialData
                ? 'Simpan Perubahan'
                : 'Tambah Agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
