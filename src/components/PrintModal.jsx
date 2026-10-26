import React, { useState } from 'react';
import { X, Printer, FileText, LayoutGrid, CheckCircle2, Sliders } from 'lucide-react';
import { DEFAULT_PRINT_CONFIG } from '../lib/constants';

export default function PrintModal({
  isOpen,
  onClose,
  printConfig = DEFAULT_PRINT_CONFIG,
  onUpdatePrintConfig,
  onTriggerPrint
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(printConfig.templateType || 'rekap');
  const [showConfig, setShowConfig] = useState(false);
  const [localConfig, setLocalConfig] = useState(printConfig);

  React.useEffect(() => {
    setLocalConfig(printConfig);
    setSelectedTemplate(printConfig.templateType || 'rekap');
  }, [printConfig, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    onUpdatePrintConfig({
      ...localConfig,
      templateType: selectedTemplate
    });
    onClose();
    setTimeout(() => {
      onTriggerPrint();
    }, 200);
  };

  const templates = [
    {
      id: 'rekap',
      title: '1. Format Rekap Eksekutif Dinas (Standar Kemenag)',
      desc: 'Tabel rekapitulasi dinas lengkap dengan Kop Kemenag MAN 1 Nganjuk, kolom rincian waktu, lokasi, penanggung jawab, serta lembar tanda tangan Kepala Madrasah di bagian bawah.',
      icon: FileText,
      badge: 'Paling Populer'
    },
    {
      id: 'matriks',
      title: '2. Format Matriks Papan Pengumuman (Jadwal Mingguan)',
      desc: 'Format jadwal kalender per hari kerja (Senin–Sabtu) dengan kolom jelas. Sangat cocok dicetak untuk ditempel di mading ruang guru, lobi madrasah, atau papan tata usaha.',
      icon: LayoutGrid,
      badge: 'Mading & Info'
    },
    {
      id: 'notula',
      title: '3. Format Berita Acara & Notula Kegiatan',
      desc: 'Format lembar berita acara dinas yang menonjolkan ringkasan notula hasil rapat, daftar peserta, dan lembar tanda tangan notulis/pemimpin rapat.',
      icon: CheckCircle2,
      badge: 'Arsip Notulen'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Pilih Template Cetak Dokumen</h3>
              <p className="text-xs text-emerald-100">Cetak lembar agenda resmi / simpan sebagai PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-slate-500">
            Pilih tata letak (template) dokumen cetak yang sesuai dengan kebutuhan pelaporan dinas atau publikasi madrasah:
          </p>

          {/* Template Choices */}
          <div className="space-y-3">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {tpl.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {tpl.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6">{tpl.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Toggle Kustomisasi Kop & Penandatangan */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showConfig ? 'Sembunyikan Pengaturan Kop & Tanda Tangan' : 'Atur Kop Surat & Pejabat Penandatangan'}</span>
            </button>

            {showConfig && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kop Baris 1:</label>
                    <input
                      type="text"
                      value={localConfig.kopHeader1 || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, kopHeader1: e.target.value })}
                      className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kop Baris 2:</label>
                    <input
                      type="text"
                      value={localConfig.kopHeader2 || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, kopHeader2: e.target.value })}
                      className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kota Titimangsa:</label>
                    <input
                      type="text"
                      value={localConfig.titimangsaKota || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, titimangsaKota: e.target.value })}
                      className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jabatan Penandatangan:</label>
                    <input
                      type="text"
                      value={localConfig.jabatanPenandatangan || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, jabatanPenandatangan: e.target.value })}
                      className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Pejabat:</label>
                    <input
                      type="text"
                      value={localConfig.namaPenandatangan || ''}
                      onChange={(e) => setLocalConfig({ ...localConfig, namaPenandatangan: e.target.value })}
                      className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Penandatangan:</label>
                  <input
                    type="text"
                    value={localConfig.nipPenandatangan || ''}
                    onChange={(e) => setLocalConfig({ ...localConfig, nipPenandatangan: e.target.value })}
                    className="w-full py-1.5 px-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
