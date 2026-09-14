'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { showFeedback } from '@/utils/feedback';

export default function LokasiModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loadingSubmit = false
}) {
  const [formData, setFormData] = useState(() => ({
    lokasi: initialData?.lokasi || ''
  }));
  const isEditMode = Boolean(initialData);

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
    setFormData({
      lokasi: initialData?.lokasi || ''
    });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.lokasi.trim()) {
      showFeedback({
        title: 'Form Belum Lengkap',
        message: 'Semua field wajib diisi',
        type: 'warning'
      });
      return;
    }

    try {
      await onSubmit({
        lokasi: formData.lokasi.trim()
      });
    } catch {
      // Error alert is handled by the page submit handler.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl border border-[#eadfdb] bg-white shadow-[0_18px_50px_rgba(31,27,26,0.18)]">
        <div className="flex items-start justify-between border-b border-[#eadfdb] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#151211]">
              {isEditMode ? 'Edit Data Lokasi' : 'Tambah Data Lokasi'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              {isEditMode
                ? 'Perbarui nama lokasi area penempatan APAR.'
                : 'Isi nama lokasi baru untuk area penempatan APAR.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfdb] bg-[#fffaf8] text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
            aria-label="Tutup modal tambah data lokasi"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <label className="text-sm font-bold text-[#151211]">
            Lokasi
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              placeholder="e.g. Gedung A Lantai 1"
              className="mt-2 h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-4 text-sm text-[#151211] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
            />
          </label>

          <div className="mt-7 flex justify-end gap-3 border-t border-[#eadfdb] pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-3 text-sm font-bold text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
            >
              Cancel
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
                  : 'Tambah Lokasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
