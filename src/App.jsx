import React, { useState, useEffect } from 'react';
import { 
  getAgendas, 
  createAgenda, 
  updateAgenda, 
  deleteAgenda, 
  getRoleProfiles,
  saveRoleProfile,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  supabase 
} from './lib/supabase';
import { 
  downloadCsv, 
  fmt, 
  iso, 
  onDate, 
  computeDynamicStatus, 
  getEndDate,
  generateDailyRecapWaText 
} from './lib/utils';
import { 
  getRoleDisplayName, 
  DEFAULT_PRINT_CONFIG 
} from './lib/constants';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import TodayView from './components/TodayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import AgendaFormModal from './components/AgendaFormModal';
import RolePinModal from './components/RolePinModal';
import ChangePinModal from './components/ChangePinModal';
import SettingsModal from './components/SettingsModal';
import PrintModal from './components/PrintModal';
import ExportModal from './components/ExportModal';
import KioskModal from './components/KioskModal';

export default function App() {
  const [agendas, setAgendas] = useState([]);
  const [roleProfiles, setRoleProfiles] = useState({});
  const [templates, setTemplates] = useState([]);
  const [activeView, setActiveView] = useState('d');
  const [activeRole, setActiveRole] = useState(() => {
    try {
      return localStorage.getItem('who') || null;
    } catch (e) {
      return null;
    }
  });

  const [printConfig, setPrintConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('print_config');
      return stored ? { ...DEFAULT_PRINT_CONFIG, ...JSON.parse(stored) } : DEFAULT_PRINT_CONFIG;
    } catch (e) {
      return DEFAULT_PRINT_CONFIG;
    }
  });

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch initial data (agendas, profiles, templates)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [agendaData, profileData, templateData] = await Promise.all([
          getAgendas(),
          getRoleProfiles(),
          getTemplates()
        ]);

        if (isMounted) {
          setAgendas(agendaData);
          setRoleProfiles(profileData);
          setTemplates(templateData);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        showToast('Koneksi database aktif dengan mode offline fallback.', 'info');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // Subscribe to Realtime Postgres Changes for Agendas
    const agendaChannel = supabase
      .channel('realtime-agenda-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgendas((prev) => {
              if (prev.some((a) => a.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setAgendas((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAgendas((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to Realtime Changes for Role Profiles
    const profilesChannel = supabase
      .channel('realtime-profiles-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'role_profiles' },
        (payload) => {
          if (payload.new && payload.new.role_key) {
            setRoleProfiles((prev) => ({
              ...prev,
              [payload.new.role_key]: payload.new
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to Realtime Changes for Templates
    const templatesChannel = supabase
      .channel('realtime-templates-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda_templates' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTemplates((prev) => [payload.new, ...prev.filter(t => t.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setTemplates((prev) => prev.map(t => t.id === payload.new.id ? payload.new : t));
          } else if (payload.eventType === 'DELETE') {
            setTemplates((prev) => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(agendaChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(templatesChannel);
    };
  }, []);

  const handleOpenAdd = () => {
    if (!activeRole) {
      showToast('Silakan pilih profil jabatan Anda dan masukkan PIN terlebih dahulu.', 'info');
      setIsRoleModalOpen(true);
      return;
    }
    setEditingAgenda(null);
    setIsFormOpen(true);
  };

  const handleEditAgenda = (agenda) => {
    if (!activeRole || agenda.owner !== activeRole) {
      showToast('Anda hanya dapat mengubah agenda milik jabatan aktif Anda.', 'error');
      return;
    }
    setEditingAgenda(agenda);
    setIsFormOpen(true);
  };

  const handleSaveAgenda = async (formData, editId) => {
    if (editId) {
      const updated = await updateAgenda(editId, formData);
      setAgendas((prev) => prev.map((a) => (a.id === editId ? updated : a)));
      showToast(`Agenda “${formData.judul}” berhasil diperbarui.`);
    } else {
      const created = await createAgenda(formData);
      setAgendas((prev) => [...prev, created]);
      showToast(`Agenda baru “${formData.judul}” berhasil disimpan.`);
    }
  };

  const handleDeleteAgenda = async (id) => {
    const agendaToDelete = agendas.find((a) => a.id === id);
    try {
      await deleteAgenda(id);
      setAgendas((prev) => prev.filter((a) => a.id !== id));
      showToast(`Agenda “${agendaToDelete?.judul || ''}” telah dihapus.`);
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus agenda dari database.', 'error');
    }
  };

  const handleRoleSuccess = (roleKey) => {
    setActiveRole(roleKey);
    try {
      localStorage.setItem('who', roleKey);
    } catch (e) {}
    showToast(`Berhasil masuk sebagai ${getRoleDisplayName(roleKey, roleProfiles)}.`);
  };

  const handleLogout = () => {
    setActiveRole(null);
    try {
      localStorage.removeItem('who');
    } catch (e) {}
    showToast('Anda telah keluar dari jabatan.');
  };

  // WhatsApp Daily Recap Share
  const handleShareDailyRecapWa = () => {
    const todayStr = iso(new Date());
    const todayAgendas = agendas
      .filter((a) => onDate(a, todayStr))
      .sort((a, b) => a.mulai.localeCompare(b.mulai));

    const text = generateDailyRecapWaText(todayAgendas, todayStr, roleProfiles);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Save Print Config
  const handleSavePrintConfig = (newConfig) => {
    setPrintConfig(newConfig);
    try {
      localStorage.setItem('print_config', JSON.stringify(newConfig));
    } catch (e) {}
    showToast('Pengaturan template cetak berhasil diperbarui.');
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  // Handlers for Role Profiles
  const handleSaveRoleProfiles = async (newProfilesMap) => {
    setRoleProfiles(newProfilesMap);
    for (const [key, val] of Object.entries(newProfilesMap)) {
      await saveRoleProfile(key, val);
    }
    showToast('Data nama pejabat madrasah berhasil diperbarui.');
  };

  // Handlers for Templates
  const handleCreateTemplate = async (templateData) => {
    const created = await createTemplate(templateData);
    setTemplates((prev) => [created, ...prev.filter(t => t.id !== created.id)]);
    showToast(`Template “${created.nama}” berhasil ditambahkan.`);
  };

  const handleUpdateTemplate = async (id, templateData) => {
    const updated = await updateTemplate(id, templateData);
    setTemplates((prev) => prev.map(t => t.id === id ? updated : t));
    showToast(`Template “${updated.nama}” berhasil diperbarui.`);
  };

  const handleDeleteTemplate = async (id) => {
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter(t => t.id !== id));
    showToast('Template agenda berhasil dihapus.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAdd={handleOpenAdd}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenKioskModal={() => setIsKioskModalOpen(true)}
        onShareDailyRecapWa={handleShareDailyRecapWa}
        activeRole={activeRole}
        roleProfiles={roleProfiles}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenChangePin={() => setIsChangePinOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          activeRole={activeRole}
          roleProfiles={roleProfiles}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenAdd={handleOpenAdd}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenKioskModal={() => setIsKioskModalOpen(true)}
          onShareDailyRecapWa={handleShareDailyRecapWa}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-200">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-md ${
                toast.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : toast.type === 'info'
                  ? 'bg-blue-50 border-blue-300 text-blue-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <span>{toast.text}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL PRINT VIEW (HANYA MUNCUL KETIKA DI-PRINT / SAVE AS PDF) */}
        {/* ========================================================================= */}
        <div className="print-header">
          {/* KOP RESMI MADRASAH */}
          <div className="text-center border-b-2 border-black pb-3 mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-black">
              {printConfig.kopHeader1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA'}
            </h3>
            <h4 className="text-xs font-bold uppercase text-black">
              {printConfig.kopHeader2 || 'KANTOR KEMENTERIAN AGAMA KABUPATEN NGANJUK'}
            </h4>
            <h1 className="text-base font-extrabold uppercase text-black tracking-wide my-0.5">
              {printConfig.kopMadrasah || 'MADRASAH ALIYAH NEGERI 1 NGANJUK'}
            </h1>
            <p className="text-[10px] text-gray-700 font-medium">
              {printConfig.kopAlamat || 'Jalan Imam Bonjol No. 13 Nganjuk · Telp. (0358) 321683'}
            </p>
            <p className="text-[10px] text-gray-800 font-bold tracking-wide italic mt-0.5">
              MAN 1 Nganjuk Berdaya (Bermakna, Berbudaya, Mendunia)
            </p>
          </div>

          <div className="flex justify-between items-center text-xs font-bold uppercase mb-3">
            <span>
              {printConfig.templateType === 'notula' 
                ? 'BERITA ACARA & NOTULA AGENDA KEGIATAN'
                : printConfig.templateType === 'matriks'
                ? 'MATRIKS JADWAL MINGGUAN MADRASAH'
                : 'REKAPITULASI AGENDA KEGIATAN HARIAN'}
            </span>
            <span className="font-normal text-[11px] capitalize">
              Dicetak: {fmt(iso(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* PRINT TEMPLATE 1: REKAP EKSEKUTIF DINAS (TABEL LENGKAP) */}
          {(!printConfig.templateType || printConfig.templateType === 'rekap') && (
            <table className="w-full text-left border-collapse text-[10pt] mb-6">
              <thead>
                <tr className="bg-gray-100 border-y border-black text-center font-bold">
                  <th className="py-2 px-1.5 border border-black w-8">No</th>
                  <th className="py-2 px-2 border border-black">Nama Kegiatan</th>
                  <th className="py-2 px-2 border border-black w-24">Tanggal</th>
                  <th className="py-2 px-2 border border-black w-20">Waktu</th>
                  <th className="py-2 px-2 border border-black">Lokasi</th>
                  <th className="py-2 px-2 border border-black">Penanggung Jawab</th>
                  <th className="py-2 px-2 border border-black w-20">Status</th>
                  <th className="py-2 px-2 border border-black">Notula / Hasil</th>
                </tr>
              </thead>
              <tbody>
                {agendas.map((a, idx) => (
                  <tr key={a.id} className="border-b border-gray-400">
                    <td className="py-1.5 px-1.5 border border-black text-center align-top">{idx + 1}</td>
                    <td className="py-1.5 px-2 border border-black font-semibold align-top">{a.judul}</td>
                    <td className="py-1.5 px-2 border border-black text-center align-top whitespace-nowrap">{a.tgl}</td>
                    <td className="py-1.5 px-2 border border-black text-center align-top whitespace-nowrap">{a.mulai} {a.selesai ? `- ${a.selesai}` : ''}</td>
                    <td className="py-1.5 px-2 border border-black align-top">{a.lokasi || '—'}</td>
                    <td className="py-1.5 px-2 border border-black align-top">{getRoleDisplayName(a.owner, roleProfiles)}</td>
                    <td className="py-1.5 px-2 border border-black text-center align-top">{computeDynamicStatus(a)}</td>
                    <td className="py-1.5 px-2 border border-black align-top text-[9pt] italic">{a.hasil || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PRINT TEMPLATE 2: MATRIKS MADING GURU */}
          {printConfig.templateType === 'matriks' && (
            <div className="space-y-4 mb-6">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((hari) => (
                <div key={hari} className="border border-black p-2.5 break-inside-avoid">
                  <div className="font-bold text-xs uppercase bg-gray-100 p-1 border-b border-black mb-1.5">
                    HARI: {hari}
                  </div>
                  <div className="text-[10pt] space-y-1">
                    {agendas.filter(a => fmt(a.tgl, { weekday: 'long' }) === hari).length > 0 ? (
                      agendas.filter(a => fmt(a.tgl, { weekday: 'long' }) === hari).map((a, i) => (
                        <div key={a.id} className="border-b border-dashed border-gray-300 pb-1">
                          • <strong>{a.mulai} - {a.selesai || 'selesai'} WIB</strong>: {a.judul} (Lokasi: {a.lokasi || '—'}, PJ: {getRoleDisplayName(a.owner, roleProfiles)})
                        </div>
                      ))
                    ) : (
                      <span className="italic text-gray-500 text-xs">Tidak ada agenda khusus</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRINT TEMPLATE 3: NOTULA BERITA ACARA */}
          {printConfig.templateType === 'notula' && (
            <div className="space-y-4 mb-6">
              {agendas.filter(a => a.hasil).map((a, i) => (
                <div key={a.id} className="border border-black p-3 break-inside-avoid space-y-1.5 text-[10pt]">
                  <div className="font-bold text-xs uppercase border-b pb-1">
                    AGENDA {i + 1}: {a.judul}
                  </div>
                  <div><strong>Waktu & Tempat:</strong> {fmt(a.tgl)}, Pukul {a.mulai} WIB | Lokasi: {a.lokasi || '—'}</div>
                  <div><strong>Penanggung Jawab:</strong> {getRoleDisplayName(a.owner, roleProfiles)} | <strong>Peserta:</strong> {a.peserta || '—'}</div>
                  <div className="p-2 bg-gray-50 border border-gray-300 mt-1">
                    <strong>Hasil / Notula Keputusan:</strong>
                    <p className="whitespace-pre-line mt-0.5">{a.hasil}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEMBAR TANDA TANGAN DI BAGIAN BAWAH */}
          <div className="flex justify-end pt-4 break-inside-avoid">
            <div className="text-center w-64">
              <p className="text-xs">
                {printConfig.titimangsaKota || 'Nganjuk'}, {fmt(iso(), { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs font-semibold mt-0.5">
                {printConfig.jabatanPenandatangan || 'Kepala Madrasah'},
              </p>
              <div className="h-16" />
              <p className="text-xs font-bold underline">
                {printConfig.namaPenandatangan || 'Drs. H. Muh. Zuhal, M.Pd.I'}
              </p>
              <p className="text-[11px] font-mono text-gray-700">
                NIP. {printConfig.nipPenandatangan || '197205102000031002'}
              </p>
            </div>
          </div>
        </div>

        {/* Screen View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12 no-print">
          {isLoading && agendas.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-slate-700 text-sm">Menghubungkan ke Supabase...</p>
              <p className="text-xs text-slate-400 mt-1">Menyiapkan data agenda & master data</p>
            </div>
          ) : (
            <>
              {activeView === 'd' && (
                <DashboardView
                  agendas={agendas}
                  activeRole={activeRole}
                  roleProfiles={roleProfiles}
                  onNavigateView={(v) => setActiveView(v)}
                  onEditAgenda={handleEditAgenda}
                  onDeleteAgenda={handleDeleteAgenda}
                  onOpenAdd={handleOpenAdd}
                />
              )}
              {activeView === 'h' && (
                <TodayView
                  agendas={agendas}
                  activeRole={activeRole}
                  roleProfiles={roleProfiles}
                  onEditAgenda={handleEditAgenda}
                  onDeleteAgenda={handleDeleteAgenda}
                  onOpenAdd={handleOpenAdd}
                />
              )}
              {activeView === 'p' && (
                <WeekView
                  agendas={agendas}
                  activeRole={activeRole}
                  roleProfiles={roleProfiles}
                  onEditAgenda={handleEditAgenda}
                  onDeleteAgenda={handleDeleteAgenda}
                  onOpenAdd={handleOpenAdd}
                />
              )}
              {activeView === 'b' && (
                <MonthView
                  agendas={agendas}
                  activeRole={activeRole}
                  roleProfiles={roleProfiles}
                  onEditAgenda={handleEditAgenda}
                  onDeleteAgenda={handleDeleteAgenda}
                  onOpenAdd={handleOpenAdd}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AgendaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingAgenda}
        activeRole={activeRole}
        allAgendas={agendas}
        templates={templates}
        roleProfiles={roleProfiles}
        onSave={handleSaveAgenda}
      />

      <RolePinModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        activeRole={activeRole}
        onSuccessRole={handleRoleSuccess}
      />

      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        activeRole={activeRole}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roleProfiles={roleProfiles}
        onSaveRoleProfiles={handleSaveRoleProfiles}
        templates={templates}
        onCreateTemplate={handleCreateTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        printConfig={printConfig}
        onSavePrintConfig={handleSavePrintConfig}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        printConfig={printConfig}
        onUpdatePrintConfig={handleSavePrintConfig}
        onTriggerPrint={handleTriggerPrint}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        agendas={agendas}
        roleProfiles={roleProfiles}
        printConfig={printConfig}
        onShowToast={showToast}
      />

      <KioskModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        agendas={agendas}
        roleProfiles={roleProfiles}
      />
    </div>
  );
}
