import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Calendar, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { iso, addD, fmt, onDate, computeDynamicStatus } from '../lib/utils';
import { getRoleDisplayName, CATEGORY_COLORS } from '../lib/constants';

export default function KioskModal({
  isOpen,
  onClose,
  agendas = [],
  roleProfiles = {}
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = iso(time);
  const tomorrowStr = addD(todayStr, 1);

  const todayAgendas = agendas
    .filter((a) => onDate(a, todayStr))
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  const tomorrowAgendas = agendas
    .filter((a) => onDate(a, tomorrowStr))
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  const timeString = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const currentTimeShort = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

  const nextAgenda = todayAgendas.find(
    (a) => a.status !== 'Dibatalkan' && (a.selesai || a.mulai) >= currentTimeShort
  );

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Kiosk Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img
            src="/logo-man1.png"
            alt="Logo MAN 1 Nganjuk"
            className="w-12 h-12 object-contain bg-white/10 rounded-xl p-1 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
                MAN 1 NGANJUK
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-[10px] font-bold text-amber-300">
                MAN 1 Nganjuk Berdaya
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold tracking-wider">
              Layar Informasi & Agenda Dinas <span className="text-emerald-200/80 font-normal italic lowercase">(Bermakna, Berbudaya, Mendunia)</span>
            </p>
          </div>
        </div>

        {/* Live Clock & Fullscreen Control */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-300">
              {timeString} <span className="text-xs font-sans text-slate-400 font-semibold">WIB</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {fmt(todayStr)}
            </div>
          </div>

          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Layar Penuh (Fullscreen)"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition-colors"
            title="Tutup Mode Layar Informasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Today's Agendas (2 cols) */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-base sm:text-lg text-white">
                Daftar Kegiatan Hari Ini ({todayAgendas.length})
              </h2>
            </div>
            <span className="text-xs text-emerald-300 font-semibold px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800">
              Live Real-Time
            </span>
          </div>

          {/* Scrolling List */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
            {todayAgendas.length > 0 ? (
              todayAgendas.map((a) => {
                const liveStatus = computeDynamicStatus(a, time);
                const isOngoing = liveStatus === 'Sedang Berlangsung';
                const isDone = liveStatus === 'Sudah Terlaksana';
                const isCancelled = a.status === 'Dibatalkan';
                const catColor = CATEGORY_COLORS[a.kat]?.dot || '#64748b';

                return (
                  <div
                    key={a.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isOngoing
                        ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
                        : isDone
                        ? 'bg-slate-900/60 border-slate-800 opacity-70'
                        : isCancelled
                        ? 'bg-slate-900/40 border-slate-800 opacity-50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-300 font-mono bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                          {a.mulai} {a.selesai ? `– ${a.selesai}` : ''} WIB
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                          style={{ backgroundColor: `${catColor}25`, color: catColor }}
                        >
                          {a.kat}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isOngoing
                            ? 'bg-emerald-500 text-slate-950 animate-pulse font-extrabold'
                            : isDone
                            ? 'bg-slate-800 text-slate-400'
                            : isCancelled
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-blue-950 text-blue-300'
                        }`}
                      >
                        {liveStatus}
                      </span>
                    </div>

                    <h3 className={`font-bold text-base sm:text-lg text-white mb-2 ${isCancelled ? 'line-through' : ''}`}>
                      {a.judul}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-medium">{a.lokasi || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>PJ: <strong className="text-slate-200">{getRoleDisplayName(a.owner, roleProfiles)}</strong></span>
                      </div>
                      {a.peserta && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Peserta: {a.peserta}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mb-2" />
                <p className="font-semibold text-sm">Tidak ada agenda dinas khusus hari ini.</p>
                <p className="text-xs text-slate-600 mt-0.5">KBM dan administrasi madrasah berjalan normal.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Next Agenda & Tomorrow's Peek (1 col) */}
        <div className="flex flex-col gap-5 h-full overflow-hidden">
          {/* Next Immediate Agenda Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-700/60 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
              <span>Agenda Berikutnya</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            {nextAgenda ? (
              <div className="space-y-2">
                <span className="inline-block text-xs font-extrabold text-emerald-950 bg-emerald-400 px-2.5 py-0.5 rounded-md font-mono">
                  {nextAgenda.mulai} {nextAgenda.selesai ? `– ${nextAgenda.selesai}` : ''} WIB
                </span>
                <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2">
                  {nextAgenda.judul}
                </h3>
                <p className="text-xs text-slate-300">
                  📍 {nextAgenda.lokasi || 'Lokasi belum ditentukan'}
                </p>
                <p className="text-xs text-slate-300">
                  👤 {getRoleDisplayName(nextAgenda.owner, roleProfiles)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">
                Semua agenda dinas untuk hari ini telah selesai terlaksana.
              </p>
            )}
          </div>

          {/* Tomorrow's Peek */}
          <div className="flex-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="font-bold text-xs uppercase text-slate-400 tracking-wider">
                Sekilas Agenda Besok ({tomorrowAgendas.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {fmt(tomorrowStr, { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {tomorrowAgendas.length > 0 ? (
                tomorrowAgendas.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-mono font-bold text-[11px]">
                      <span>{a.mulai} WIB</span>
                      <span className="text-slate-500 font-sans">{a.kat}</span>
                    </div>
                    <h4 className="font-semibold text-slate-200 line-clamp-1">{a.judul}</h4>
                    <p className="text-[11px] text-slate-400">📍 {a.lokasi || '—'}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">
                  Belum ada agenda tercatat untuk besok.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
