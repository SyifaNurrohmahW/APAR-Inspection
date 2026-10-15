'use client';

import { useState, useEffect } from 'react';
import { X, Ship, Hash, FileText, CheckCircle } from 'lucide-react';
import { showFeedback } from '@/utils/feedback';

export default function KapalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loadingSubmit = false
}) {
  const [formData, setFormData] = useState({
    nama_kapal: '',
    kode_kapal: '',
    keterangan: '',
    status: 'aktif'
  });

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_kapal: initialData.nama_kapal || '',
        kode_kapal: initialData.kode_kapal || '',
        keterangan: initialData.keterangan || '',
        status: initialData.status || 'aktif'
      });
    } else {
      setFormData({
        nama_kapal: '',
        kode_kapal: '',
        keterangan: '',
        status: 'aktif'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_kapal.trim() || !formData.kode_kapal.trim()) {
      showFeedback({
        title: 'Form Belum Lengkap',
        message: 'Nama kapal dan kode kapal wajib diisi',
        type: 'warning'
      });
      return;
    }

    try {
      await onSubmit({
        nama_kapal: formData.nama_kapal.trim(),
        kode_kapal: formData.kode_kapal.trim().toUpperCase(),
        keterangan: formData.keterangan ? formData.keterangan.trim() : null,
        status: formData.status
      });
    } catch {
      // Handled in caller
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#f0e8e4] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1f1b1a]">
              {isEditMode ? 'Edit Data Kapal' : 'Tambah Kapal Baru'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              {isEditMode
                ? 'Perbarui informasi kapal inspeksi operasional.'
                : 'Daftarkan kapal baru untuk sistem inspeksi APAR.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfdb] bg-[#fffaf8] text-[#6f625f] transition hover:border-[#e95345] hover:text-[#e95345]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
              Nama Kapal <span className="text-[#e95345]">*</span>
            </label>
            <div className="relative">
              <Ship size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]" />
              <input
                type="text"
                name="nama_kapal"
                value={formData.nama_kapal}
                onChange={handleChange}
                placeholder="Contoh: KM Kelud, KM Sinabung"
                required
                className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
              Kode Kapal <span className="text-[#e95345]">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]" />
              <input
                type="text"
                name="kode_kapal"
                value={formData.kode_kapal}
                onChange={handleChange}
                placeholder="Contoh: KPL-001, KLD-01"
                required
                className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black uppercase outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
              Status Operasional <span className="text-[#e95345]">*</span>
            </label>
            <div className="relative">
              <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]" />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-[#eadfdb] bg-white pl-11 pr-4 text-black outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              >
                <option value="aktif">Aktif (Dapat Diinspeksi)</option>
                <option value="nonaktif">Nonaktif (Dalam Perbaikan/Docking)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
              Keterangan (Opsional)
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-4 top-3 text-[#b5a7a2]" />
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                placeholder="Catatan tambahan tentang rute, pelabuhan pangkalan, dll."
                className="w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 pt-2.5 text-black outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#f0e8e4] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-2.5 text-sm font-bold text-[#1f1b1a] transition hover:bg-[#fbf7f5]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="rounded-xl bg-[#e95345] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9473a] disabled:opacity-70"
            >
              {loadingSubmit ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kapal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}