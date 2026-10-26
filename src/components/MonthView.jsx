import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CATEGORY_COLORS } from '../lib/constants';
import { iso, pd, addD, fmt, monday, onDate } from '../lib/utils';
import AgendaCard from './AgendaCard';

export default function MonthView({
  agendas = [],
  activeRole,
  roleProfiles = {},
  onEditAgenda,
  onDeleteAgenda,
  onOpenAdd
}) {
  const [currentDate, setCurrentDate] = useState(iso(new Date()));
  const [selectedDate, setSelectedDate] = useState(iso(new Date()));

  const dateObj = pd(currentDate);
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startGridDate = monday(iso(firstDayOfMonth));

  // Build 35 or 42 grid cells
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dStr = addD(startGridDate, i);
    const dObj = pd(dStr);
    if (i % 7 === 0 && i >= 28 && dObj.getMonth() !== month) {
      break;
    }
    cells.push(dStr);
  }

  const handlePrevMonth = () => {
    const d = pd(currentDate);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(iso(d));
  };

  const handleNextMonth = () => {
    const d = pd(currentDate);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(iso(d));
  };

  const handleToday = () => {
    const td = iso(new Date());
    setCurrentDate(td);
    setSelectedDate(td);
  };

  const selectedAgendas = agendas
    .filter((a) => onDate(a, selectedDate))
    .sort((a, b) => a.mulai.localeCompare(b.mulai));

  const weekHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Navigation Header */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex-1">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base capitalize">
            {fmt(currentDate, { month: 'long', year: 'numeric' })}
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
            Kalender Bulanan Madrasah
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors hidden sm:block"
          >
            Bulan Ini
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {weekHeaders.map((day) => (
            <div key={day} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((dStr) => {
            const cellDate = pd(dStr);
            const isCurrentMonth = cellDate.getMonth() === month;
            const isToday = dStr === iso(new Date());
            const isSelected = dStr === selectedDate;

            const dayAgendas = agendas.filter((a) => onDate(a, dStr));

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`min-h-[58px] sm:min-h-[80px] p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30 font-bold'
                    : isToday
                    ? 'border-emerald-300 bg-emerald-50/30 text-emerald-950 font-bold'
                    : isCurrentMonth
                    ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    : 'border-slate-100 bg-slate-50/50 text-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm ${isToday ? 'text-emerald-700 font-extrabold' : ''}`}>
                    {cellDate.getDate()}
                  </span>
                  {dayAgendas.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400 sm:hidden">
                      {dayAgendas.length}
                    </span>
                  )}
                </div>

                {/* Dots indicator */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayAgendas.slice(0, 4).map((a, idx) => {
                    const dotColor = CATEGORY_COLORS[a.kat]?.dot || '#64748b';
                    return (
                      <span
                        key={idx}
                        style={{ backgroundColor: dotColor }}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                        title={a.judul}
                      />
                    );
                  })}
                  {dayAgendas.length > 4 && (
                    <span className="text-[9px] font-bold text-slate-400">
                      +{dayAgendas.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Agendas Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              Agenda pada {fmt(selectedDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h4>
            {selectedDate === iso(new Date()) && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Hari Ini
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {selectedAgendas.length} agenda
          </span>
        </div>

        {selectedAgendas.length > 0 ? (
          <div className="space-y-3">
            {selectedAgendas.map((a) => (
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
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              Tidak ada agenda pada tanggal ini.
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-xs"
            >
              + Tambah Agenda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
