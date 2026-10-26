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
import { downloadCsv, fmt, iso } from './lib/utils';
import { getRoleDisplayName, getRoleName } from './lib/constants';

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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadCsv = () => {
    const success = downloadCsv(agendas, roleProfiles);
    if (success) {
      showToast('Berkas CSV berhasil diunduh. Siap dibuka di Excel / Google Sheets.');
    } else {
      showToast('Belum ada agenda untuk diunduh.', 'info');
    }
  };

  // Handler Save Role Profiles
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
        onPrint={handlePrint}
        onDownloadCsv={handleDownloadCsv}
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
          onPrint={handlePrint}
          onDownloadCsv={handleDownloadCsv}
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

        {/* Official Print Header (Only visible when printing) */}
        <div className="print-header text-center">
          <h2 className="text-sm font-bold tracking-wider uppercase">
            Kementerian Agama Republik Indonesia
          </h2>
          <h1 className="text-lg font-extrabold uppercase">
            Madrasah Aliyah Negeri 1 Nganjuk
          </h1>
          <p className="text-xs text-slate-600">
            Jalan Imam Bonjol No. 13 Nganjuk · Telp. (0358) 321683
          </p>
          <div className="mt-2 pt-2 border-t-2 border-black flex justify-between text-xs font-semibold">
            <span>DOKUMEN AGENDA KEGIATAN HARIAN MADRASAH</span>
            <span>Dicetak: {fmt(iso(), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* View Component Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12">
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
      />
    </div>
  );
}
