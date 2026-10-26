import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  PlusCircle, 
  Printer, 
  Download, 
  UserCheck, 
  KeyRound, 
  LogOut,
  Settings
} from 'lucide-react';
import { getRoleDisplayName } from '../lib/constants';

export default function Sidebar({
  activeView,
  setActiveView,
  onOpenAdd,
  onPrint,
  onDownloadCsv,
  activeRole,
  roleProfiles = {},
  onOpenRoleModal,
  onOpenChangePin,
  onOpenSettings,
  onLogout
}) {
  const navItems = [
    { id: 'd', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'h', label: 'Agenda Hari Ini', icon: Calendar },
    { id: 'p', label: 'Agenda Pekan', icon: CalendarRange },
    { id: 'b', label: 'Agenda Bulanan', icon: CalendarDays },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-68 bg-white border-r border-slate-200 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-emerald-800 text-white shadow-xs">
        <img 
          src="/logo-man1.png" 
          alt="Logo MAN 1 Nganjuk" 
          className="w-11 h-11 object-contain drop-shadow-sm bg-white/10 rounded-lg p-1"
        />
        <div>
          <h1 className="font-bold text-base tracking-tight leading-tight">MAN 1 Nganjuk</h1>
          <p className="text-xs text-emerald-100 font-medium">Agenda Harian Terpadu</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Tampilan Kalender
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Tindakan Cepat
        </div>

        <button
          onClick={onOpenAdd}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.99] transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Agenda</span>
        </button>

        <button
          onClick={onPrint}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
        >
          <Printer className="w-4 h-4 text-slate-400" />
          <span>Cetak Agenda</span>
        </button>

        <button
          onClick={onDownloadCsv}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Unduh Data (CSV)</span>
        </button>

        <div className="pt-4 px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Master Data
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left border border-slate-200"
        >
          <Settings className="w-4 h-4 text-emerald-700" />
          <span>Pengaturan & Template</span>
        </button>
      </div>

      {/* User / Role Section at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        {activeRole ? (
          <div className="space-y-2">
            <div className="px-2 py-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Jabatan Aktif
              </span>
              <span className="font-semibold text-xs text-emerald-900 line-clamp-1" title={getRoleDisplayName(activeRole, roleProfiles)}>
                {getRoleDisplayName(activeRole, roleProfiles)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onOpenChangePin}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                title="Ubah PIN Jabatan"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Ubah PIN</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors"
                title="Keluar dari Jabatan"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            </div>
            <button
              onClick={onOpenRoleModal}
              className="w-full py-1.5 text-center text-xs font-medium text-emerald-700 hover:underline"
            >
              Ganti ke Jabatan Lain
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenRoleModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Pilih Jabatan (Login PIN)</span>
          </button>
        )}
      </div>
    </aside>
  );
}
