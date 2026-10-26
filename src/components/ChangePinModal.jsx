import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { getRoleName } from '../lib/constants';
import { verifyRolePin, updateRolePin } from '../lib/supabase';

export default function ChangePinModal({
  isOpen,
  onClose,
  activeRole
}) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeRole) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPin.length < 4) {
      setError('PIN baru minimal harus 4 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify old PIN
      const isOldValid = await verifyRolePin(activeRole, oldPin);
      if (!isOldValid) {
        setError('PIN lama salah.');
        setLoading(false);
        return;
      }

      // 2. Update to new PIN
      await updateRolePin(activeRole, newPin);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui PIN. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ubah PIN Jabatan</h3>
              <p className="text-[11px] text-slate-500">{getRoleName(activeRole)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <p className="font-bold text-slate-800 text-sm">PIN Berhasil Diperbarui!</p>
              <p className="text-xs text-slate-500">Gunakan PIN baru ini saat masuk berikutnya.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Lama:
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-bold py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Baru (4–6 digit):
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-bold py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi PIN Baru:
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-bold py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs"
                >
                  {loading ? 'Menyimpan...' : 'Simpan PIN'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
