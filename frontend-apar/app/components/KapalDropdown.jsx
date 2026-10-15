'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ship,
  Layers,
  Search,
  Check,
  RefreshCw,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { getAllKapal } from '@/services/kapalService';
import { setActiveShip } from '@/services/api';
import { showFeedback } from '@/utils/feedback';

export default function KapalDropdown({
  isOpen,
  onClose,
  activeShip = { id: 'all', nama: 'Semua Kapal' }
}) {
  const [kapalList, setKapalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [assignedShip, setAssignedShip] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const syncUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = String(parsed.role || '').toLowerCase();
        setUserRole(role);
        if (parsed.id_kapal) {
          setAssignedShip({
            id: String(parsed.id_kapal),
            nama: parsed.nama_kapal || `Kapal #${parsed.id_kapal}`,
            kode: parsed.kode_kapal || ''
          });
        } else {
          setAssignedShip(null);
        }
      } catch {
        setUserRole('user');
      }
    }
  };

  const fetchKapal = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const list = await getAllKapal();
      setKapalList(list || []);
    } catch (err) {
      console.error('Gagal mengambil daftar kapal:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      syncUser();
      fetchKapal();
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuperadmin = userRole === 'superadmin';

  const filteredKapalList = kapalList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nama = String(k.nama_kapal || '').toLowerCase();
    const kode = String(k.kode_kapal || '').toLowerCase();
    return nama.includes(query) || kode.includes(query);
  });

  const handleSelectShip = (shipId, shipName) => {
    if (!isSuperadmin) {
      onClose();
      return;
    }

    if (shipId === 'all') {
      setActiveShip('all', 'Semua Kapal');
      showFeedback({
        title: 'Beralih ke Semua Kapal',
        message: 'Kini menampilkan data seluruh armada kapal',
        type: 'success'
      });
    } else {
      setActiveShip(shipId, shipName);
      showFeedback({
        title: 'Pindah Kapal Berhasil',
        message: `Kini Anda beralih ke inspeksi kapal: ${shipName}`,
        type: 'success'
      });
    }

    onClose();
  };

  const handleGoToMaster = () => {
    onClose();
    router.push('/dashboard/master-kapal');
  };

  return (
    <>
      {/* Mobile backdrop for easy dismissal on phones */}
      <div
        className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] sm:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dropdownRef}
        className="fixed left-3 right-3 top-[68px] z-40 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-88 rounded-2xl border border-[#eadfdb] bg-white p-3.5 sm:p-4 shadow-[0_16px_45px_rgba(80,60,55,0.18)] dark:border-white/10 dark:bg-[#1a1d27] font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Dropdown */}
        <div className="flex items-center justify-between border-b border-[#f2eae7] pb-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]">
              <Ship size={15} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1f1b1a] dark:text-[#f8fafc] leading-tight">
                Pilih Kapal Inspeksi
              </h4>
              <p className="text-[10px] text-[#8c7c78] dark:text-[#94a3b8] leading-tight">
                Ganti kapal untuk menyaring data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fetchKapal(true)}
              disabled={refreshing}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-[#8c7c78] transition hover:bg-[#fee9e6] hover:text-[#e95345] dark:text-[#94a3b8] dark:hover:bg-white/10 dark:hover:text-[#ff7a6d] ${
                refreshing ? 'animate-spin text-[#e95345]' : ''
              }`}
              title="Segarkan daftar kapal"
              aria-label="Segarkan daftar kapal"
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8c7c78] transition hover:bg-[#fee9e6] hover:text-[#e95345] dark:text-[#94a3b8] dark:hover:bg-white/10 dark:hover:text-[#ff7a6d] sm:hidden"
              aria-label="Tutup"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Superadmin: Ship Selection List */}
        {isSuperadmin ? (
          <div className="mt-3 space-y-2">
            {/* Search Input (Shown if list has more than 2 items) */}
            {kapalList.length > 2 && (
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7c78] dark:text-[#94a3b8]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kapal atau kode..."
                  className="h-8 w-full rounded-xl border border-[#eadfdb] bg-[#faf8f7] pl-8.5 pr-7 text-xs text-[#1f1b1a] outline-none transition placeholder:text-[#b8aaa5] focus:border-[#e95345] focus:bg-white dark:border-white/10 dark:bg-[#161822] dark:text-[#f8fafc] dark:focus:border-[#e95345]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c7c78] hover:text-[#e95345] dark:text-[#94a3b8]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Ships Container */}
            <div className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1 pr-0.5">
              {/* Option 1: Semua Kapal */}
              <button
                type="button"
                onClick={() => handleSelectShip('all', 'Semua Kapal')}
                className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  activeShip.id === 'all'
                    ? 'bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]'
                    : 'text-[#1f1b1a] hover:bg-[#faf8f7] dark:text-[#f8fafc] dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      activeShip.id === 'all'
                        ? 'bg-[#e95345] text-white shadow-sm'
                        : 'bg-gray-100 text-[#6f625f] dark:bg-white/10 dark:text-[#94a3b8]'
                    }`}
                  >
                    <Layers size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-bold leading-snug">
                      Semua Kapal (Semua Data)
                    </p>
                    <p className="text-[10px] opacity-75 truncate leading-tight">
                      Mencakup seluruh armada kapal
                    </p>
                  </div>
                </div>

                {activeShip.id === 'all' && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e95345] text-white dark:bg-[#ff7a6d] dark:text-[#1a1d27]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>

              <div className="border-t border-[#f2eae7] dark:border-white/10 my-1" />

              {/* Option 2..N: Individual Ships */}
              {filteredKapalList.map((k) => {
                const isSelected = String(activeShip.id) === String(k.id_kapal);
                return (
                  <button
                    key={k.id_kapal}
                    type="button"
                    onClick={() => handleSelectShip(String(k.id_kapal), k.nama_kapal)}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                      isSelected
                        ? 'bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]'
                        : 'text-[#1f1b1a] hover:bg-[#faf8f7] dark:text-[#f8fafc] dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-[#e95345] text-white shadow-sm'
                            : 'bg-gray-100 text-[#6f625f] dark:bg-white/10 dark:text-[#94a3b8]'
                        }`}
                      >
                        <Ship size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="truncate text-xs sm:text-sm font-bold leading-snug">
                            {k.nama_kapal}
                          </p>
                          {k.kode_kapal && (
                            <span className="rounded bg-black/5 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#6f625f] dark:bg-white/10 dark:text-[#94a3b8]">
                              {k.kode_kapal}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-75 truncate leading-tight">
                          {k.status === 'aktif' ? 'Status: Operasional' : 'Status: Nonaktif'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e95345] text-white dark:bg-[#ff7a6d] dark:text-[#1a1d27]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredKapalList.length === 0 && !loading && (
                <div className="py-4 text-center text-xs text-[#8c7c78] dark:text-[#94a3b8]">
                  Tidak ada kapal ditemukan
                </div>
              )}
            </div>

            {/* Footer / Manage Kapal Link */}
            <div className="border-t border-[#f2eae7] pt-2.5 mt-2 flex items-center justify-between text-[11px] dark:border-white/10">
              <span className="text-[#8c7c78] dark:text-[#94a3b8]">
                Total: <strong className="text-[#1f1b1a] dark:text-[#f8fafc]">{kapalList.length}</strong> kapal
              </span>
              <button
                type="button"
                onClick={handleGoToMaster}
                className="flex items-center gap-1 font-bold text-[#e95345] transition hover:underline dark:text-[#ff7a6d]"
              >
                Kelola Kapal
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ) : (
          /* Non-superadmin: Locked notice */
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-500/20 dark:bg-amber-950/30">
            <div className="flex items-start gap-2.5">
              <Lock size={15} className="mt-0.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <p className="font-bold">Akses Ditetapkan</p>
                <p className="mt-0.5 text-[11px]">
                  Akun Anda ditugaskan khusus untuk{' '}
                  <strong>{assignedShip ? assignedShip.nama : 'Kapal Tertentu'}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
