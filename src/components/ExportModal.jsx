import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { downloadExcel, downloadCsv, onDate, iso, monday, addD, pd } from '../lib/utils';
import { DEFAULT_PRINT_CONFIG } from '../lib/constants';

export default function ExportModal({
  isOpen,
  onClose,
  agendas = [],
  roleProfiles = {},
  printConfig = DEFAULT_PRINT_CONFIG,
  onShowToast
}) {
  const [format, setFormat] = useState('excel'); // 'excel' | 'csv'
  const [scope, setScope] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const todayStr = iso(new Date());
  const monStr = monday(todayStr);
  const weekDays = [0, 1, 2, 3, 4, 5].map((i) => addD(monStr, i));
  const currentMonth = new Date().getMonth();

  // Filter agendas by selected scope
  const targetAgendas = agendas.filter((a) => {
    if (scope === 'today') {
      return onDate(a, todayStr);
    } else if (scope === 'week') {
      return weekDays.some((d) => onDate(a, d));
    } else if (scope === 'month') {
      return pd(a.tgl).getMonth() === currentMonth;
    }
    return true;
  });

  const handleExport = async () => {
    if (!targetAgendas.length) {
      onShowToast('Tidak ada data agenda pada rentang waktu yang dipilih.', 'info');
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'excel') {
        await downloadExcel(targetAgendas, roleProfiles, printConfig);
        onShowToast(`File Excel resmi (${targetAgendas.length} agenda) berhasil diunduh.`);
      } else {
        downloadCsv(targetAgendas, roleProfiles);
        onShowToast(`File CSV (${targetAgendas.length} agenda) berhasil diunduh.`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      onShowToast('Gagal mengunduh file data.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Template & Unduh Data Agenda</h3>
              <p className="text-xs text-emerald-100">Ekspor rekapitulasi data ke format spreadsheet</p>
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
        <div className="p-4 sm:p-6 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Pilih Format File Unduhan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setFormat('excel')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  format === 'excel'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className={`w-5 h-5 ${format === 'excel' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Excel (.XLSX)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Format tabel resmi Kemenag, kop warna, dan lembar tanda tangan.
                </p>
              </div>

              <div
                onClick={() => setFormat('csv')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  format === 'csv'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-5 h-5 ${format === 'csv' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs sm:text-sm text-slate-900">CSV Universal</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Format teks ringan kompatibel dengan Google Sheets & sistem lain.
                </p>
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Pilih Lingkup Waktu Data:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'Semua Agenda' },
                { id: 'today', label: 'Hari Ini' },
                { id: 'week', label: 'Pekan Ini' },
                { id: 'month', label: 'Bulan Ini' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScope(item.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    scope === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Jumlah agenda yang akan diekspor:</span>
            <span className="font-extrabold text-emerald-800 text-sm">{targetAgendas.length} Data</span>
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
            onClick={handleExport}
            disabled={isExporting}
            className="py-2 px-5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Menyiapkan File...' : `Unduh ${format === 'excel' ? 'Excel (.xlsx)' : 'CSV'}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
