'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle, MapPin, Trash2 } from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import LokasiModal from '@/components/LokasiModal';
import {
  createLokasi,
  deleteLokasi,
  getAllLokasi,
  updateLokasi
} from '@/services/lokasiService';
import { showConfirm, showFeedback } from '@/utils/feedback';

export default function LokasiPage() {
  const [lokasi, setLokasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedLokasi, setSelectedLokasi] = useState(null);

  const fetchLokasi = async () => {
    try {
      setLoading(true);
      const data = await getAllLokasi();
      setLokasi(data);
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
      await createLokasi(formData);
      setIsModalOpen(false);
      await fetchLokasi();
      showFeedback({
        title: 'Berhasil',
        message: 'Data lokasi berhasil ditambahkan',
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
      await updateLokasi(selectedLokasi.id_lokasi, formData);
      setIsModalOpen(false);
      setSelectedLokasi(null);
      await fetchLokasi();
      showFeedback({
        title: 'Berhasil',
        message: 'Data lokasi berhasil diubah',
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
    setSelectedLokasi(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedLokasi(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLokasi(null);
  };

  const handleDelete = async (id) => {
    const yakin = await showConfirm({
      title: 'Hapus Data Lokasi?',
      message: 'Data lokasi yang dihapus tidak dapat dikembalikan.',
      confirmLabel: 'Hapus'
    });
    if (!yakin) return;

    try {
      await deleteLokasi(id);
      showFeedback({
        title: 'Berhasil',
        message: 'Data lokasi berhasil dihapus',
        type: 'success'
      });
      fetchLokasi();
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

    const loadLokasi = async () => {
      try {
        const data = await getAllLokasi();

        if (isMounted) {
          setLokasi(data);
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

    loadLokasi();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalLokasi = lokasi.length;
  const lokasiTerbaru = lokasi[0]?.lokasi || '-';
  const lokasiTerisi = lokasi.filter((item) => item.lokasi).length;

  return (
    <div>
      <PageHeader
        title="Lokasi"
        description="Kelola area penempatan APAR yang digunakan dalam sistem inspeksi."
        buttonText="Tambah Lokasi"
        onButtonClick={handleOpenCreateModal}
      />

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Lokasi"
          value={totalLokasi}
          description="+ Area terdaftar"
          icon={MapPin}
        />

        <StatCard
          title="Lokasi Aktif"
          value={lokasiTerisi}
          description="+ Siap digunakan"
          icon={CheckCircle}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Lokasi Terbaru"
          value={lokasiTerbaru}
          description="+ Baru ditambahkan"
          icon={Building2}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />

        <StatCard
          title="Data Kosong"
          value={lokasi.length - lokasiTerisi}
          description="- Perlu dilengkapi"
          icon={Trash2}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />
      </div>

      <DataTableCard
        title="Daftar Lokasi"
        description="Semua lokasi yang terdaftar sebagai area penempatan APAR."
        columns={['ID Lokasi', 'Nama Lokasi', 'Dibuat', 'Diperbarui', 'Aksi']}
        data={lokasi}
        emptyText={loading ? 'Loading data lokasi...' : 'Belum ada data lokasi'}
        renderRow={(item) => (
          <tr key={item.id_lokasi} className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8] dark:hover:bg-white/10">
            <td className="px-3 py-4 font-bold text-[#151211]">
              #{item.id_lokasi}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.lokasi}</td>
            <td className="px-3 py-4 text-[#6f625f]">
              {item.created_at || '-'}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">
              {item.updated_at || '-'}
            </td>
            <td className="px-3 py-4">
              <button
                onClick={() => handleOpenEditModal(item)}
                className="mr-2 rounded-lg bg-[#fee9e6] px-3 py-1 text-xs font-bold text-[#e95345]"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id_lokasi)}
                className="rounded-lg bg-[#f5f0ee] px-3 py-1 text-xs font-bold text-[#6f625f]"
              >
                Hapus
              </button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <LokasiModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={selectedLokasi ? handleUpdate : handleCreate}
          initialData={selectedLokasi}
          loadingSubmit={loadingSubmit}
        />
      )}
    </div>
  );
}
