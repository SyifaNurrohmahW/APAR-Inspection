'use client';

import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  CalendarCheck,
  Download,
  Plus
} from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import InspeksiModal from '@/components/InspeksiModal';

import {
  getAllInspeksi,
  createInspeksi,
  updateInspeksi,
  deleteInspeksi
} from '@/services/inspeksiService';

import { showConfirm, showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

export default function InspeksiPage() {
  const [inspeksi, setInspeksi] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedInspeksi, setSelectedInspeksi] = useState(null);

  const fetchInspeksi = async () => {
    try {
      setLoading(true);
      const data = await getAllInspeksi();
      setInspeksi(data);
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
    const timer = window.setTimeout(() => {
      fetchInspeksi();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedInspeksi(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedInspeksi(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedInspeksi(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);

      if (selectedInspeksi) {
        await updateInspeksi(selectedInspeksi.id_inspeksi, formData);
        showFeedback({
          title: 'Berhasil',
          message: 'Data inspeksi berhasil diperbarui',
          type: 'success'
        });
      } else {
        await createInspeksi(formData);
        showFeedback({
          title: 'Berhasil',
          message: 'Data inspeksi berhasil ditambahkan',
          type: 'success'
        });
      }

      handleCloseModal();
      fetchInspeksi();
    } catch (error) {
      showFeedback({
        title: selectedInspeksi ? 'Gagal Mengubah Data' : 'Gagal Menambah Data',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    const yakin = await showConfirm({
      title: 'Hapus Data Inspeksi?',
      message: 'Data inspeksi yang dihapus tidak dapat dikembalikan.',
      confirmLabel: 'Hapus'
    });

    if (!yakin) return;

    try {
      await deleteInspeksi(id);

      showFeedback({
        title: 'Berhasil',
        message: 'Data inspeksi berhasil dihapus',
        type: 'success'
      });

      fetchInspeksi();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  const totalInspeksi = inspeksi.length;
  const hasilBaik = inspeksi.filter(
    (item) => item.hasil?.toLowerCase() === 'baik'
  ).length;
  const hasilBermasalah = inspeksi.filter(
    (item) => item.hasil?.toLowerCase() !== 'baik'
  ).length;
  const tekananNormal = inspeksi.filter(
    (item) => item.kondisi_tekanan?.toLowerCase() === 'normal'
  ).length;

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    return new Date(tanggal).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHasilBadgeClass = (hasil) => {
    const value = hasil?.toLowerCase();
    if (value === 'baik') {
      return 'bg-[#e7f8ef] text-[#00a862]';
    }
    if (value === 'rusak') {
      return 'bg-[#fee9e6] text-[#e95345]';
    }
    return 'bg-[#fff3d8] text-[#f5a400]';
  };

  const handleExportExcel = () => {
    const dataToExport = inspeksi.map((item, index) => ({
      No: index + 1,
      'Kode APAR': item.kode_apar || '-',
      Lokasi: item.lokasi || '-',
      'Tanggal Inspeksi': formatTanggal(item.tanggal_inspeksi),
      'Kondisi Tekanan': item.kondisi_tekanan || '-',
      'Hasil Inspeksi': item.hasil || '-',
      Catatan: item.catatan || '-'
    }));

    exportToExcel(dataToExport, 'Data_Inspeksi_APAR');
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Inspeksi</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola hasil inspeksi APAR berdasarkan kondisi tekanan dan kelayakan alat.
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
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
          >
            <Plus size={18} />
            Tambah Inspeksi
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Inspeksi"
          value={totalInspeksi}
          description="+ Data inspeksi"
          icon={ClipboardCheck}
        />

        <StatCard
          title="Hasil Baik"
          value={hasilBaik}
          description="+ Layak digunakan"
          icon={CheckCircle}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Bermasalah"
          value={hasilBermasalah}
          description="- Perlu tindakan"
          icon={AlertTriangle}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />

        <StatCard
          title="Tekanan Normal"
          value={tekananNormal}
          description="+ Aman"
          icon={CalendarCheck}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />
      </div>

      <DataTableCard
        title="Daftar Inspeksi"
        description="Semua catatan inspeksi APAR yang sudah dilakukan."
        columns={[
          'Kode APAR',
          'Lokasi',
          'Tanggal Inspeksi',
          'Tekanan',
          'Hasil',
          'Catatan',
          'Aksi'
        ]}
        data={inspeksi}
        emptyText={
          loading ? 'Loading data inspeksi...' : 'Belum ada data inspeksi'
        }
        renderRow={(item) => (
          <tr key={item.id_inspeksi} className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8] dark:hover:bg-white/10">
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.kode_apar || '-'}
            </td>

            <td className="px-3 py-4 text-[#6f625f]">
              {item.lokasi || '-'}
            </td>

            <td className="px-3 py-4 font-semibold text-[#151211]">
              {formatTanggal(item.tanggal_inspeksi)}
            </td>

            <td className="px-3 py-4 font-semibold capitalize text-[#151211]">
              {item.kondisi_tekanan || '-'}
            </td>

            <td className="px-3 py-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getHasilBadgeClass(
                  item.hasil
                )}`}
              >
                {item.hasil || '-'}
              </span>
            </td>

            <td className="px-3 py-4 text-[#151211]">
              {item.catatan || '-'}
            </td>

            <td className="px-3 py-4">
              <button
                onClick={() => handleOpenEditModal(item)}
                className="mr-2 rounded-lg bg-[#fee9e6] px-3 py-1 text-xs font-bold text-[#e95345] transition hover:bg-[#fbd8d4]"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id_inspeksi)}
                className="rounded-lg bg-[#f5f0ee] px-3 py-1 text-xs font-bold text-[#6f625f] transition hover:bg-[#ebe3df]"
              >
                Hapus
              </button>
            </td>
          </tr>
        )}
      />

      <InspeksiModal
        key={selectedInspeksi?.id_inspeksi || 'create'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loadingSubmit={loadingSubmit}
        initialData={selectedInspeksi}
      />
    </div>
  );
}
