'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { getAllLokasi } from '@/services/lokasiService';
import { getAllJenisBahan } from '@/services/jenisBahanService';
import { showFeedback } from '@/utils/feedback';

const initialForm = {
  kode_apar: '',
  id_lokasi: '',
  jenis: '',
  berat: '',
  status: '',
  tanggal: ''
};

const formatDateValue = (value) => {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 10);
};

const getInitialForm = (initialData) => {
  if (!initialData) {
    return initialForm;
  }

  return {
    kode_apar: initialData.kode_apar || '',
    id_lokasi: String(initialData.id_lokasi || ''),
    jenis: initialData.jenis || '',
    berat: String(initialData.berat || ''),
    status: initialData.status || '',
    tanggal: formatDateValue(initialData.tanggal)
  };
};

const defaultJenisOptions = ['Dry Chemical Powder', 'CO2', 'Foam', 'Water', 'Clean Agent'];
const statusOptions = ['Baik', 'Akan Kedaluwarsa', 'Kedaluwarsa'];

export default function DataAparModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loadingSubmit = false
}) {
  const [formData, setFormData] = useState(() => getInitialForm(initialData));
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [jenisBahanOptions, setJenisBahanOptions] = useState([]);
  const [loadingLokasi, setLoadingLokasi] = useState(true);
  const [loadingJenis, setLoadingJenis] = useState(true);
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadDataOptions = async () => {
      setLoadingLokasi(true);
      setLoadingJenis(true);

      try {
        const [lokasiRes, jenisRes] = await Promise.allSettled([
          getAllLokasi(),
          getAllJenisBahan()
        ]);

        if (isMounted) {
          if (lokasiRes.status === 'fulfilled') {
            setLokasiOptions(lokasiRes.value || []);
          }
          if (jenisRes.status === 'fulfilled' && Array.isArray(jenisRes.value)) {
            setJenisBahanOptions(jenisRes.value);
          }
        }
      } catch (error) {
        if (isMounted) {
          showFeedback({
            title: 'Gagal Memuat Referensi Data',
            message: error.message,
            type: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setLoadingLokasi(false);
          setLoadingJenis(false);
        }
      }
    };

    loadDataOptions();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleClose = () => {
    setFormData(getInitialForm(initialData));
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasEmptyField = Object.values(formData).some((value) => !value);

    if (hasEmptyField) {
      showFeedback({
        title: 'Form Belum Lengkap',
        message: 'Semua field wajib diisi',
        type: 'warning'
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch {
      // Error alert is handled by the page submit handler.
    }
  };

  // Gunakan master DB jenis bahan jika tersedia. Hanya pakai default jika DB master belum memiliki data.
  const masterJenisNames = jenisBahanOptions.map((item) => item.nama_bahan);
  const combinedJenisOptions =
    masterJenisNames.length > 0
      ? Array.from(new Set([...masterJenisNames, formData.jenis].filter(Boolean)))
      : Array.from(new Set([...defaultJenisOptions, formData.jenis].filter(Boolean)));


  const inputClass =
    'mt-2 h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-4 text-sm text-[#151211] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]';
  const labelClass = 'text-sm font-bold text-[#151211]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#eadfdb] bg-white shadow-[0_18px_50px_rgba(31,27,26,0.18)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#eadfdb] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#151211]">
              {isEditMode ? 'Edit Data APAR' : 'Tambah Data APAR'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              {isEditMode
                ? 'Perbarui detail APAR sesuai data inventaris.'
                : 'Isi detail APAR baru sesuai data inventaris.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfdb] bg-[#fffaf8] text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
            aria-label="Tutup modal tambah data APAR"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Kode APAR <span className="text-[#e95345]">*</span>
              <input
                type="text"
                name="kode_apar"
                value={formData.kode_apar}
                onChange={handleChange}
                placeholder="e.g. AP001"
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Lokasi <span className="text-[#e95345]">*</span>
              <select
                name="id_lokasi"
                value={formData.id_lokasi}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  {loadingLokasi ? 'Loading lokasi...' : 'Pilih lokasi'}
                </option>
                {lokasiOptions.map((item) => (
                  <option key={item.id_lokasi} value={item.id_lokasi}>
                    {item.lokasi}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Jenis Bahan APAR <span className="text-[#e95345]">*</span>
              <select
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  {loadingJenis ? 'Loading master jenis bahan...' : 'Pilih jenis bahan'}
                </option>
                {combinedJenisOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Berat (Kg) <span className="text-[#e95345]">*</span>
              <input
                type="number"
                name="berat"
                value={formData.berat}
                onChange={handleChange}
                placeholder="e.g. 3"
                className={inputClass}
                required
              />
            </label>

            <label className={labelClass}>
              Status <span className="text-[#e95345]">*</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Pilih status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Tanggal Masa Berlaku <span className="text-[#e95345]">*</span>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </label>
          </div>

          <div className="mt-7 flex justify-end gap-3 border-t border-[#eadfdb] pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-3 text-sm font-bold text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="rounded-xl bg-[#e95345] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingSubmit
                ? 'Menyimpan...'
                : isEditMode
                  ? 'Simpan Perubahan'
                  : 'Tambah APAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
