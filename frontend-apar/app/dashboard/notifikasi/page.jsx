'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  ClipboardCheck,
  MessageSquare,
  RefreshCw,
  Trash2
} from 'lucide-react';

import PageHeader from '@/components/dashboard-menu/pageHeader';
import StatCard from '@/components/dashboard-menu/statCard';
import DataTableCard from '@/components/dashboard-menu/dataTableCard';
import {
  deleteNotifikasi,
  getAllNotifikasi,
  markAllNotifikasiRead
} from '@/services/notifikasiService';
import {
  getWhatsappStatus,
  syncWhatsappReminders
} from '@/services/whatsappService';
import { showConfirm, showFeedback } from '@/utils/feedback';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
};

const getNotificationTypeLabel = (item) => {
  if (item.jenis_notifikasi === 'kedaluwarsa_apar') {
    return 'Kedaluwarsa APAR';
  }

  return 'Inspeksi';
};

const getStatusText = (item) => {
  if (item.jenis_notifikasi === 'kedaluwarsa_apar') {
    if (item.sisa_hari === null || item.sisa_hari === undefined) {
      return item.status_apar || '-';
    }

    const sisaHari = Number(item.sisa_hari);

    if (sisaHari < 0) {
      return 'Kedaluwarsa';
    }

    return `${sisaHari} hari lagi`;
  }

  return item.hasil || '-';
};

const getBadgeClass = (item) => {
  if (item.tingkat === 'danger') {
    return 'bg-[#fee9e6] text-[#e95345]';
  }

  if (item.tingkat === 'warning') {
    return 'bg-[#fff3d8] text-[#b87500]';
  }

  return 'bg-[#e7f8ef] text-[#008f55]';
};

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waStatus, setWaStatus] = useState(null);
  const [syncingWa, setSyncingWa] = useState(false);

  const loadNotifikasi = async () => {
    try {
      setLoading(true);
      const data = await getAllNotifikasi();
      setNotifikasi(data);
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

  const loadWaStatus = async () => {
    try {
      const status = await getWhatsappStatus();
      setWaStatus(status);
    } catch (error) {
      setWaStatus({ ready: false, message: error.message });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const data = await getAllNotifikasi();

        if (isMounted) {
          setNotifikasi(data);
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

      loadWaStatus();
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncWaReminders = async () => {
    try {
      setSyncingWa(true);
      const result = await syncWhatsappReminders();
      await loadNotifikasi();

      showFeedback({
        title: 'Pengingat WA Berhasil Diproses',
        message: result?.skipped
          ? result.reason
          : `Total ${result?.total || 0} pengingat WhatsApp berhasil dikirim via Fonnte.`,
        type: result?.skipped ? 'info' : 'success'
      });
    } catch (error) {
      showFeedback({
        title: 'Gagal Kirim WhatsApp',
        message: error.message,
        type: 'error'
      });
    } finally {
      setSyncingWa(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifikasi.length === 0) {
      return;
    }

    try {
      await markAllNotifikasiRead();
      await loadNotifikasi();
      window.dispatchEvent(new Event('apar-notification-read'));
      showFeedback({
        title: 'Berhasil',
        message: 'Semua pesan notifikasi sudah ditandai dibaca.',
        type: 'success'
      });
    } catch (error) {
      showFeedback({
        title: 'Gagal',
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleDelete = async (item) => {
    const yakin = await showConfirm({
      title: 'Hapus Notifikasi?',
      message: 'Notifikasi yang dihapus tidak akan tampil lagi untuk akun ini.',
      confirmLabel: 'Hapus'
    });

    if (!yakin) {
      return;
    }

    try {
      await deleteNotifikasi(item.id_notifikasi);
      await loadNotifikasi();
      window.dispatchEvent(new Event('apar-notification-read'));
      showFeedback({
        title: 'Berhasil',
        message: 'Notifikasi berhasil dihapus.',
        type: 'success'
      });
    } catch (error) {
      showFeedback({
        title: 'Gagal Menghapus',
        message: error.message,
        type: 'error'
      });
    }
  };

  const isRead = (item) => Number(item.dibaca) === 1;

  const totalNotifikasi = notifikasi.length;
  const totalBelumDibaca = notifikasi.filter((item) => !isRead(item)).length;
  const totalKedaluwarsa = notifikasi.filter(
    (item) => item.jenis_notifikasi === 'kedaluwarsa_apar'
  ).length;
  const prioritasTinggi = notifikasi.filter(
    (item) => item.tingkat === 'danger'
  ).length;

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description="Lihat daftar peringatan dan informasi inspeksi APAR yang perlu dipantau."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Status Fonnte WA Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-[#f0e8e4]">
          <MessageSquare size={18} className={waStatus?.ready ? "text-[#008f55]" : "text-[#e95345]"} />
          <span className="text-xs font-semibold text-[#6f625f]">
            Status Fonnte:
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              waStatus?.ready
                ? 'bg-[#e7f8ef] text-[#008f55]'
                : 'bg-[#fee9e6] text-[#e95345]'
            }`}
          >
            {waStatus?.ready ? 'Terhubung (Ready)' : waStatus?.status || 'Belum Terhubung'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncWaReminders}
            disabled={syncingWa}
            className="inline-flex items-center gap-2 rounded-xl bg-[#008f55] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#007546] disabled:cursor-not-allowed disabled:bg-[#d8cfcb]"
          >
            <RefreshCw size={16} className={syncingWa ? 'animate-spin' : ''} />
            {syncingWa ? 'Mengirim...' : 'Kirim Pengingat WA'}
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={totalBelumDibaca === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e95345] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:bg-[#d8cfcb] disabled:text-white"
          >
            <CheckCheck size={18} />
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Notifikasi"
          value={totalNotifikasi}
          description="+ Peringatan tercatat"
          icon={Bell}
        />

        <StatCard
          title="Belum Dibaca"
          value={totalBelumDibaca}
          description={totalBelumDibaca === 0 ? 'Semua sudah dibaca' : '- Pesan baru'}
          icon={CheckCheck}
          iconBg="bg-[#e7f8ef]"
          iconColor="text-[#00a862]"
        />

        <StatCard
          title="Akan Kedaluwarsa"
          value={totalKedaluwarsa}
          description="- Perlu tindak lanjut"
          icon={AlertTriangle}
          iconBg="bg-[#fff3d8]"
          iconColor="text-[#f5a400]"
          trendColor="text-[#e95345]"
        />

        <StatCard
          title="Prioritas Tinggi"
          value={prioritasTinggi}
          description="- Harus segera ditangani"
          icon={ClipboardCheck}
          iconBg="bg-[#eeecff]"
          iconColor="text-[#8a7cf6]"
          trendColor="text-[#e95345]"
        />
      </div>

      <DataTableCard
        title="Daftar Notifikasi"
        description="Semua peringatan inspeksi dan APAR yang akan kedaluwarsa."
        columns={[
          'ID',
          'Jenis',
          'Kode APAR',
          'Lokasi',
          'Tanggal',
          'Status',
          'Pesan',
          'Dibaca',
          'Aksi'
        ]}
        data={notifikasi}
        emptyText={
          loading ? 'Loading data notifikasi...' : 'Belum ada data notifikasi'
        }
        renderRow={(item) => (
          <tr
            key={item.id_notifikasi}
            className={`border-b border-[#f0e8e4] ${
              isRead(item) ? 'bg-white' : 'bg-[#fffaf8]'
            }`}
          >
            <td className="px-3 py-4 font-bold text-[#151211]">
              #{item.id_notifikasi}
            </td>
            <td className="px-3 py-4">
              <span className="rounded-full bg-[#f5f0ee] px-3 py-1 text-xs font-bold text-[#6f625f]">
                {getNotificationTypeLabel(item)}
              </span>
            </td>
            <td className="px-3 py-4 font-bold text-[#151211]">
              {item.kode_apar || '-'}
            </td>
            <td className="px-3 py-4 text-[#6f625f]">{item.lokasi || '-'}</td>
            <td className="px-3 py-4 text-[#6f625f]">
              {formatDate(item.tanggal_kadaluwarsa || item.tanggal_inspeksi)}
            </td>
            <td className="px-3 py-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getBadgeClass(item)}`}
              >
                {getStatusText(item)}
              </span>
            </td>
            <td className="px-3 py-4 text-[#6f625f]">
              {item.pesan || item.catatan || '-'}
            </td>
            <td className="px-3 py-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isRead(item)
                    ? 'bg-[#f5f0ee] text-[#6f625f]'
                    : 'bg-[#fee9e6] text-[#e95345]'
                }`}
              >
                {isRead(item) ? 'Dibaca' : 'Baru'}
              </span>
            </td>
            <td className="px-3 py-4">
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#f5f0ee] px-3 py-1.5 text-xs font-bold text-[#6f625f] transition hover:bg-[#fee9e6] hover:text-[#e95345]"
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
