'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { getAllDataApar } from '@/services/dataAparService';
import { showFeedback } from '@/utils/feedback';

const emptyForm = {
  id_apar: '',
  tanggal: '',
  tanggal_kadaluwarsa: '',
  nama_vendor: '',
  biaya: '',
  catatan: ''
};

const formatDateValue = (value) => {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 10);
};

const getInitialForm = (initialData, preselectedAparId = '') => {
  if (!initialData) {
    return {
      ...emptyForm,
      id_apar: preselectedAparId ? String(preselectedAparId) : ''
    };
  }

  return {
    id_apar: String(initialData.id_apar || preselectedAparId || ''),
    tanggal: formatDateValue(initialData.tanggal),
    tanggal_kadaluwarsa: formatDateValue(initialData.tanggal_kadaluwarsa),
    nama_vendor: initialData.nama_vendor || '',
    biaya: String(initialData.biaya || ''),
    catatan: initialData.catatan || ''
  };
};

export default function PengisianUlangModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  preselectedAparId = '',
  loadingSubmit = false
}) {
  const [formData, setFormData] = useState(() =>
    getInitialForm(initialData, preselectedAparId)
  );
  const [aparOptions, setAparOptions] = useState([]);
  const [loadingApar, setLoadingApar] = useState(true);
  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadApar = async () => {
      try {
        setLoadingApar(true);
        const data = await getAllDataApar();

        if (isMounted) {
          setAparOptions(data);
        }
      } catch (error) {
        if (isMounted) {
          showFeedback({
            title: 'Gagal Memuat APAR',
            message: error.message,
            type: 'error'
          });
        }
      } finally {
        if (isMounted) {
          setLoadingApar(false);
        }
      }
    };

    loadApar();

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
    setFormData(getInitialForm(initialData, preselectedAparId));
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.id_apar ||
      !formData.tanggal ||
      !formData.tanggal_kadaluwarsa ||
      !formData.nama_vendor ||
      !formData.biaya
    ) {
      showFeedback({
        title: 'Form Belum Lengkap',
        message: 'APAR, tanggal, tanggal kadaluwarsa, vendor, dan biaya wajib diisi.',
        type: 'warning'
      });
      return;
    }

    try {
      await onSubmit({
        ...formData,
        biaya: Number(formData.biaya)
      });
    } catch {
      // Error alert is handled by the page submit handler.
    }
  };

  const inputClass =
    'mt-2 h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-4 text-sm text-[#151211] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]';
  const labelClass = 'text-sm font-bold text-[#151211]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#eadfdb] bg-white shadow-[0_18px_50px_rgba(31,27,26,0.18)]">
        <div className="flex items-start justify-between border-b border-[#eadfdb] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#151211]">
              {isEditMode ? 'Edit Pengisian Ulang' : 'Tambah Pengisian Ulang'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              Catat refill APAR beserta vendor, biaya, dan tanggal kadaluwarsa baru.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfdb] bg-[#fffaf8] text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
            aria-label="Tutup modal pengisian ulang"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className={labelClass}>
              APAR
              <select
                name="id_apar"
                value={formData.id_apar}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  {loadingApar ? 'Loading APAR...' : 'Pilih APAR'}
                </option>
                {aparOptions.map((item) => (
                  <option key={item.id_apar} value={item.id_apar}>
                    {item.kode_apar} - {item.lokasi || 'Tanpa lokasi'}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Tanggal Pengisian
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Tanggal Kadaluwarsa
              <input
                type="date"
                name="tanggal_kadaluwarsa"
                value={formData.tanggal_kadaluwarsa}
                onChange={handleChange}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Vendor
              <input
                type="text"
                name="nama_vendor"
                value={formData.nama_vendor}
                onChange={handleChange}
                placeholder="Nama vendor"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Biaya
              <input
                type="number"
                name="biaya"
                value={formData.biaya}
                onChange={handleChange}
                placeholder="e.g. 150000"
                min="0"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Catatan
              <input
                type="text"
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                placeholder="Opsional"
                className={inputClass}
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
                  : 'Tambah Pengisian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
