'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCcw,
  CalendarClock,
  BadgeDollarSign,
  Building2,
  Download,
  Plus
} from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import PengisianUlangModal from '@/components/PengisianUlangModal';
import {
  createPengisianUlang,
  getAllPengisianUlang,
  deletePengisianUlang,
  updatePengisianUlang
} from '@/services/pengisianUlangService';
import { showConfirm, showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
};

const getDaysUntil = (value) => {
  if (!value) {
    return null;
  }

  const today = new Date();
  const date = new Date(value);

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
};

export default function PengisianUlangPage() {
  const [pengisianUlang, setPengisianUlang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedPengisian, setSelectedPengisian] = useState(null);
  const [preselectedAparId, setPreselectedAparId] = useState('');
  const router = useRouter();

  const fetchPengisianUlang = async () => {
    try {
      setLoading(true);
      const data = await getAllPengisianUlang();
      setPengisianUlang(data);
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

  const handleCreate = async (formData) => {
    try {
      setLoadingSubmit(true);
      await createPengisianUlang(formData);
      setIsModalOpen(false);
      setPreselectedAparId('');
      router.replace('/dashboard/pengisian-ulang');
      await fetchPengisianUlang();
      showFeedback({
        title: 'Berhasil',
        message: 'Data pengisian ulang berhasil ditambahkan',
        type: 'success'
      });
    } catch (error) {
      showFeedback({
        title: 'Gagal Menambahkan',
        message: error.message,
        type: 'error'
      });
      throw error;
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setLoadingSubmit(true);
      await updatePengisianUlang(selectedPengisian.id_return, formData);
      setIsModalOpen(false);
      setSelectedPengisian(null);
      await fetchPengisianUlang();
      showFeedback({
        title: 'Berhasil',
        message: 'Data pengisian ulang berhasil diubah',
        type: 'success'
      });
    } catch (error) {
      showFeedback({
        title: 'Gagal Mengubah',
        message: error.message,
        type: 'error'
      });
      throw error;
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpenCreateModal = (idApar = '') => {
    setSelectedPengisian(null);
    setPreselectedAparId(idApar ? String(idApar) : '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedPengisian(item);
    setPreselectedAparId('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPengisian(null);
    setPreselectedAparId('');
    router.replace('/dashboard/pengisian-ulang');
  };

  const handleDelete = async (id) => {
    const yakin = await showConfirm({
      title: 'Hapus Data Pengisian Ulang?',
      message: 'Data pengisian ulang yang dihapus tidak dapat dikembalikan.',
      confirmLabel: 'Hapus'
    });
    if (!yakin) return;

    try {
      await deletePengisianUlang(id);
      showFeedback({
        title: 'Berhasil',
        message: 'Data pengisian ulang berhasil dihapus',
        type: 'success'
      });
      fetchPengisianUlang();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPengisianUlang = async () => {
      try {
        const data = await getAllPengisianUlang();

        if (isMounted) {
          setPengisianUlang(data);
        }
      } catch (error) {
        if (isMounted) {
          showFeedback({
            title: 'Gagal Memuat Data',
            message: error.message,
            type: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPengisianUlang();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const idApar = new URLSearchParams(window.location.search).get('id_apar');

    if (!idApar) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleOpenCreateModal(idApar);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const totalPengisian = pengisianUlang.length;
  const totalBiaya = pengisianUlang.reduce(
    (total, item) => total + Number(item.biaya || 0),
    0
  );
  const totalVendor = new Set(
    pengisianUlang.map((item) => item.nama_vendor)
  ).size;
  const akanKadaluwarsa = pengisianUlang.filter((item) => {
    const sisaHari = getDaysUntil(item.tanggal_kadaluwarsa);

    return sisaHari !== null && sisaHari >= 0 && sisaHari <= 30;
  }).length;

  const handleExportExcel = () => {
    const dataToExport = pengisianUlang.map((item, index) => ({
      No: index + 1,
      'Kode APAR': item.kode_apar,
      Lokasi: item.lokasi || '-',
      Vendor: item.nama_vendor || '-',
      'Tanggal Isi Ulang': formatDate(item.tanggal_pengisian),
      'Tanggal Kadaluwarsa': formatDate(item.tanggal_kadaluwarsa),
      Biaya: `Rp ${Number(item.biaya || 0).toLocaleString('id-ID')}`
    }));

    exportToExcel(dataToExport, 'Data_Pengisian_Ulang_APAR');
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Pengisian Ulang</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola data pengisian ulang APAR, vendor, biaya, dan tanggal kadaluwarsa.
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
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9473a]"
          >
            <Plus size={18} />
            Tambah Pengisian
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pengisian"
          value={totalPengisian}
          description="+ Data refill"
          icon={RefreshCcw}
        />

        <StatCard
          title="Total Biaya"
          value={`Rp ${totalBiaya.toLocaleString('id-ID')}`}
          description="+ Akumulasi biaya"
          icon={BadgeDollarSign}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Total Vendor"
          value={totalVendor}
          description="+ Vendor terlibat"
          icon={Building2}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />

        <StatCard
          title="Akan Kadaluwarsa"
          value={akanKadaluwarsa}
          description="- 30 hari ke depan"
          icon={CalendarClock}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
        />
      </div>

      <DataTableCard
        title="Daftar Pengisian Ulang"
        description="Semua data pengisian ulang APAR yang tercatat dalam sistem."
        columns={[
          'Kode APAR',
          'Lokasi',
          'Tanggal',
          'Kadaluwarsa',
          'Vendor',
          'Biaya',
          'Catatan',
          'Aksi'
        ]}
        data={pengisianUlang}
        emptyText={
          loading
            ? 'Loading data pengisian ulang...'
            : 'Belum ada data pengisian ulang'
        }
        renderRow={(item) => (
          <tr key={item.id_return} className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8] dark:hover:bg-white/10">
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.kode_apar || '-'}
            </td>
            <td className="px-3 py-4 text-[#6f625f] ">{item.lokasi || '-'}</td>
            <td className="px-3 py-4 text-[#6f625f]">{formatDate(item.tanggal)}</td>
            <td className="px-3 py-4 text-[#6f625f]">{formatDate(item.tanggal_kadaluwarsa)}</td>
            <td className="px-3 py-4 text-[#6f625f]">{item.nama_vendor || '-'}</td>
            <td className="px-3 py-4 text-[#6f625f]">
              Rp {Number(item.biaya || 0).toLocaleString('id-ID')}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.catatan || '-'}</td>
            <td className="px-3 py-4">
              <button
                onClick={() => handleOpenEditModal(item)}
                className="mr-2 rounded-lg bg-[#fee9e6] px-3 py-1 text-xs font-bold text-[#e95345]"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id_return)}
                className="rounded-lg bg-[#f5f0ee] px-3 py-1 text-xs font-bold text-[#6f625f]"
              >
                Hapus
              </button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <PengisianUlangModal
          key={selectedPengisian?.id_return || preselectedAparId || 'create'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={selectedPengisian ? handleUpdate : handleCreate}
          initialData={selectedPengisian}
          preselectedAparId={preselectedAparId}
          loadingSubmit={loadingSubmit}
        />
      )}
    </div>
  );
}
