import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import { JAB, KAT, STA, getRoleDisplayName } from '../lib/constants';
import { iso, monday, addD, fmt, onDate } from '../lib/utils';
import AgendaCard from './AgendaCard';

export default function WeekView({
  agendas = [],
  activeRole,
  roleProfiles = {},
  onEditAgenda,
  onDeleteAgenda,
  onOpenAdd
}) {
  const [currentDate, setCurrentDate] = useState(iso(new Date()));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const currentMonday = monday(currentDate);
  const weekDays = [0, 1, 2, 3, 4, 5].map((i) => addD(currentMonday, i));
  const weekEnd = weekDays[5];

  const handlePrevWeek = () => setCurrentDate(addD(currentMonday, -7));
  const handleNextWeek = () => setCurrentDate(addD(currentMonday, 7));
  const handleToday = () => setCurrentDate(iso(new Date()));

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Navigation Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          title="Pekan Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex-1">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            {fmt(currentMonday, { day: 'numeric', month: 'short' })} – {fmt(weekEnd, { day: 'numeric', month: 'short', year: 'numeric' })}
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
            Pekan Kerja Madrasah (Senin – Sabtu)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors hidden sm:block"
          >
            Pekan Ini
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Pekan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kegiatan, lokasi, peserta, atau nama penanggung jawab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={filterJabatan}
            onChange={(e) => setFilterJabatan(e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Jabatan</option>
            {JAB.map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Kategori</option>
            {KAT.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Semua Status</option>
            {STA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days Breakdown */}
      <div className="space-y-6">
        {weekDays.map((dayStr) => {
          const isToday = dayStr === iso(new Date());
          const dayAgendas = agendas
            .filter((a) => onDate(a, dayStr))
            .filter((a) => {
              if (filterJabatan && !a.owner.startsWith(filterJabatan)) return false;
              if (filterKategori && a.kat !== filterKategori) return false;
              if (filterStatus && a.status !== filterStatus) return false;
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const searchable = [
                  a.judul,
                  a.lokasi,
                  a.peserta,
                  a.ket,
                  a.hasil,
                  getRoleDisplayName(a.owner, roleProfiles)
                ]
                  .join(' ')
                  .toLowerCase();
                if (!searchable.includes(q)) return false;
              }
              return true;
            })
            .sort((a, b) => a.mulai.localeCompare(b.mulai));

          return (
            <div key={dayStr} className="space-y-2.5">
              {/* Day Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {fmt(dayStr, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h4>
                  {isToday && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Hari Ini
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {dayAgendas.length} agenda
                </span>
              </div>

              {/* Day Agendas */}
              {dayAgendas.length > 0 ? (
                <div className="space-y-3">
                  {dayAgendas.map((a) => (
                    <AgendaCard
                      key={a.id}
                      agenda={a}
                      allAgendas={agendas}
                      activeRole={activeRole}
                      roleProfiles={roleProfiles}
                      onEdit={onEditAgenda}
                      onDelete={onDeleteAgenda}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-slate-100">
                  Tidak ada agenda terjadwal pada hari ini.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
