import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Trash2,
  Calendar
} from 'lucide-react';
import { getRoleName, CATEGORY_COLORS } from '../lib/constants';
import { fmt, conflicts, getEndDate } from '../lib/utils';

export default function AgendaCard({
  agenda,
  allAgendas = [],
  activeRole,
  onEdit,
  onDelete
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(null);

  const isMine = activeRole && agenda.owner === activeRole;
  const isCancelled = agenda.status === 'Dibatalkan';
  const isDone = agenda.status === 'Selesai';
  const conflictList = conflicts(agenda, allAgendas);
  const categoryStyle = CATEGORY_COLORS[agenda.kat] || CATEGORY_COLORS['Lainnya'];
  const endDate = getEndDate(agenda);
  const isMultiDay = endDate && endDate > agenda.tgl;

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      const timer = setTimeout(() => {
        setConfirmDelete(false);
      }, 4000);
      setDeleteTimer(timer);
    } else {
      if (deleteTimer) clearTimeout(deleteTimer);
      setConfirmDelete(false);
      onDelete(agenda.id);
    }
  };

  return (
    <div
      className={`agenda-card bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs relative overflow-hidden ${
        isCancelled
          ? 'opacity-60 border-slate-200 border-l-4 border-l-slate-400'
          : isDone
          ? 'opacity-90 border-slate-200 border-l-4 border-l-emerald-600'
          : 'border-slate-200 hover:border-slate-300 border-l-4 border-l-emerald-700'
      }`}
    >
      {/* Top Meta: Time & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isMultiDay && `${fmt(agenda.tgl, { day: 'numeric', month: 'short' })} – ${fmt(endDate, { day: 'numeric', month: 'short' })} · `}
            {agenda.mulai} {agenda.selesai ? `– ${agenda.selesai}` : ''} WIB
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs"
            style={{
              borderColor: categoryStyle.dot + '40',
              backgroundColor: categoryStyle.dot + '15',
              color: categoryStyle.dot
            }}
          >
            {agenda.kat}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
              agenda.status === 'Selesai'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : agenda.status === 'Berlangsung'
                ? 'bg-amber-100 text-amber-800 font-semibold animate-pulse'
                : agenda.status === 'Dibatalkan'
                ? 'bg-rose-100 text-rose-800 line-through'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {agenda.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-base sm:text-lg text-slate-900 leading-snug mb-2.5 ${isCancelled ? 'line-through' : ''}`}>
        {agenda.judul}
      </h3>

      {/* Details (Location, Owner, Participants, Notes) */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-800">{agenda.lokasi || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Penanggung Jawab: <strong className="text-slate-800 font-semibold">{getRoleName(agenda.owner)}</strong></span>
        </div>
        {agenda.peserta && (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Peserta: {agenda.peserta}</span>
          </div>
        )}
        {agenda.ket && (
          <div className="flex items-start gap-2 pt-0.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="italic text-slate-500">{agenda.ket}</span>
          </div>
        )}
      </div>

      {/* Conflict Alert Banner */}
      {conflictList.length > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Perhatian Jadwal Bentrok:</strong>
            <p className="mt-0.5 text-amber-800">
              Bentrok dengan: {conflictList.map(c => `“${c.judul}” (${c.mulai}, ${getRoleName(c.owner)})`).join('; ')}
            </p>
          </div>
        </div>
      )}

      {/* Notula / Hasil Kegiatan */}
      {agenda.hasil && (
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 mb-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Notula / Catatan Hasil Kegiatan:</span>
          </div>
          <p className="whitespace-pre-line text-emerald-900/90 pl-5">{agenda.hasil}</p>
        </div>
      )}

      {/* Action Buttons (Edit & Delete) */}
      {(isMine || isCancelled) && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 no-print">
          {isMine && (
            <button
              onClick={() => onEdit(agenda)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-800 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah</span>
            </button>
          )}

          <button
            onClick={handleDeleteClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              confirmDelete
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'border-slate-200 bg-white text-rose-600 hover:bg-rose-50 shadow-2xs'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {confirmDelete
                ? 'Yakin hapus? Ketuk lagi'
                : isCancelled
                ? 'Hapus agenda batal'
                : 'Hapus'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
