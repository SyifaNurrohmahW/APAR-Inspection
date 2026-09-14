'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  UserCheck,
  ClipboardCheck,
  AlertTriangle,
  RefreshCcw,
  Download
} from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import { getAllRiwayat } from '@/services/riwayatService';
import { showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleIsiUlang = (item) => {
    if (!item.id_apar) {
      showFeedback({
        title: 'APAR Tidak Ditemukan',
        message: 'Riwayat ini belum terhubung dengan data APAR.',
        type: 'warning'
      });
      return;
    }

    router.push(`/dashboard/pengisian-ulang?id_apar=${item.id_apar}`);
  };

  useEffect(() => {
    let isMounted = true;

    const loadRiwayat = async () => {
      try {
        const data = await getAllRiwayat();

        if (isMounted) {
          setRiwayat(data);
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

    loadRiwayat();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRiwayat = riwayat.length;
  const totalUser = new Set(riwayat.map((item) => item.id_users)).size;
  const hasilBaik = riwayat.filter((item) => item.hasil === 'Baik').length;
  const hasilPerluCek = riwayat.filter((item) => item.hasil !== 'Baik').length;

  const handleExportExcel = () => {
    const dataToExport = riwayat.map((item, index) => ({
      No: index + 1,
      Pengguna: item.nama_pengguna || '-',
      'Kode APAR': item.kode_apar || '-',
      Lokasi: item.lokasi || '-',
      Hasil: item.hasil || '-',
      Waktu: item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'
    }));

    exportToExcel(dataToExport, 'Data_Riwayat_Inspeksi');
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <PageHeader
          title="Riwayat"
          description="Lihat catatan aktivitas inspeksi APAR berdasarkan pengguna, lokasi, dan hasil pengecekan."
        />
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfdb] bg-white px-4 py-2.5 text-sm font-bold text-[#1f1b1a] shadow-sm transition hover:bg-[#fff5f3] hover:text-[#e95345] self-start sm:self-auto"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Riwayat"
          value={totalRiwayat}
          description="+ Aktivitas tercatat"
          icon={History}
        />

        <StatCard
          title="Pengguna Terlibat"
          value={totalUser}
          description="+ Petugas/admin"
          icon={UserCheck}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Hasil Baik"
          value={hasilBaik}
          description="+ Layak"
          icon={ClipboardCheck}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
        />

        <StatCard
          title="Perlu Perhatian"
          value={hasilPerluCek}
          description="- Cek lanjutan"
          icon={AlertTriangle}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />
      </div>

      <DataTableCard
        title="Daftar Riwayat"
        description="Semua riwayat inspeksi yang tercatat dalam sistem."
        columns={[
          'ID',
          'Pengguna',
          'Kode APAR',
          'Lokasi',
          'Tanggal Inspeksi',
          'Tekanan',
          'Hasil',
          'Catatan',
          'Aksi'
        ]}
        data={riwayat}
        emptyText={loading ? 'Loading data riwayat...' : 'Belum ada data riwayat'}
        renderRow={(item) => (
          <tr
            key={item.id_riwayat || `inspeksi-${item.id_inspeksi}`}
            className="border-b border-[#f0e8e4] transition hover:bg-[#fffaf8] dark:hover:bg-white/10"
          >
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.id_riwayat ? `#${item.id_riwayat}` : `INS-${item.id_inspeksi}`}
            </td>
            <td className="px-3 py-4">
              <div>
                <p className="font-bold font-bold text-[#151211]">{item.nama || '-'}</p>
                <p className="mt-1 text-xs text-[#9b8d89]">{item.role || '-'}</p>
              </div>
            </td>
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.kode_apar || '-'}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.lokasi || '-'}</td>
            <td className="px-3 py-4 text-[#6f625f]">
              {item.tanggal_inspeksi || '-'}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.kondisi_tekanan || '-'}</td>
            <td className="px-3 py-4 text-[#6f625f]">
              <span className="rounded-full bg-[#e7f8ef] px-3 py-1 text-xs font-bold text-[#00a862]">
                {item.hasil || '-'}
              </span>
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.catatan || '-'}</td>
            <td className="px-3 py-4">
              <button
                onClick={() => handleIsiUlang(item)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#fee9e6] px-3 py-1.5 text-xs font-bold text-[#e95345] transition hover:bg-[#fbd7d2]"
              >
                <RefreshCcw size={14} />
                Isi Ulang
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
