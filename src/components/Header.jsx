import React from 'react';
import { UserCheck, Plus, Printer, Download, Settings, Tv, Share2 } from 'lucide-react';
import { getRoleDisplayName } from '../lib/constants';

export default function Header({
  activeView,
  setActiveView,
  activeRole,
  roleProfiles = {},
  onOpenRoleModal,
  onOpenAdd,
  onOpenPrintModal,
  onOpenExportModal,
  onOpenKioskModal,
  onShareDailyRecapWa,
  onOpenSettings
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2.5">
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
            <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-emerald-800">MAN 1 Nganjuk Berdaya</span>
              <span className="text-slate-400">·</span>
              <span className="italic text-slate-600 font-medium">(Bermakna, Berbudaya, Mendunia)</span>
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Add Button on mobile */}
          <button
            onClick={onOpenAdd}
            className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
            title="Tambah Agenda"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Quick Share WA on mobile/medium */}
          <button
            onClick={onShareDailyRecapWa}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
            title="Bagikan Rekap Hari Ini ke WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Kiosk Mode Button */}
          <button
            onClick={onOpenKioskModal}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-800 hover:bg-slate-50 transition-colors"
            title="Mode TV Informasi (Layar Penuh)"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Print Template Button for mobile/medium */}
          <button
            onClick={onOpenPrintModal}
            className="hidden sm:inline-flex lg:hidden items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            title="Template Cetak"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Export Modal Button for mobile/medium */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:inline-flex lg:hidden items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            title="Unduh Data"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-800 hover:bg-slate-50 transition-colors"
            title="Pengaturan & Master Data"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Role Status Pill */}
          <button
            onClick={onOpenRoleModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeRole
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[180px]">
              {activeRole ? getRoleDisplayName(activeRole, roleProfiles) : 'Pilih Jabatan'}
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
