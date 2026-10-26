import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { KAT, CATEGORY_COLORS, getRoleName } from '../lib/constants';
import { iso, monday, addD, fmt, onDate, conflicts } from '../lib/utils';
import AgendaCard from './AgendaCard';

export default function DashboardView({
  agendas = [],
  activeRole,
  onNavigateView,
  onEditAgenda,
  onDeleteAgenda,
  onOpenAdd
}) {
  const todayStr = iso(new Date());
  const monStr = monday(todayStr);
  const weekDates = [0, 1, 2, 3, 4, 5].map((i) => addD(monStr, i));

  // Today's agendas sorted by start time
  const todayAgendas = agendas
    .filter((a) => onDate(a, todayStr))
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  // Week's agendas
  const weekAgendas = agendas.filter((a) =>
    weekDates.some((d) => onDate(a, d))
  );

  const completedCount = weekAgendas.filter((a) => a.status === 'Selesai').length;
  const conflictCount = weekAgendas.filter((a) => conflicts(a, agendas).length > 0).length;

  // Next upcoming agenda for today
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextAgenda = todayAgendas.find(
    (a) => a.status !== 'Dibatalkan' && (a.selesai || a.mulai) >= currentTime
  );

  // Weekly category chart data
  const maxInDay = Math.max(1, ...weekDates.map((d) => weekAgendas.filter((a) => onDate(a, d)).length));

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Next Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Agenda Resmi MAN 1 Nganjuk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Selamat Datang di Portal Agenda
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              {fmt(todayStr)}
            </p>
            <p className="text-xs text-emerald-200/90 mt-2">
              {activeRole ? (
                <>Anda aktif sebagai: <strong className="text-white underline">{getRoleName(activeRole)}</strong></>
              ) : (
                <>Pilih jabatan Anda di bilah menu untuk mengelola agenda madrasah.</>
              )}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between z-10">
            <span className="text-xs text-emerald-200">
              Sinkronisasi data aktif & otomatis
            </span>
            <button
              onClick={onOpenAdd}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              + Tambah Agenda
            </button>
          </div>
        </div>

        {/* Next Agenda Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Agenda Terdekat Berikutnya</span>
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            {nextAgenda ? (
              <div className="space-y-1.5 pt-1">
                <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {nextAgenda.mulai} {nextAgenda.selesai ? `– ${nextAgenda.selesai}` : ''} WIB
                </span>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                  {nextAgenda.judul}
                </h4>
                <p className="text-xs text-slate-500">
                  📍 {nextAgenda.lokasi || 'Lokasi belum ditentukan'}
                </p>
                <p className="text-xs text-slate-500">
                  👤 {getRoleName(nextAgenda.owner)}
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium">Tidak ada agenda tersisa hari ini.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateView('h')}
            className="w-full mt-3 py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Buka Kalender Hari Ini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Agenda Hari Ini</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {todayAgendas.length}
            </div>
          </div>
          <button
            onClick={() => onNavigateView('h')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 text-left flex items-center gap-1"
          >
            <span>Lihat Hari Ini</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Agenda Pekan Ini</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {weekAgendas.length}
            </div>
          </div>
          <button
            onClick={() => onNavigateView('p')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 text-left flex items-center gap-1"
          >
            <span>Lihat Pekan Ini</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Selesai Pekan Ini</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {completedCount}
            </div>
          </div>
          <button
            onClick={() => onNavigateView('p')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 text-left flex items-center gap-1"
          >
            <span>Daftar Selesai</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Jadwal Bentrok</span>
            <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${conflictCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {conflictCount}
            </div>
          </div>
          <button
            onClick={() => onNavigateView('p')}
            className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 text-left flex items-center gap-1"
          >
            <span>Periksa Bentrok</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Weekly Category Distribution Stacked Bar Chart */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Distribusi Agenda Pekan Ini (Senin – Sabtu)
          </h3>
          <span className="text-xs text-slate-500">
            {fmt(monStr, { day: 'numeric', month: 'short' })} – {fmt(addD(monStr, 5), { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Stacked Bars */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 sm:h-56 pt-6 pb-2 border-b border-slate-100 items-end">
          {weekDates.map((dayStr) => {
            const dayAgendas = weekAgendas.filter((a) => onDate(a, dayStr));
            const isToday = dayStr === todayStr;

            return (
              <div key={dayStr} className="flex flex-col items-center h-full justify-end">
                <span className="text-[11px] font-bold text-slate-400 mb-1">
                  {dayAgendas.length || ''}
                </span>
                <div className="w-full max-w-[40px] flex flex-col-reverse rounded-t-lg overflow-hidden bg-slate-100 h-full max-h-[160px]">
                  {KAT.map((k) => {
                    const count = dayAgendas.filter((a) => a.kat === k).length;
                    if (!count) return null;
                    const heightPercent = (count / maxInDay) * 100;
                    const color = CATEGORY_COLORS[k]?.dot || '#64748b';
                    return (
                      <div
                        key={k}
                        style={{ height: `${heightPercent}%`, backgroundColor: color }}
                        title={`${k}: ${count} agenda`}
                        className="w-full transition-all"
                      />
                    );
                  })}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isToday ? 'text-emerald-700 font-bold underline' : 'text-slate-600'
                  }`}
                >
                  {fmt(dayStr, { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs text-slate-600">
          {KAT.map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[k]?.dot || '#64748b' }}
              />
              <span>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Agenda List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-base">
            Daftar Kegiatan Hari Ini ({fmt(todayStr)})
          </h3>
          <span className="text-xs text-slate-500">
            {todayAgendas.length} kegiatan tercatat
          </span>
        </div>

        {todayAgendas.length > 0 ? (
          <div className="space-y-3">
            {todayAgendas.map((a) => (
              <AgendaCard
                key={a.id}
                agenda={a}
                allAgendas={agendas}
                activeRole={activeRole}
                onEdit={onEditAgenda}
                onDelete={onDeleteAgenda}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Belum ada agenda pada hari ini.</p>
            <p className="text-xs text-slate-400 mt-1">
              Ketuk tombol “Tambah Agenda” untuk menjadwalkan kegiatan baru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
