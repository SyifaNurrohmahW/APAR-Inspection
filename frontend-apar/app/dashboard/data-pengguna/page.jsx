'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Wrench,
  Download,
  Plus,
  Search,
  Edit3,
  Trash2,
  Filter
} from 'lucide-react';

import StatCard from '@/components/dashboard-menu/statCard';
import DataPenggunaModal from '@/components/DataPenggunaModal';
import {
  createPengguna,
  getAllPengguna,
  deletePengguna,
  updatePengguna
} from '@/services/dataPenggunaService';
import { showConfirm, showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

export default function DataPenggunaPage() {
  const router = useRouter();
  const [pengguna, setPengguna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedPengguna, setSelectedPengguna] = useState(null);

  const fetchPengguna = async () => {
    try {
      setLoading(true);
      const data = await getAllPengguna();
      setPengguna(Array.isArray(data) ? data : []);
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
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (String(parsedUser.role || '').toLowerCase() !== 'superadmin') {
          showFeedback({
            title: 'Akses Ditolak',
            message: 'Hanya Superadmin yang berhak mengelola data pengguna.',
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

    fetchPengguna();
  }, [router]);

  const handleOpenCreateModal = () => {
    setSelectedPengguna(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedPengguna(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPengguna(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);

      if (selectedPengguna) {
        await updatePengguna(selectedPengguna.id_users, formData);
        showFeedback({
          title: 'Berhasil',
          message: 'Data pengguna berhasil diperbarui',
          type: 'success'
        });
      } else {
        await createPengguna(formData);
        showFeedback({
          title: 'Berhasil',
          message: 'Akun pengguna baru berhasil ditambahkan',
          type: 'success'
        });
      }

      handleCloseModal();
      fetchPengguna();
    } catch (error) {
      showFeedback({
        title: selectedPengguna ? 'Gagal Mengubah Data' : 'Gagal Menambah Data',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (item) => {
    const yakin = await showConfirm({
      title: 'Hapus Akun Pengguna?',
      message: `Apakah Anda yakin ingin menghapus akun "${item.nama}"? Pengguna ini tidak dapat login lagi setelah dihapus.`,
      confirmLabel: 'Hapus Pengguna'
    });

    if (!yakin) return;

    try {
      await deletePengguna(item.id_users);
      showFeedback({
        title: 'Pengguna Terhapus',
        message: 'Akun pengguna berhasil dihapus dari sistem.',
        type: 'success'
      });
      fetchPengguna();
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredPengguna.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      Email: item.email,
      'No HP / WhatsApp': item.no_hp || '-',
      Role: item.role,
      Status: item.status,
      'Tanggal Dibuat': item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'
    }));

    exportToExcel(dataToExport, 'Master_Data_Pengguna_APAR');
  };

  // Filter & Search Logic
  const filteredPengguna = pengguna.filter((item) => {
    const matchesSearch =
      (item.nama && item.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.no_hp && item.no_hp.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' || String(item.role || '').toLowerCase() === roleFilter;

    const matchesStatus =
      statusFilter === 'all' || String(item.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPengguna = pengguna.length;
  const totalAdmin = pengguna.filter(
    (item) => String(item.role || '').toLowerCase() === 'admin'
  ).length;
  const totalTeknisi = pengguna.filter(
    (item) => String(item.role || '').toLowerCase() === 'teknisi'
  ).length;
  const totalSuperadmin = pengguna.filter(
    (item) => String(item.role || '').toLowerCase() === 'superadmin'
  ).length;
  const totalAktif = pengguna.filter(
    (item) => String(item.status || '').toLowerCase() === 'aktif'
  ).length;

  const getRoleBadge = (role) => {
    const norm = String(role || '').toLowerCase();
    if (norm === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 capitalize">
          <ShieldCheck size={13} />
          Superadmin
        </span>
      );
    }
    if (norm === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 capitalize">
          <UserCheck size={13} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 capitalize">
        <Wrench size={13} />
        Teknisi
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const norm = String(status || '').toLowerCase();
    if (norm === 'aktif') {
      return (
        <span className="rounded-full border border-emerald-200 bg-[#e7f8ef] px-2.5 py-1 text-xs font-bold text-[#00a862] capitalize">
          Aktif
        </span>
      );
    }
    return (
      <span className="rounded-full border border-amber-200 bg-[#fff3d8] px-2.5 py-1 text-xs font-bold text-[#b87500] capitalize">
        Nonaktif
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Top Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#151211]">Data Pengguna</h1>
          <p className="mt-2 text-sm text-[#6f625f]">
            Kelola data pengguna, hak akses role (Superadmin, Admin, Teknisi), dan status akun.
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
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Ringkasan Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pengguna"
          value={totalPengguna}
          description="Semua akun terdaftar"
          icon={Users}
        />

        <StatCard
          title="Teknisi Lapangan"
          value={totalTeknisi}
          description="Petugas inspeksi APAR"
          icon={Wrench}
          iconBg="bg-[#e0f2fe]"
          iconColor="text-[#0284c7]"
        />

        <StatCard
          title="Admin & Superadmin"
          value={totalAdmin + totalSuperadmin}
          description={`Admin (${totalAdmin}), Superadmin (${totalSuperadmin})`}
          icon={ShieldCheck}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />

        <StatCard
          title="Pengguna Aktif"
          value={totalAktif}
          description="Dapat login ke sistem"
          icon={UserCheck}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />
      </div>

      {/* Tabel & Filter Card */}
      <div className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1f1b1a]">Daftar Akun Pengguna</h3>
            <p className="mt-1 text-sm text-[#6f625f]">
              Pengelolaan CRUD pengguna sistem untuk role Superadmin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, hp..."
                className="h-10 w-full rounded-xl border border-[#eadfdb] bg-[#fffaf8] dark:bg-[#161822] dark:focus:bg-[#161822] pl-10 pr-4 text-sm outline-none transition focus:border-[#e95345] focus:bg-white"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#eadfdb] bg-[#fffaf8] dark:bg-[#161822] dark:focus:bg-[#161822] px-3 pr-8 text-sm font-semibold text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:bg-white"
              >
                <option value="all">Semua Role</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="teknisi">Teknisi</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#eadfdb] bg-[#fffaf8] dark:bg-[#161822] dark:focus:bg-[#161822] px-3 pr-8 text-sm font-semibold text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Data Pengguna */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0e8e4] bg-[#fffaf8] text-xs font-bold uppercase tracking-wider text-[#6f625f]">
                <th className="px-4 py-3.5">No</th>
                <th className="px-4 py-3.5">Pengguna</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">No HP</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e8e4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6f625f]">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredPengguna.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6f625f]">
                    Belum ada data pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredPengguna.map((item, index) => (
                  <tr key={item.id_users} className="transition hover:bg-[#fffaf8] dark:hover:bg-white/10">
                    <td className="px-4 py-4 font-semibold text-[#1f1b1a]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e95345] to-[#ff7a6d] text-xs font-bold text-white shadow-sm">
                          {item.nama ? item.nama.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-[#1f1b1a]">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#6f625f]">{item.email}</td>
                    <td className="px-4 py-4 text-[#6f625f]">{item.no_hp || '-'}</td>
                    <td className="px-4 py-4">{getRoleBadge(item.role)}</td>
                    <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-[#e95345] hover:bg-[#fee9e6] hover:text-[#e95345]"
                          title="Edit Pengguna"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eadfdb] bg-white text-[#6f625f] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          title="Hapus Pengguna"
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

      {/* Modal CRUD Pengguna */}
      <DataPenggunaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loadingSubmit={loadingSubmit}
        initialData={selectedPengguna}
      />
    </div>
  );
}
