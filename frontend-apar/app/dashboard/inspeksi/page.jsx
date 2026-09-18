'use client';

import { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  CalendarCheck,
  Download,
  Plus,
  MapPin,
  ImageIcon,
  Pencil,
  Trash2,
  X,
  ZoomIn,
  Clock,
  Gauge
} from 'lucide-react';

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

  // State untuk modal lightbox foto
  const [previewPhotoItem, setPreviewPhotoItem] = useState(null);

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
      return 'bg-[#e7f8ef] text-[#00a862] border border-[#00a862]/20';
    }
    if (value === 'tidak layak' || value === 'rusak') {
      return 'bg-[#fee9e6] text-[#e95345] border border-[#e95345]/20';
    }
    return 'bg-[#fff3d8] text-[#d97706] border border-[#f5a400]/20';
  };

  const getTekananBadgeClass = (tekanan) => {
    const value = tekanan?.toLowerCase();
    if (value === 'normal') {
      return 'bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7]/20';
    }
    if (value === 'tinggi') {
      return 'bg-[#fee9e6] text-[#e95345] border border-[#e95345]/20';
    }
    return 'bg-[#fef3c7] text-[#d97706] border border-[#d97706]/20';
  };

  const handleExportExcel = () => {
    const dataToExport = inspeksi.map((item, index) => ({
      No: index + 1,
      'Kode APAR': item.kode_apar || '-',
      Lokasi: item.lokasi || '-',
      'Tanggal Inspeksi': formatTanggal(item.tanggal_inspeksi),
      'Kondisi Tekanan': item.kondisi_tekanan || '-',
      'Hasil Inspeksi': item.hasil || '-',
      Catatan: item.catatan || '-',
      'Ada Foto': item.foto ? 'Ya' : 'Tidak'
    }));

    exportToExcel(dataToExport, 'Data_Inspeksi_APAR');
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Inspeksi</h1>
          <p className="mt-1.5 text-sm text-[#6f625f]">
            Kelola hasil inspeksi fisik APAR, dokumentasi foto, dan riwayat kondisi tekanan alat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfdb] bg-white px-4 py-2.5 text-sm font-bold text-[#1f1b1a] shadow-2xs transition hover:bg-[#fff5f3] hover:text-[#e95345]"
          >
            <Download size={18} />
            Export Excel
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
          >
            <Plus size={18} />
            Tambah Inspeksi
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Inspeksi"
          value={totalInspeksi}
          description="+ Catatan fisik APAR"
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
          description="- Perlu perhatian / tindakan"
          icon={AlertTriangle}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />

        <StatCard
          title="Tekanan Normal"
          value={tekananNormal}
          description="+ Jarang bermasalah"
          icon={CalendarCheck}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />
      </div>

      {/* Data Table Card */}
      <DataTableCard
        title="Daftar Inspeksi APAR"
        description="Catatan hasil inspeksi lapangan beserta foto bukti kondisi fisik APAR."
        columns={[
          'APAR & Lokasi',
          'Foto Inspeksi',
          'Tanggal Inspeksi',
          'Kondisi Tekanan',
          'Hasil',
          'Catatan',
          'Aksi'
        ]}
        data={inspeksi}
        emptyText={
          loading ? 'Memuat data inspeksi...' : 'Belum ada catatan data inspeksi'
        }
        renderRow={(item) => (
          <tr
            key={item.id_inspeksi}
            className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8]"
          >
            {/* APAR & Lokasi */}
            <td className="px-4 py-4.5">
              <div className="flex flex-col">
                <span className="font-bold text-[#151211] text-sm">
                  {item.kode_apar || 'APAR-???'}
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#6f625f]">
                  <MapPin size={12} className="text-[#e95345] shrink-0" />
                  {item.lokasi || 'Lokasi tidak terdaftar'}
                </span>
              </div>
            </td>

            {/* Foto Inspeksi */}
            <td className="px-4 py-4.5">
              {item.foto ? (
                <div
                  onClick={() => setPreviewPhotoItem(item)}
                  className="group relative h-12 w-12 cursor-pointer overflow-hidden rounded-xl border border-[#eadfdb] bg-gray-100 shadow-2xs transition hover:scale-105 hover:border-[#e95345]"
                  title="Klik untuk melihat foto ukuran penuh"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.foto}
                    alt={`Foto ${item.kode_apar}`}
                    className="h-full w-full object-cover transition duration-200 group-hover:brightness-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <ZoomIn size={16} className="text-white" />
                  </div>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8f817d] bg-[#f5f0ee] px-2.5 py-1 rounded-lg">
                  <ImageIcon size={12} /> Tanpa Foto
                </span>
              )}
            </td>

            {/* Tanggal Inspeksi */}
            <td className="px-4 py-4.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#151211]">
                <Clock size={13} className="text-[#8f817d] shrink-0" />
                <span>{formatTanggal(item.tanggal_inspeksi)}</span>
              </div>
            </td>

            {/* Kondisi Tekanan */}
            <td className="px-4 py-4.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getTekananBadgeClass(
                  item.kondisi_tekanan
                )}`}
              >
                <Gauge size={12} />
                {item.kondisi_tekanan || '-'}
              </span>
            </td>

            {/* Hasil */}
            <td className="px-4 py-4.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${getHasilBadgeClass(
                  item.hasil
                )}`}
              >
                {item.hasil || '-'}
              </span>
            </td>

            {/* Catatan */}
            <td className="px-4 py-4.5 text-xs text-[#151211] max-w-[200px] truncate" title={item.catatan || ''}>
              {item.catatan || <span className="text-[#a09490] font-normal italic">- Tidak ada catatan -</span>}
            </td>

            {/* Aksi */}
            <td className="px-4 py-4.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#fee9e6] px-3 py-1.5 text-xs font-bold text-[#e95345] transition hover:bg-[#fbd8d4]"
                  title="Edit Inspeksi"
                >
                  <Pencil size={13} /> Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id_inspeksi)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#f5f0ee] px-3 py-1.5 text-xs font-bold text-[#6f625f] transition hover:bg-[#ebe3df] hover:text-[#151211]"
                  title="Hapus Inspeksi"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Modal Form Inspeksi */}
      <InspeksiModal
        key={selectedInspeksi?.id_inspeksi || 'create'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loadingSubmit={loadingSubmit}
        initialData={selectedInspeksi}
      />

      {/* Modal Lightbox Preview Foto Ukuran Penuh */}
      {previewPhotoItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white overflow-hidden shadow-2xl">
            {/* Header Preview */}
            <div className="flex items-center justify-between border-b border-[#eadfdb] bg-[#faf8f7] px-6 py-4">
              <div>
                <h3 className="font-bold text-[#1f1b1a] text-lg">
                  Dokumentasi Foto Bukti Inspeksi
                </h3>
                <p className="text-xs text-[#6f625f] mt-0.5">
                  {previewPhotoItem.kode_apar} &bull; {previewPhotoItem.lokasi || 'Lokasi N/A'}
                </p>
              </div>

              <button
                onClick={() => setPreviewPhotoItem(null)}
                className="rounded-full p-2 text-[#6f625f] transition hover:bg-[#fee9e6] hover:text-[#e95345]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Preview Gambar */}
            <div className="p-6 flex flex-col items-center justify-center bg-gray-950/95 min-h-[320px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhotoItem.foto}
                alt={`Bukti ${previewPhotoItem.kode_apar}`}
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>

            {/* Footer Detail Information */}
            <div className="grid grid-cols-3 border-t border-[#eadfdb] bg-white p-4 text-center text-xs divide-x divide-[#eadfdb]">
              <div>
                <span className="block text-[#8f817d]">Tanggal</span>
                <span className="font-bold text-[#151211] mt-0.5 block">
                  {formatTanggal(previewPhotoItem.tanggal_inspeksi)}
                </span>
              </div>

              <div>
                <span className="block text-[#8f817d]">Kondisi Tekanan</span>
                <span className="font-bold text-[#151211] mt-0.5 block capitalize">
                  {previewPhotoItem.kondisi_tekanan || '-'}
                </span>
              </div>

              <div>
                <span className="block text-[#8f817d]">Hasil Inspeksi</span>
                <span className="font-bold text-[#e95345] mt-0.5 block capitalize">
                  {previewPhotoItem.hasil || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

