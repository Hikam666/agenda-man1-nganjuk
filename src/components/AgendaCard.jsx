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
  Calendar,
  Share2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getRoleName, getRoleDisplayName, CATEGORY_COLORS } from '../lib/constants';
import { fmt, conflicts, getEndDate, computeDynamicStatus, generateAgendaWaText } from '../lib/utils';

export default function AgendaCard({
  agenda,
  allAgendas = [],
  activeRole,
  roleProfiles = {},
  onEdit,
  onDelete
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(null);

  const isMine = activeRole && agenda.owner === activeRole;
  const isCancelled = agenda.status === 'Dibatalkan';
  
  // Calculate dynamic live status based on time!
  const liveStatus = computeDynamicStatus(agenda);
  const isOngoing = liveStatus === 'Sedang Berlangsung';
  const isDone = liveStatus === 'Sudah Terlaksana';

  const formatExternalUrl = (url) => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (!trimmed) return '#';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const conflictList = conflicts(agenda, allAgendas);
  const categoryStyle = CATEGORY_COLORS[agenda.kat] || CATEGORY_COLORS['Lainnya'];
  const endDate = getEndDate(agenda);
  const isMultiDay = endDate && endDate > agenda.tgl;

  const profile = roleProfiles[agenda.owner];
  const roleName = getRoleName(agenda.owner);
  const pejabatName = profile?.pejabat_name?.trim();
  const nip = profile?.nip?.trim();

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

  const handleShareWa = () => {
    const text = generateAgendaWaText(agenda, roleProfiles);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      className={`agenda-card bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs relative overflow-hidden ${
        isCancelled
          ? 'opacity-60 border-slate-200 border-l-4 border-l-slate-400'
          : isOngoing
          ? 'border-emerald-500 border-l-4 border-l-emerald-600 ring-1 ring-emerald-500/20'
          : isDone
          ? 'opacity-90 border-slate-200 border-l-4 border-l-slate-500'
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
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isOngoing
                ? 'bg-emerald-100 text-emerald-900 animate-pulse ring-1 ring-emerald-400 font-extrabold'
                : isDone
                ? 'bg-slate-100 text-slate-700 font-semibold'
                : isCancelled
                ? 'bg-rose-100 text-rose-800 line-through'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {liveStatus}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-base sm:text-lg text-slate-900 leading-snug mb-2.5 ${isCancelled ? 'line-through' : ''}`}>
        {agenda.judul}
      </h3>

      {/* Details (Location, Owner with Pejabat Name, Participants, Notes, Attachment) */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-800">{agenda.lokasi || '—'}</span>
        </div>

        <div className="flex items-start gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span>Penanggung Jawab: </span>
            {pejabatName ? (
              <>
                <strong className="text-slate-900 font-bold">{pejabatName}</strong>
                <span className="text-slate-500 font-medium ml-1">({roleName})</span>
                {nip && <span className="block text-[11px] text-slate-400 font-mono">NIP. {nip}</span>}
              </>
            ) : (
              <strong className="text-slate-800 font-semibold">{roleName}</strong>
            )}
          </div>
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

        {/* Attachment Link if any */}
        {agenda.tautan && (
          <div className="pt-1">
            <a
              href={formatExternalUrl(agenda.tautan)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              <span>Buka Tautan Surat / Berkas Lampiran</span>
            </a>
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
              Bentrok dengan: {conflictList.map(c => `“${c.judul}” (${c.mulai}, ${getRoleDisplayName(c.owner, roleProfiles)})`).join('; ')}
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

      {/* Action Buttons: WhatsApp Share, Edit & Delete */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 no-print">
        {/* WhatsApp Share Button */}
        <button
          onClick={handleShareWa}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
          title="Bagikan ke WhatsApp Group"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Bagikan ke WA</span>
        </button>

        <div className="flex items-center gap-1.5">
          {isMine && (
            <button
              onClick={() => onEdit(agenda)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-800 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah</span>
            </button>
          )}

          {(isMine || isCancelled) && (
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
          )}
        </div>
      </div>
    </div>
  );
}
