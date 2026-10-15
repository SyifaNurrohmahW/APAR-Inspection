'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ship,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Anchor
} from 'lucide-react';
import StatCard from '@/components/dashboard-menu/statCard';
import KapalModal from '@/components/KapalModal';
import {
  getAllKapal,
  createKapal,
  updateKapal,
  deleteKapal
} from '@/services/kapalService';
import { showConfirm, showFeedback } from '@/utils/feedback';

export default function MasterKapalPage() {
  const router = useRouter();
  const [kapalList, setKapalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedKapal, setSelectedKapal] = useState(null);

  const fetchKapalList = async () => {
    try {
      setLoading(true);
      const data = await getAllKapal();
      setKapalList(Array.isArray(data) ? data : []);
    } catch (err) {
      showFeedback({
        title: 'Gagal Memuat Data',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (String(parsed.role || '').toLowerCase() !== 'superadmin') {
          showFeedback({
            title: 'Akses Ditolak',
            message: 'Menu Master Kapal hanya dapat diakses oleh Superadmin.',
            type: 'warning'
          });
          router.replace('/dashboard');
          return;
        }
      } catch {
        router.replace('/dashboard');
        return;
      }
    }

    fetchKapalList();
  }, [router]);

  const handleOpenCreate = () => {
    setSelectedKapal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedKapal(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);
      if (selectedKapal) {
        await updateKapal(selectedKapal.id_kapal, formData);
        showFeedback({
          title: 'Berhasil Memperbarui',
          message: `Data kapal "${formData.nama_kapal}" berhasil diperbarui.`,
          type: 'success'
        });
      } else {
        await createKapal(formData);
        showFeedback({
          title: 'Berhasil Menambahkan',
          message: `Kapal baru "${formData.nama_kapal}" berhasil didaftarkan.`,
          type: 'success'
        });
      }
      setIsModalOpen(false);
      setSelectedKapal(null);
      fetchKapalList();
      window.dispatchEvent(new CustomEvent('apar-ship-changed', { detail: {} }));
    } catch (err) {
      showFeedback({
        title: 'Gagal Menyimpan Data',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (item) => {
    const yakin = await showConfirm({
      title: 'Hapus Kapal?',
      message: `Apakah Anda yakin ingin menghapus data kapal "${item.nama_kapal}"? Data APAR dan lokasi terkait mungkin terpengaruh.`,
      confirmLabel: 'Hapus'
    });

    if (!yakin) return;

    try {
      await deleteKapal(item.id_kapal);
      showFeedback({
        title: 'Berhasil Dihapus',
        message: `Data kapal "${item.nama_kapal}" telah dihapus.`,
        type: 'success'
      });
      fetchKapalList();
      window.dispatchEvent(new CustomEvent('apar-ship-changed', { detail: {} }));
    } catch (err) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: err.message,
        type: 'error'
      });
    }
  };

  const filteredKapal = kapalList.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      (item.nama_kapal || '').toLowerCase().includes(query) ||
      (item.kode_kapal || '').toLowerCase().includes(query) ||
      (item.keterangan || '').toLowerCase().includes(query)
    );
  });

  const totalKapal = kapalList.length;
  const totalAktif = kapalList.filter((k) => String(k.status).toLowerCase() === 'aktif').length;
  const totalNonaktif = totalKapal - totalAktif;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Master Data Kapal</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola daftar armada kapal untuk penugasan petugas dan inspeksi APAR.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
        >
          <Plus size={18} />
          Tambah Kapal
        </button>
      </div>

      {/* Ringkasan Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          title="Total Kapal"
          value={totalKapal}
          description="Semua armada kapal terdaftar"
          icon={Ship}
        />
        <StatCard
          title="Kapal Aktif"
          value={totalAktif}
          description="Sedang beroperasi & diinspeksi"
          icon={CheckCircle2}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />
        <StatCard
          title="Dalam Perbaikan / Docking"
          value={totalNonaktif}
          description="Status nonaktif sementara"
          icon={AlertCircle}
          iconBg="bg-[#fff3eb]"
          iconColor="text-[#f97316]"
        />
      </div>

      {/* Tabel Card */}
      <div className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1f1b1a]">Daftar Armada Kapal</h3>
            <p className="mt-1 text-sm text-[#6f625f]">
              Data master kapal yang tersedia dalam ekosistem inspeksi APAR.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau kode kapal..."
              className="h-10 w-full rounded-xl border border-[#eadfdb] bg-white pl-10 pr-4 text-sm text-[#1f1b1a] placeholder:text-[#b5a7a2] outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#e95345]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0e8e4] bg-[#fffaf8] text-xs font-bold uppercase tracking-wider text-[#6f625f]">
                <th className="px-4 py-3.5">No</th>
                <th className="px-4 py-3.5">Nama Kapal</th>
                <th className="px-4 py-3.5">Kode</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Keterangan</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8e4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6f625f]">
                    Memuat data armada kapal...
                  </td>
                </tr>
              ) : filteredKapal.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6f625f]">
                    Belum ada data kapal yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredKapal.map((item, index) => (
                  <tr key={item.id_kapal} className="transition hover:bg-[#fffaf8]">
                    <td className="px-4 py-4 font-semibold text-[#1f1b1a]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fee9e6] text-[#e95345]">
                          <Anchor size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[#1f1b1a]">{item.nama_kapal}</p>
                          <p className="text-xs text-[#8c7c78]">ID: #{item.id_kapal}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold font-mono text-zinc-700">
                        {item.kode_kapal}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {String(item.status).toLowerCase() === 'aktif' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[#6f625f] max-w-xs truncate">
                      {item.keterangan || '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-[#e95345] hover:bg-[#fee9e6] hover:text-[#e95345]"
                          title="Edit Kapal"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          title="Hapus Kapal"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KapalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedKapal}
        loadingSubmit={loadingSubmit}
      />
    </div>
  );
}
