'use client';

import { useEffect, useState } from 'react';
import { X, Flame, FileText } from 'lucide-react';

const emptyForm = {
  nama_bahan: '',
  deskripsi: ''
};

const getInitialForm = (initialData) => {
  if (!initialData) {
    return emptyForm;
  }
  return {
    nama_bahan: initialData.nama_bahan || '',
    deskripsi: initialData.deskripsi || ''
  };
};

export default function JenisBahanModal({
  isOpen,
  onClose,
  onSubmit,
  loadingSubmit = false,
  initialData = null
}) {
  const [form, setForm] = useState(() => getInitialForm(initialData));

  const resetForm = () => {
    setForm(getInitialForm(null));
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      setForm(getInitialForm(initialData));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_bahan) {
      alert('Nama bahan wajib diisi');
      return;
    }

    await onSubmit(form);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1f1b1a]">
              {initialData ? 'Edit Jenis Bahan APAR' : 'Tambah Jenis Bahan APAR'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              {initialData
                ? 'Perbarui data master jenis bahan media pemadam APAR.'
                : 'Tambahkan data master jenis bahan APAR baru.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-[#6f625f] transition hover:bg-[#f5eeee] hover:text-[#e95345]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                Nama Bahan Media APAR <span className="text-[#e95345]">*</span>
              </label>

              <div className="relative">
                <Flame
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                />
                <input
                  type="text"
                  name="nama_bahan"
                  value={form.nama_bahan}
                  onChange={handleChange}
                  placeholder="Contoh: Powder (Serbuk Kimia), CO2, Foam, Clean Agent"
                  className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                Deskripsi / Catatan
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-3 text-[#b5a7a2]"
                />
                <textarea
                  name="deskripsi"
                  rows={3}
                  value={form.deskripsi}
                  onChange={handleChange}
                  placeholder="Keterangan singkat jenis bahan APAR (opsional)"
                  className="w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 py-2.5 text-sm text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-3 text-sm font-bold text-[#1f1b1a] transition hover:bg-[#fbf7f5]"
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
                : initialData
                  ? 'Simpan Perubahan'
                  : 'Tambah Jenis Bahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
