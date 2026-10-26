import React from 'react';
import { UserCheck, KeyRound, Plus, Printer, Download } from 'lucide-react';
import { getRoleName } from '../lib/constants';

export default function Header({
  activeView,
  setActiveView,
  activeRole,
  onOpenRoleModal,
  onOpenAdd,
  onPrint,
  onDownloadCsv
}) {
  const titles = {
    d: 'Dashboard Kegiatan',
    h: 'Agenda Hari Ini',
    p: 'Agenda Pekan Ini',
    b: 'Agenda Bulanan'
  };

  const tabs = [
    { id: 'd', label: 'Dashboard' },
    { id: 'h', label: 'Hari Ini' },
    { id: 'p', label: 'Pekan' },
    { id: 'b', label: 'Bulan' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Mobile School Logo & Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo-man1.png"
            alt="Logo MAN 1 Nganjuk"
            className="w-9 h-9 object-contain lg:hidden rounded-md"
          />
          <div>
            <h2 className="font-bold text-slate-900 text-base lg:text-lg leading-tight">
              {titles[activeView]}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              MAN 1 Nganjuk · Sinkronisasi Realtime
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button on mobile */}
          <button
            onClick={onOpenAdd}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
            title="Tambah Agenda"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Quick Print & CSV for medium screens */}
          <button
            onClick={onPrint}
            className="hidden sm:inline-flex lg:hidden items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Cetak"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={onDownloadCsv}
            className="hidden sm:inline-flex lg:hidden items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Unduh CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Role Status Pill */}
          <button
            onClick={onOpenRoleModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeRole
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[200px]">
              {activeRole ? getRoleName(activeRole) : 'Pilih Jabatan'}
            </span>
            <span className="text-[10px] text-slate-400">▾</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Tabs */}
      <div className="lg:hidden border-t border-slate-100 px-4 py-1.5 flex gap-1 overflow-x-auto scrollbar-none bg-slate-50/60">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
