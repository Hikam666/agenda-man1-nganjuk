import React, { useState } from 'react';
import { X, Lock, ShieldCheck, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { JAB, ROLES, getRoleName } from '../lib/constants';
import { verifyRolePin } from '../lib/supabase';

export default function RolePinModal({
  isOpen,
  onClose,
  activeRole,
  onSuccessRole
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setPin('');
    setError('');
  };

  const handleBackToSelect = () => {
    setSelectedRole(null);
    setPin('');
    setError('');
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Masukkan 4 digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isValid = await verifyRolePin(selectedRole, pin);
      if (isValid) {
        onSuccessRole(selectedRole);
        onClose();
        setSelectedRole(null);
        setPin('');
      } else {
        setError('PIN salah. Silakan coba lagi atau gunakan default 1234.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kendala saat verifikasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {selectedRole ? 'Verifikasi PIN Jabatan' : 'Pilih Jabatan Anda'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedRole ? 'Keamanan Otorisasi Agenda' : 'Akses pembuatan & pengelolaan agenda'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {!selectedRole ? (
            /* Step 1: List of roles */
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Pilih profil jabatan Anda di MAN 1 Nganjuk. Setiap jabatan diproteksi PIN untuk menjaga keamanan agenda.
              </p>
              {JAB.map(([deptKey, deptName]) => {
                const deptRoles = ROLES.filter(r => r.j === deptKey);
                return (
                  <div key={deptKey} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      {deptName}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {deptRoles.map(role => {
                        const isCurrent = activeRole === role.key;
                        return (
                          <button
                            key={role.key}
                            onClick={() => handleSelectRole(role.key)}
                            className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                              isCurrent
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-800">{role.n}</span>
                              {role.isPrimary && (
                                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                  Utama
                                </span>
                              )}
                            </div>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Step 2: PIN Input */
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Jabatan yang dipilih:</span>
                  <span className="font-bold text-sm text-slate-900">{getRoleName(selectedRole)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleBackToSelect}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Ganti</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Masukkan PIN 4 Digit:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {error ? (
                  <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    💡 PIN bawaan pertama kali adalah <span className="font-bold text-slate-700">1234</span>. Anda dapat mengubahnya sewaktu-waktu.
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleBackToSelect}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  {loading ? 'Memeriksa...' : 'Masuk Jabatan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
