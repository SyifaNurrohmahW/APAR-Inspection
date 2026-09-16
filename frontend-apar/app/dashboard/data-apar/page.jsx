'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FireExtinguisher,
  CheckCircle,
  AlertTriangle,
  Download,
  Plus,
  X
} from 'lucide-react';

import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import DataAparModal from '@/components/DataAparModal';
import {
  createDataApar,
  getAllDataApar,
  deleteDataApar,
  updateDataApar
} from '@/services/dataAparService';
import { showConfirm, showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
};

const getStatusClass = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (normalizedStatus === 'baik') {
    return 'bg-[#e7f8ef] text-[#008f55]';
  }

  if (normalizedStatus === 'akan kadaluwarsa') {
    return 'bg-[#fff3d8] text-[#b87500]';
  }

  return 'bg-[#fee9e6] text-[#e95345]';
};

function DataAparContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('search') || '';

  const [dataApar, setDataApar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedApar, setSelectedApar] = useState(null);

  const fetchDataApar = async () => {
    try {
      setLoading(true);
      const data = await getAllDataApar();
      setDataApar(data);
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

  const handleDelete = async (id) => {
    const yakin = await showConfirm({
      title: 'Hapus Data APAR?',
      message: 'Data APAR yang dihapus tidak dapat dikembalikan.',
      confirmLabel: 'Hapus'
    });
    if (!yakin) return;

    try {
      await deleteDataApar(id);
      showFeedback({
        title: 'Berhasil',
        message: 'Data APAR berhasil dihapus',
        type: 'success'
      });
      fetchDataApar();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleCreate = async (formData) => {
    try {
      setLoadingSubmit(true);
      await createDataApar(formData);
      setIsModalOpen(false);
      await fetchDataApar();
      showFeedback({
        title: 'Berhasil',
        message: 'Data APAR berhasil ditambahkan',
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
      await updateDataApar(selectedApar.id_apar, formData);
      setIsModalOpen(false);
      setSelectedApar(null);
      await fetchDataApar();
      showFeedback({
        title: 'Berhasil',
        message: 'Data APAR berhasil diubah',
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

  const handleOpenCreateModal = () => {
    setSelectedApar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedApar(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApar(null);
  };

  useEffect(() => {
    let isMounted = true;

    const loadDataApar = async () => {
      try {
        const data = await getAllDataApar();

        if (isMounted) {
          setDataApar(data);
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

    loadDataApar();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalApar = dataApar.length;
  const aparBaik = dataApar.filter(
    (item) => String(item.status || '').toLowerCase() === 'baik'
  ).length;
  const aparAkanKadaluwarsa = dataApar.filter(
    (item) => String(item.status || '').toLowerCase() === 'akan kedaluwarsa'
  ).length;
  const aparKadaluwarsa = dataApar.filter(
    (item) => String(item.status || '').toLowerCase() === 'kedaluwarsa'
  ).length;

  const filteredDataApar = dataApar.filter((item) => {
    if (!queryParam) return true;
    const q = queryParam.toLowerCase();
    return (
      String(item.kode_apar || '').toLowerCase().includes(q) ||
      String(item.lokasi || '').toLowerCase().includes(q) ||
      String(item.jenis || '').toLowerCase().includes(q) ||
      String(item.status || '').toLowerCase().includes(q)
    );
  });

  const handleExportExcel = () => {
    const dataToExport = dataApar.map((item, index) => ({
      No: index + 1,
      'Kode APAR': item.kode_apar,
      Lokasi: item.lokasi || '-',
      Jenis: item.jenis,
      Berat: item.berat !== null && item.berat !== undefined ? `${parseFloat(item.berat)} kg` : '-',
      Status: item.status,
      'Tanggal Terakhir': formatDate(item.tanggal)
    }));

    exportToExcel(dataToExport, 'Data_APAR');
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Data APAR</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola data alat pemadam api ringan berdasarkan lokasi, jenis, berat, dan status.
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
            Tambah APAR
          </button>
        </div>
      </div>

      {queryParam && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#eadfdb] bg-[#fee9e6]/50 p-4 text-sm font-bold text-[#e95345]">
          <span>Menampilkan hasil pencarian untuk: "{queryParam}"</span>
          <button
            onClick={() => router.push('/dashboard/data-apar')}
            className="flex items-center gap-1 rounded-lg border border-[#e95345]/30 bg-white px-3 py-1 text-xs transition hover:bg-[#e95345] hover:text-white"
          >
            <X size={14} /> Reset Filter
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total APAR"
          value={totalApar}
          description="+ Data terdaftar"
          icon={FireExtinguisher}
        />

        <StatCard
          title="Kondisi Baik"
          value={aparBaik}
          description="+ Siap digunakan"
          icon={CheckCircle}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Akan Kadaluwarsa"
          value={aparAkanKadaluwarsa}
          description="- Perlu dijadwalkan"
          icon={AlertTriangle}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />

        <StatCard
          title="Kadaluwarsa"
          value={aparKadaluwarsa}
          description="- Harus ditindaklanjuti"
          icon={AlertTriangle}
          iconBg="bg-[#fee9e6]"
          iconColor="text-[#e95345]"
          trendColor="text-[#e95345]"
        />
      </div>

      <DataTableCard
        title="Daftar Data APAR"
        description="Semua data APAR yang terdaftar dalam sistem."
        columns={[
          'Kode APAR',
          'Lokasi',
          'Jenis',
          'Berat',
          'Status',
          'Tanggal',
          'Aksi'
        ]}
        data={filteredDataApar}
        emptyText={loading ? 'Loading data APAR...' : queryParam ? `Tidak ada data APAR yang cocok dengan "${queryParam}"` : 'Belum ada data APAR'}
        renderRow={(item) => (
          <tr key={item.id_apar} className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8] dark:hover:bg-white/10">
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.kode_apar}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.lokasi}</td>
            <td className="px-3 py-4 font-semibold text-[#1f1b1a]">
              {item.jenis || '-'}
            </td>
            <td className="px-3 py-4 font-semibold text-[#1f1b1a]">
              {item.berat !== null && item.berat !== undefined && item.berat !== '' ? `${parseFloat(item.berat)} Kg` : '-'}
            </td>
            <td className="px-3 py-4">
              <span
                className={`inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(item.status)}`}
              >
                {item.status || '-'}
              </span>
            </td>
            <td className="px-3 py-4 text-[#6f625f]">
              {formatDate(item.tanggal)}
            </td>
            <td className="px-3 py-4">
              <button
                onClick={() => handleOpenEditModal(item)}
                className="mr-2 rounded-lg bg-[#fee9e6] px-3 py-1 text-xs font-bold text-[#e95345]"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id_apar)}
                className="rounded-lg bg-[#f5f0ee] px-3 py-1 text-xs font-bold text-[#6f625f]"
              >
                Hapus
              </button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <DataAparModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={selectedApar ? handleUpdate : handleCreate}
          initialData={selectedApar}
          loadingSubmit={loadingSubmit}
        />
      )}
    </div>
  );
}

export default function DataAparPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-sm">Loading...</div>}>
      <DataAparContent />
    </Suspense>
  );
}
