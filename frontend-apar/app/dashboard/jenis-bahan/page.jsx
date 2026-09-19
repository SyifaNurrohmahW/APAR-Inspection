'use client';

import { useEffect, useState } from 'react';
import { Flame, Layers, Download, Plus, Search, Trash2, Edit3 } from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import JenisBahanModal from '@/components/JenisBahanModal';
import {
  getAllJenisBahan,
  createJenisBahan,
  updateJenisBahan,
  deleteJenisBahan
} from '@/services/jenisBahanService';
import { showConfirm, showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

export default function MasterJenisBahanPage() {
  const [jenisBahanList, setJenisBahanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedBahan, setSelectedBahan] = useState(null);

  const fetchJenisBahan = async () => {
    try {
      setLoading(true);
      const data = await getAllJenisBahan();
      setJenisBahanList(data);
    } catch (error) {
      showFeedback({
        title: 'Gagal Memuat Data',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJenisBahan();
  }, []);

  const handleOpenCreate = () => {
    setSelectedBahan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedBahan(item);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData) => {
    try {
      setLoadingSubmit(true);
      if (selectedBahan) {
        await updateJenisBahan(selectedBahan.id_jenis_bahan, formData);
        showFeedback({
          title: 'Berhasil Diperbarui',
          message: 'Data jenis bahan APAR berhasil disimpan.',
          type: 'success'
        });
      } else {
        await createJenisBahan(formData);
        showFeedback({
          title: 'Berhasil Ditambahkan',
          message: 'Jenis bahan APAR baru berhasil ditambahkan.',
          type: 'success'
        });
      }

      setIsModalOpen(false);
      setSelectedBahan(null);
      fetchJenisBahan();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menyimpan',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (item) => {
    const yakin = await showConfirm({
      title: 'Hapus Jenis Bahan?',
      message: `Apakah Anda yakin ingin menghapus "${item.nama_bahan}" dari master data?`,
      confirmLabel: 'Hapus'
    });

    if (!yakin) return;

    try {
      await deleteJenisBahan(item.id_jenis_bahan);
      showFeedback({
        title: 'Terhapus',
        message: 'Jenis bahan APAR telah dihapus.',
        type: 'success'
      });
      fetchJenisBahan();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      'ID Jenis Bahan': item.id_jenis_bahan,
      'Nama Bahan APAR': item.nama_bahan,
      Deskripsi: item.deskripsi || '-',
      'Tanggal Dibuat': item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'
    }));

    exportToExcel(dataToExport, 'Master_Jenis_Bahan_APAR');
  };

  const filteredData = jenisBahanList.filter(
    (item) =>
      item.nama_bahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Master Jenis Bahan APAR</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola jenis media / bahan pemadam kebakaran pada inventaris APAR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-bold text-[#1f1b1a] shadow-sm transition hover:bg-[#fff5f3] hover:text-[#e95345]"
          >
            <Download size={18} />
            Export Excel
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
          >
            <Plus size={18} />
            Tambah Jenis Bahan
          </button>
        </div>
      </div>

      {/* Ringkasan Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Jenis Bahan"
          value={jenisBahanList.length}
          description="Variasi bahan pemadam"
          icon={Flame}
          iconBg="bg-[#fee9e6]"
          iconColor="text-[#e95345]"
        />
        <StatCard
          title="Data Terdaftar"
          value={filteredData.length}
          description="Sesuai filter pencarian"
          icon={Layers}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1f1b1a]">
              Daftar Jenis Bahan APAR
            </h3>
            <p className="mt-1 text-sm text-[#6f625f]">
              Kumpulan jenis media pemadam api yang tersedia dalam sistem.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5a7a2] dark:text-[#94a3b8]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari jenis bahan..."
              className="h-10 w-full rounded-xl border border-[#eadfdb] dark:border-white/10 bg-white dark:bg-[#161822] text-[#1f1b1a] dark:text-white placeholder:text-[#b5a7a2] dark:placeholder:text-[#94a3b8] pl-10 pr-4 text-sm outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#e95345]/20"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0e8e4] bg-[#fffaf8] text-xs font-bold uppercase tracking-wider text-[#6f625f]">
                <th className="px-4 py-3.5">No</th>
                <th className="px-4 py-3.5">Nama Bahan APAR</th>
                <th className="px-4 py-3.5">Deskripsi</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8e4]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#6f625f]">
                    Memuat data master jenis bahan...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#6f625f]">
                    Belum ada data jenis bahan APAR.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id_jenis_bahan}
                    className="transition hover:bg-[#fffaf8] dark:hover:bg-white/10"
                  >
                    <td className="px-4 py-4 font-semibold text-[#1f1b1a]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fee9e6] text-[#e95345]">
                          <Flame size={18} />
                        </div>
                        <span className="font-bold text-[#1f1b1a]">
                          {item.nama_bahan}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#6f625f]">
                      {item.deskripsi || '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-[#e95345] hover:bg-[#fee9e6] hover:text-[#e95345]"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          title="Hapus"
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

      {/* Modal CRUD */}
      <JenisBahanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        loadingSubmit={loadingSubmit}
        initialData={selectedBahan}
      />
    </div>
  );
}
