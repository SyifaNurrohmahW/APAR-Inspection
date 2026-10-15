'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Ship,
  MapPin,
  RefreshCw,
  X,
  CheckCircle2,
  Lock,
  Anchor,
  Layers,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import { getAllKapal } from '@/services/kapalService';
import { getActiveShip, setActiveShip } from '@/services/api';
import { showFeedback } from '@/utils/feedback';

export default function KapalSwitchModal({ isOpen, onClose }) {
  const [kapalList, setKapalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedShipId, setSelectedShipId] = useState('all');
  const [currentActive, setCurrentActive] = useState({ id: 'all', nama: 'Semua Kapal' });
  const [userRole, setUserRole] = useState('user');
  const [assignedShip, setAssignedShip] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const syncState = () => {
    const active = getActiveShip();
    setCurrentActive(active);
    setSelectedShipId(active.id || 'all');

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

  // Sync state & data when modal opens
  useEffect(() => {
    if (isOpen) {
      syncState();
      fetchKapal();
      setDropdownOpen(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Lock background scroll and listen to Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (dropdownOpen) {
          setDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, dropdownOpen, onClose]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!isOpen || !mounted) return null;

  const isSuperadmin = userRole === 'superadmin';

  const selectedShipData =
    selectedShipId === 'all'
      ? null
      : kapalList.find((k) => String(k.id_kapal) === String(selectedShipId));

  const filteredKapalList = kapalList.filter((k) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nama = String(k.nama_kapal || '').toLowerCase();
    const kode = String(k.kode_kapal || '').toLowerCase();
    return nama.includes(query) || kode.includes(query);
  });

  const handleApply = () => {
    if (!isSuperadmin) {
      if (assignedShip) {
        setActiveShip(assignedShip.id, assignedShip.nama);
      }
      onClose();
      return;
    }

    if (selectedShipId === 'all') {
      setActiveShip('all', 'Semua Kapal');
      showFeedback({
        title: 'Beralih ke Semua Kapal',
        message: 'Kini Anda melihat data seluruh armada kapal',
        type: 'success'
      });
    } else {
      const found = kapalList.find((k) => String(k.id_kapal) === String(selectedShipId));
      const shipName = found ? found.nama_kapal : `Kapal #${selectedShipId}`;
      setActiveShip(selectedShipId, shipName);
      showFeedback({
        title: 'Berhasil Pindah Kapal',
        message: `Kini Anda beralih ke inspeksi kapal: ${shipName}`,
        type: 'success'
      });
    }

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5 md:p-6 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative my-auto w-full max-w-lg rounded-2xl sm:rounded-3xl border border-[#eadfdb] bg-white p-5 sm:p-6 shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#1a1d27] max-h-[calc(100dvh-2.5rem)] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#f2eae7] pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]">
              <Ship size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1f1b1a] dark:text-[#f8fafc] leading-snug">
                Pindah Kapal Inspeksi
              </h3>
              <p className="text-xs text-[#8c7c78] dark:text-[#94a3b8]">
                Saring data operasional APAR berdasarkan kapal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchKapal(true)}
              disabled={refreshing}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-[#8c7c78] transition hover:bg-[#fee9e6] hover:text-[#e95345] dark:text-[#94a3b8] dark:hover:bg-white/10 dark:hover:text-[#ff7a6d] ${
                refreshing ? 'animate-spin text-[#e95345]' : ''
              }`}
              title="Segarkan daftar kapal"
              aria-label="Segarkan daftar kapal"
            >
              <RefreshCw size={17} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8c7c78] transition hover:bg-[#fee9e6] hover:text-[#e95345] dark:text-[#94a3b8] dark:hover:bg-white/10 dark:hover:text-[#ff7a6d]"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-0.5">
          {/* Card Kapal Aktif Saat Ini */}
          <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 sm:p-4 transition dark:border-emerald-500/20 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm dark:bg-emerald-600">
                <MapPin size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  KAPAL AKTIF SAAT INI
                </span>
                <p className="truncate text-sm sm:text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                  {currentActive.nama}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Aktif
              </span>
            </div>
          </div>

          {/* Form Selector Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#6f625f] dark:text-[#94a3b8]">
              <Anchor size={14} className="text-[#e95345]" />
              PILIH KAPAL INSPEKSI
            </label>

            {isSuperadmin ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger Button: Styled with exact system font & responsive sizes */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  disabled={loading}
                  className="flex w-full items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-[#eadfdb] bg-white px-3.5 py-3 text-left shadow-sm outline-none transition hover:border-[#e95345] focus:border-[#e95345] focus:ring-2 focus:ring-[#e95345]/15 disabled:bg-gray-50 dark:border-white/15 dark:bg-[#161822] dark:hover:border-[#e95345]/60"
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]">
                      {selectedShipId === 'all' ? (
                        <Layers size={17} />
                      ) : (
                        <Ship size={17} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1f1b1a] dark:text-[#f8fafc]">
                        {selectedShipId === 'all'
                          ? 'Semua Kapal (Semua Data)'
                          : selectedShipData
                          ? selectedShipData.nama_kapal
                          : `Kapal #${selectedShipId}`}
                      </p>
                      <p className="text-[11px] text-[#8c7c78] dark:text-[#94a3b8] truncate">
                        {selectedShipId === 'all'
                          ? 'Mencakup seluruh armada kapal'
                          : selectedShipData?.kode_kapal
                          ? `Kode: ${selectedShipData.kode_kapal}`
                          : 'Kapal Terpilih'}
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-[#8c7c78] transition-transform duration-200 dark:text-[#94a3b8] ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-[#eadfdb] bg-white p-2 shadow-2xl transition-all dark:border-white/10 dark:bg-[#1a1d27] animate-in fade-in zoom-in-95 duration-150">
                    {/* Search box if there are multiple ships */}
                    {kapalList.length > 3 && (
                      <div className="relative mb-2 px-1">
                        <Search
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7c78] dark:text-[#94a3b8]"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari nama atau kode kapal..."
                          className="h-9 w-full rounded-xl border border-[#eadfdb] bg-[#faf8f7] pl-9 pr-3 text-xs text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:bg-white dark:border-white/10 dark:bg-[#161822] dark:text-[#f8fafc] dark:focus:border-[#e95345]"
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                      {/* Option: Semua Kapal */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedShipId('all');
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                          selectedShipId === 'all'
                            ? 'bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]'
                            : 'text-[#1f1b1a] hover:bg-[#faf8f7] dark:text-[#f8fafc] dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              selectedShipId === 'all'
                                ? 'bg-[#e95345] text-white'
                                : 'bg-gray-100 text-[#6f625f] dark:bg-white/10 dark:text-[#94a3b8]'
                            }`}
                          >
                            <Layers size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              Semua Kapal (Semua Data)
                            </p>
                            <p className="text-[11px] opacity-75">
                              Tampilkan seluruh data tanpa batasan kapal
                            </p>
                          </div>
                        </div>

                        {selectedShipId === 'all' && (
                          <Check size={16} className="shrink-0 text-[#e95345] dark:text-[#ff7a6d]" />
                        )}
                      </button>

                      <div className="my-1 border-t border-[#f2eae7] dark:border-white/10" />

                      {/* Options: List of ships */}
                      {filteredKapalList.map((k) => {
                        const isSelected = String(selectedShipId) === String(k.id_kapal);
                        return (
                          <button
                            key={k.id_kapal}
                            type="button"
                            onClick={() => {
                              setSelectedShipId(String(k.id_kapal));
                              setDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              isSelected
                                ? 'bg-[#fee9e6] text-[#e95345] dark:bg-[#e95345]/15 dark:text-[#ff7a6d]'
                                : 'text-[#1f1b1a] hover:bg-[#faf8f7] dark:text-[#f8fafc] dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                  isSelected
                                    ? 'bg-[#e95345] text-white'
                                    : 'bg-gray-100 text-[#6f625f] dark:bg-white/10 dark:text-[#94a3b8]'
                                }`}
                              >
                                <Ship size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {k.nama_kapal}
                                </p>
                                <p className="text-[11px] opacity-75">
                                  {k.kode_kapal ? `Kode: ${k.kode_kapal}` : 'Kapal Aktif'}
                                  {k.status && (
                                    <span className="ml-1.5 uppercase font-medium">
                                      • {k.status}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <Check
                                size={16}
                                className="shrink-0 text-[#e95345] dark:text-[#ff7a6d]"
                              />
                            )}
                          </button>
                        );
                      })}

                      {filteredKapalList.length === 0 && (
                        <div className="py-4 text-center text-xs text-[#8c7c78] dark:text-[#94a3b8]">
                          Tidak ada kapal yang cocok dengan pencarian
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 dark:border-amber-500/20 dark:bg-amber-950/30">
                <div className="flex items-start gap-2.5">
                  <Lock
                    size={16}
                    className="mt-0.5 text-amber-700 dark:text-amber-400 shrink-0"
                  />
                  <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <p className="font-bold">Akses Ditetapkan:</p>
                    <p className="mt-0.5">
                      Akun Anda ditugaskan khusus untuk{' '}
                      <strong>{assignedShip ? assignedShip.nama : 'Kapal Tertentu'}</strong>.
                      Anda hanya dapat melihat dan mengelola data kapal tersebut.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 border-t border-[#f2eae7] pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 sm:h-10 w-full sm:w-auto items-center justify-center rounded-xl border border-[#eadfdb] bg-white px-5 text-xs sm:text-sm font-bold text-[#6f625f] transition hover:bg-[#fee9e6] hover:text-[#e95345] dark:border-white/10 dark:bg-white/5 dark:text-[#94a3b8] dark:hover:bg-white/10 dark:hover:text-white"
          >
            Tutup
          </button>

          {isSuperadmin && (
            <button
              type="button"
              onClick={handleApply}
              className="flex h-11 sm:h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#e95345] px-6 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#d9473a] hover:shadow-lg active:scale-95"
            >
              <CheckCircle2 size={16} />
              Terapkan & Pindah
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
