'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardCard from '@/components/dashboardCard';
import {
  FireExtinguisher,
  ClipboardCheck,
  RefreshCcw,
  MapPin,
  Bell,
  AlertCircle,
  Download
} from 'lucide-react';

import { getAllDataApar } from '@/services/dataAparService';
import { getAllInspeksi } from '@/services/inspeksiService';
import { getAllLokasi } from '@/services/lokasiService';
import { getAllNotifikasi } from '@/services/notifikasiService';
import { getAllPengisianUlang } from '@/services/pengisianUlangService';
import { showFeedback } from '@/utils/feedback';
import { exportToExcel } from '@/utils/excelExport';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
};

const formatTime = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDaysUntil = (value) => {
  if (!value) {
    return null;
  }

  const today = new Date();
  const targetDate = new Date(value);

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
};

const getPercent = (value, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

const normalize = (value) => String(value || '').trim().toLowerCase();

export default function DashboardPage() {
  const [dataApar, setDataApar] = useState([]);
  const [lokasi, setLokasi] = useState([]);
  const [inspeksi, setInspeksi] = useState([]);
  const [pengisianUlang, setPengisianUlang] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        dataAparResult,
        lokasiResult,
        inspeksiResult,
        pengisianResult,
        notifikasiResult
      ] = await Promise.all([
        getAllDataApar(),
        getAllLokasi(),
        getAllInspeksi(),
        getAllPengisianUlang(),
        getAllNotifikasi()
      ]);

      setDataApar(dataAparResult);
      setLokasi(lokasiResult);
      setInspeksi(inspeksiResult);
      setPengisianUlang(pengisianResult);
      setNotifikasi(notifikasiResult);
    } catch (error) {
      showFeedback({
        title: 'Gagal Memuat Dashboard',
        message: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const totalApar = dataApar.length;
  const totalLokasi = lokasi.length;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const inspeksiBulanIni = inspeksi.filter((item) => {
    if (!item.tanggal_inspeksi) {
      return false;
    }

    const tanggal = new Date(item.tanggal_inspeksi);

    return tanggal.getMonth() === thisMonth && tanggal.getFullYear() === thisYear;
  }).length;
  const refillPerluTindakLanjut = notifikasi.filter(
    (item) => item.jenis_notifikasi === 'kedaluwarsa_apar'
  ).length;

  const aparBaik = dataApar.filter(
    (item) => normalize(item.status) === 'baik'
  ).length;
  const aparPerluCek = dataApar.filter(
    (item) => normalize(item.status) === 'akan kedaluwarsa'
  ).length;
  const aparBermasalah = dataApar.filter(
    (item) => normalize(item.status) === 'kedaluwarsa'
  ).length;

  const percentBaik = getPercent(aparBaik, totalApar);
  const percentPerluCek = getPercent(aparPerluCek, totalApar);
  const percentBermasalah = getPercent(aparBermasalah, totalApar);

  const inspeksiPerLokasi = useMemo(() => {
    const grouped = new Map();

    inspeksi.forEach((item) => {
      const label = item.lokasi || 'Tanpa Lokasi';
      grouped.set(label, (grouped.get(label) || 0) + 1);
    });

    const maxValue = Math.max(...grouped.values(), 1);

    return Array.from(grouped.entries())
      .map(([label, count]) => ({
        label,
        count,
        value: `${getPercent(count, maxValue)}%`
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [inspeksi]);

  const inspeksiTerbaru = [...inspeksi]
    .sort((a, b) => new Date(b.tanggal_inspeksi) - new Date(a.tanggal_inspeksi))
    .slice(0, 5);

  const notifikasiTerbaru = [...notifikasi]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 4);

  const jadwalPengisian = notifikasi
    .filter((item) => item.jenis_notifikasi === 'kedaluwarsa_apar')
    .map((item) => ({
      kode: item.kode_apar || '-',
      lokasi: item.lokasi || '-',
      tanggal: item.tanggal_kadaluwarsa,
      sisaHari: getDaysUntil(item.tanggal_kadaluwarsa)
    }))
    .sort((a, b) => (a.sisaHari ?? 9999) - (b.sisaHari ?? 9999))
    .slice(0, 5);

  const fallbackPengisian = [...pengisianUlang]
    .sort(
      (a, b) =>
        new Date(a.tanggal_kadaluwarsa || 0) - new Date(b.tanggal_kadaluwarsa || 0)
    )
    .slice(0, 5);

  const stats = [
    {
      title: 'Total APAR',
      value: totalApar,
      desc: 'Unit terdaftar',
      icon: FireExtinguisher
    },
    {
      title: 'Total Lokasi',
      value: totalLokasi,
      desc: 'Area terpantau',
      icon: MapPin
    },
    {
      title: 'Inspeksi Bulan Ini',
      value: inspeksiBulanIni,
      desc: 'Sudah dilakukan',
      icon: ClipboardCheck
    },
    {
      title: 'Pengisian Ulang',
      value: refillPerluTindakLanjut,
      desc: 'Perlu ditindaklanjuti',
      icon: RefreshCcw
    }
  ];

  const handleExportSummaryReport = () => {
    const summaryData = dataApar.map((apar, index) => {
      const inspeksiApar = inspeksi.filter((i) => String(i.id_apar) === String(apar.id_apar));
      const lastInspeksi = inspeksiApar.length ? inspeksiApar[0] : null;

      return {
        No: index + 1,
        'Kode APAR': apar.kode_apar,
        Lokasi: apar.lokasi || '-',
        Jenis: apar.jenis || '-',
        'Berat (kg)': apar.berat || '-',
        Status: apar.status || '-',
        'Inspeksi Terakhir': lastInspeksi ? formatDate(lastInspeksi.tanggal_inspeksi) : '-',
        'Hasil Inspeksi': lastInspeksi ? lastInspeksi.hasil : '-'
      };
    });

    exportToExcel(summaryData, 'Laporan_Ringkasan_APAR');
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c2aaa3]">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1f1b1a]">
            Sistem Manajemen Pemeliharaan APAR
          </h1>
          <p className="mt-2 text-sm text-[#7f716d]">
            {loading
              ? 'Memuat data dashboard...'
              : 'Pantau data APAR, inspeksi, pengisian ulang, dan notifikasi dalam satu halaman.'}
          </p>
        </div>

        <button
          onClick={handleExportSummaryReport}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadfdb] bg-white px-4 py-2.5 text-sm font-bold text-[#1f1b1a] shadow-sm transition hover:bg-[#fff5f3] hover:text-[#e95345] self-start sm:self-auto"
        >
          <Download size={18} />
          Export Excel Laporan
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[22px] border border-[#eadfdb] bg-white p-5 shadow-[0_4px_12px_rgba(80,60,55,0.08)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fee9e6] text-[#e95345]">
                  <Icon size={22} />
                </div>

                <span className="rounded-full bg-[#f5eeeb] px-3 py-1 text-xs font-bold text-[#9b8d89]">
                  Database
                </span>
              </div>

              <p className="text-sm font-semibold text-[#7f716d]">
                {item.title}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#1f1b1a]">
                {loading ? '-' : item.value}
              </h2>
              <p className="mt-1 text-sm text-[#a0928e]">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardCard
          title="Kondisi APAR"
          subtitle="Ringkasan status kelayakan unit"
        >
          <div className="flex flex-col items-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-[#08a866]">
              <div className="absolute h-32 w-32 rounded-full border-[14px] border-[#049aa0]" />
              <div className="absolute h-20 w-20 rounded-full border-[10px] border-[#e95345]" />
              <div className="z-10 text-center">
                <p className="text-3xl font-bold text-[#1f1b1a]">
                  {percentBaik}%
                </p>
                <p className="text-xs text-[#7f716d]">Baik</p>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3">
              {[
                ['Baik', percentBaik, aparBaik, '#08a866'],
                ['Akan Kedaluwarsa', percentPerluCek, aparPerluCek, '#049aa0'],
                ['Kedaluwarsa', percentBermasalah, aparBermasalah, '#e95345']
              ].map(([label, percent, count, color]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-[#7f716d]">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>
                  <strong>
                    {percent}% ({count})
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Inspeksi per Lokasi"
          subtitle="Aktivitas inspeksi berdasarkan area"
        >
          <div className="space-y-5">
            {inspeksiPerLokasi.length === 0 ? (
              <p className="text-sm text-[#7f716d]">Belum ada data inspeksi.</p>
            ) : (
              inspeksiPerLokasi.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#7f716d]">{item.label}</span>
                    <span className="font-bold text-[#1f1b1a]">
                      {item.count} inspeksi
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-[#f4ebe8]">
                    <div
                      className="h-3 rounded-full bg-[#e95345]"
                      style={{ width: item.value }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Notifikasi Terbaru"
          subtitle="Peringatan dan aktivitas terbaru"
        >
          <div className="space-y-5">
            {notifikasiTerbaru.length === 0 ? (
              <p className="text-sm text-[#7f716d]">Belum ada notifikasi.</p>
            ) : (
              notifikasiTerbaru.map((item) => (
                <div key={item.id_notifikasi} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fee9e6] text-[#e95345]">
                    {item.tingkat === 'danger' ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1f1b1a]">
                      {item.pesan || item.catatan || 'Notifikasi APAR'}
                    </p>
                    <p className="mt-1 text-xs text-[#7f716d]">
                      {item.kode_apar || '-'} - {item.lokasi || '-'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardCard
          title="Inspeksi Terbaru"
          subtitle="Data inspeksi yang baru dilakukan"
        >
          <div className="overflow-hidden rounded-2xl border border-[#eadfdb]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbf7f5] text-[#7f716d]">
                <tr>
                  <th className="px-4 py-3">Kode APAR</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Hasil</th>
                  <th className="px-4 py-3">Jam</th>
                </tr>
              </thead>

              <tbody>
                {inspeksiTerbaru.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-[#7f716d]"
                    >
                      Belum ada data inspeksi.
                    </td>
                  </tr>
                ) : (
                  inspeksiTerbaru.map((item) => (
                    <tr
                      key={item.id_inspeksi}
                      className="border-t border-[#eadfdb]"
                    >
                      <td className="px-4 py-4 font-bold text-[#1f1b1a]">
                        {item.kode_apar || '-'}
                      </td>
                      <td className="px-4 py-4 text-[#7f716d]">
                        {item.lokasi || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#fee9e6] px-3 py-1 text-xs font-bold text-[#e95345]">
                          {item.hasil || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#7f716d]">
                        {formatTime(item.tanggal_inspeksi)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Jadwal Pengisian Ulang"
          subtitle="APAR yang perlu pengisian ulang"
        >
          <div className="space-y-4">
            {jadwalPengisian.length === 0 && fallbackPengisian.length === 0 ? (
              <p className="text-sm text-[#7f716d]">
                Belum ada jadwal pengisian ulang.
              </p>
            ) : jadwalPengisian.length > 0 ? (
              jadwalPengisian.map((item) => (
                <div
                  key={`${item.kode}-${item.tanggal}`}
                  className="flex items-center justify-between rounded-2xl bg-[#fbf7f5] p-4"
                >
                  <div>
                    <p className="font-bold text-[#1f1b1a]">{item.kode}</p>
                    <p className="mt-1 text-sm text-[#7f716d]">{item.lokasi}</p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#e95345]">
                    {formatDate(item.tanggal)}
                  </span>
                </div>
              ))
            ) : (
              fallbackPengisian.map((item) => (
                <div
                  key={item.id_return}
                  className="flex items-center justify-between rounded-2xl bg-[#fbf7f5] p-4"
                >
                  <div>
                    <p className="font-bold text-[#1f1b1a]">
                      {item.kode_apar || '-'}
                    </p>
                    <p className="mt-1 text-sm text-[#7f716d]">
                      {item.lokasi || '-'}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#e95345]">
                    {formatDate(item.tanggal_kadaluwarsa)}
                  </span>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
