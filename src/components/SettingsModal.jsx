import React, { useState } from 'react';
import { 
  X, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Save, 
  AlertCircle,
  Printer
} from 'lucide-react';
import { JAB, ROLES, KAT, CATEGORY_COLORS, DEFAULT_PRINT_CONFIG } from '../lib/constants';

export default function SettingsModal({
  isOpen,
  onClose,
  roleProfiles = {},
  onSaveRoleProfiles,
  templates = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  printConfig = DEFAULT_PRINT_CONFIG,
  onSavePrintConfig
}) {
  const [activeTab, setActiveTab] = useState('pejabat'); // 'pejabat' | 'templates' | 'cetak'
  const [localProfiles, setLocalProfiles] = useState(roleProfiles);
  const [localPrintConfig, setLocalPrintConfig] = useState(printConfig);
  const [isSavingProfiles, setIsSavingProfiles] = useState(false);
  const [isSavingPrint, setIsSavingPrint] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [printSuccessMsg, setPrintSuccessMsg] = useState('');

  // Template Form State
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    id: null,
    nama: '',
    judul: '',
    kat: KAT[0],
    mulai: '07:00',
    selesai: '08:00',
    lokasi: '',
    peserta: '',
    ket: ''
  });
  const [templateError, setTemplateError] = useState('');

  React.useEffect(() => {
    setLocalProfiles(roleProfiles);
    setLocalPrintConfig(printConfig);
    setProfileSuccessMsg('');
    setPrintSuccessMsg('');
    setIsEditingTemplate(false);
  }, [isOpen, roleProfiles, printConfig]);

  if (!isOpen) return null;

  const handleProfileChange = (roleKey, field, value) => {
    setLocalProfiles((prev) => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveAllProfiles = async () => {
    setIsSavingProfiles(true);
    setProfileSuccessMsg('');
    try {
      await onSaveRoleProfiles(localProfiles);
      setProfileSuccessMsg('Data nama pejabat berhasil disimpan ke database!');
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfiles(false);
    }
  };

  const handleSavePrintConfigSubmit = (e) => {
    e.preventDefault();
    setIsSavingPrint(true);
    try {
      onSavePrintConfig(localPrintConfig);
      setPrintSuccessMsg('Pengaturan template cetak & kop surat berhasil disimpan!');
      setTimeout(() => setPrintSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPrint(false);
    }
  };

  const handleOpenAddTemplate = () => {
    setTemplateFormData({
      id: null,
      nama: '',
      judul: '',
      kat: KAT[0],
      mulai: '07:00',
      selesai: '08:00',
      lokasi: '',
      peserta: '',
      ket: ''
    });
    setTemplateError('');
    setIsEditingTemplate(true);
  };

  const handleOpenEditTemplate = (tpl) => {
    setTemplateFormData({
      id: tpl.id,
      nama: tpl.nama || '',
      judul: tpl.judul || '',
      kat: tpl.kat || KAT[0],
      mulai: tpl.mulai || '07:00',
      selesai: tpl.selesai || '',
      lokasi: tpl.lokasi || '',
      peserta: tpl.peserta || '',
      ket: tpl.ket || ''
    });
    setTemplateError('');
    setIsEditingTemplate(true);
  };

  const handleSaveTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!templateFormData.nama.trim() || !templateFormData.judul.trim()) {
      setTemplateError('Nama template dan judul kegiatan wajib diisi.');
      return;
    }

    try {
      if (templateFormData.id) {
        await onUpdateTemplate(templateFormData.id, templateFormData);
      } else {
        await onCreateTemplate(templateFormData);
      }
      setIsEditingTemplate(false);
    } catch (err) {
      console.error(err);
      setTemplateError('Gagal menyimpan template. Coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
          <div>
            <h3 className="font-bold text-base sm:text-lg">Pengaturan & Master Data Madrasah</h3>
            <p className="text-xs text-emerald-100">
              Kelola nama pejabat, template agenda, dan template cetak dokumen
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setActiveTab('pejabat'); setIsEditingTemplate(false); }}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'pejabat'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nama Pejabat per Jabatan</span>
          </button>

          <button
            onClick={() => { setActiveTab('templates'); setIsEditingTemplate(false); }}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'templates'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Template Agenda Rutin ({templates.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('cetak'); setIsEditingTemplate(false); }}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'cetak'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Template Cetak & Kop</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: PEJABAT */}
          {activeTab === 'pejabat' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span>
                  💡 Nama pejabat yang diisi di bawah akan otomatis tampil pada kartu agenda, notula, dan laporan cetak/CSV.
                </span>
                <button
                  onClick={handleSaveAllProfiles}
                  disabled={isSavingProfiles}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold text-xs hover:bg-emerald-800 disabled:opacity-50 transition-all shrink-0 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfiles ? 'Menyimpan...' : 'Simpan Semua'}</span>
                </button>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Rumpun Jabatan */}
              <div className="space-y-6">
                {JAB.map(([deptKey, deptName]) => {
                  const deptRoles = ROLES.filter((r) => r.j === deptKey);
                  return (
                    <div key={deptKey} className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                          {deptName}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {deptRoles.length} Tingkat
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {deptRoles.map((role) => {
                          const currentVal = localProfiles[role.key]?.pejabat_name || '';
                          const currentNip = localProfiles[role.key]?.nip || '';

                          return (
                            <div key={role.key} className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                              <span className="block text-xs font-bold text-slate-700">
                                {role.n}
                              </span>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Nama Lengkap & Gelar"
                                  value={currentVal}
                                  onChange={(e) => handleProfileChange(role.key, 'pejabat_name', e.target.value)}
                                  className="w-full text-xs py-1.5 px-2.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="NIP (opsional)"
                                  value={currentNip}
                                  onChange={(e) => handleProfileChange(role.key, 'nip', e.target.value)}
                                  className="w-full text-[11px] py-1 px-2.5 rounded-md border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveAllProfiles}
                  disabled={isSavingProfiles}
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfiles ? 'Menyimpan...' : 'Simpan Perubahan Nama Pejabat'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES AGENDAS */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {!isEditingTemplate ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">
                      Gunakan template untuk mengisi formulir agenda rutin dalam 1-klik tanpa mengetik ulang.
                    </p>
                    <button
                      onClick={handleOpenAddTemplate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white rounded-lg font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Template Baru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {templates.map((tpl) => {
                      const catStyle = CATEGORY_COLORS[tpl.kat] || CATEGORY_COLORS['Lainnya'];
                      return (
                        <div
                          key={tpl.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                {tpl.nama}
                              </span>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0"
                                style={{
                                  borderColor: catStyle.dot + '40',
                                  backgroundColor: catStyle.dot + '15',
                                  color: catStyle.dot
                                }}
                              >
                                {tpl.kat}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2">
                              {tpl.judul}
                            </p>

                            <div className="space-y-1 text-[11px] text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{tpl.mulai} {tpl.selesai ? `– ${tpl.selesai}` : ''} WIB</span>
                              </div>
                              {tpl.lokasi && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span className="line-clamp-1">{tpl.lokasi}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditTemplate(tpl)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-800 hover:bg-slate-50 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Ubah</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus template “${tpl.nama}”?`)) {
                                  onDeleteTemplate(tpl.id);
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Template Form */
                <form onSubmit={handleSaveTemplateSubmit} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {templateFormData.id ? 'Ubah Template Agenda' : 'Tambah Template Agenda Baru'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingTemplate(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Batal
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Template (Label Cepat): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Upacara Bendera Hari Senin"
                      value={templateFormData.nama}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, nama: e.target.value })}
                      className="w-full text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul Agenda Kegiatan Default: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Upacara Bendera Hari Senin & Pengarahan Pembina"
                      value={templateFormData.judul}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, judul: e.target.value })}
                      className="w-full text-xs sm:text-sm py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kategori:
                      </label>
                      <select
                        value={templateFormData.kat}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, kat: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {KAT.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jam Mulai:
                      </label>
                      <input
                        type="time"
                        value={templateFormData.mulai}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, mulai: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jam Selesai:
                      </label>
                      <input
                        type="time"
                        value={templateFormData.selesai}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, selesai: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lokasi Default:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Lapangan Utama, Aula"
                        value={templateFormData.lokasi}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, lokasi: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Peserta:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Seluruh Guru & Siswa"
                        value={templateFormData.peserta}
                        onChange={(e) => setTemplateFormData({ ...templateFormData, peserta: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterangan / Catatan Persiapan:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pakaian dinas rapi lengkap"
                      value={templateFormData.ket}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, ket: e.target.value })}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {templateError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{templateError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingTemplate(false)}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
                    >
                      Simpan Template
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TEMPLATE CETAK & KOP SURAT */}
          {activeTab === 'cetak' && (
            <form onSubmit={handleSavePrintConfigSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Atur kop surat resmi madrasah, format tanda tangan, dan jenis tata letak dokumen cetak default.
              </div>

              {printSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{printSuccessMsg}</span>
                </div>
              )}

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-xs uppercase text-slate-700 tracking-wider block border-b pb-1.5">
                  1. Kop Surat Dokumen Resmi
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Instansi Atas (Baris 1):</label>
                    <input
                      type="text"
                      value={localPrintConfig.kopHeader1 || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, kopHeader1: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kantor Kemenag (Baris 2):</label>
                    <input
                      type="text"
                      value={localPrintConfig.kopHeader2 || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, kopHeader2: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Madrasah:</label>
                    <input
                      type="text"
                      value={localPrintConfig.kopMadrasah || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, kopMadrasah: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white font-bold text-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat & Telepon Kop:</label>
                    <input
                      type="text"
                      value={localPrintConfig.kopAlamat || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, kopAlamat: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-xs uppercase text-slate-700 tracking-wider block border-b pb-1.5">
                  2. Lembar Tanda Tangan Cetak & Excel
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kota Titimangsa:</label>
                    <input
                      type="text"
                      value={localPrintConfig.titimangsaKota || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, titimangsaKota: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Penandatangan:</label>
                    <input
                      type="text"
                      value={localPrintConfig.jabatanPenandatangan || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, jabatanPenandatangan: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pejabat:</label>
                    <input
                      type="text"
                      value={localPrintConfig.namaPenandatangan || ''}
                      onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, namaPenandatangan: e.target.value })}
                      className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Penandatangan:</label>
                  <input
                    type="text"
                    value={localPrintConfig.nipPenandatangan || ''}
                    onChange={(e) => setLocalPrintConfig({ ...localPrintConfig, nipPenandatangan: e.target.value })}
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPrint}
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingPrint ? 'Menyimpan...' : 'Simpan Pengaturan Template Cetak'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
