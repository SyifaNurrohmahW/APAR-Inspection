'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getAllDataApar } from '@/services/dataAparService';

const emptyForm = {
  id_apar: '',
  tanggal_inspeksi: '',
  kondisi_tekanan: '',
  hasil: '',
  catatan: ''
};

const getInitialForm = (initialData) => {
  if (!initialData) {
    return emptyForm;
  }

  return {
    id_apar: String(initialData.id_apar || ''),
    tanggal_inspeksi: initialData.tanggal_inspeksi
      ? String(initialData.tanggal_inspeksi).slice(0, 16)
      : '',
    kondisi_tekanan: initialData.kondisi_tekanan || '',
    hasil: initialData.hasil || '',
    catatan: initialData.catatan || ''
  };
};

export default function InspeksiModal({
  isOpen,
  onClose,
  onSubmit,
  loadingSubmit = false,
  initialData = null
}) {
  const [aparList, setAparList] = useState([]);

  const [form, setForm] = useState(() => getInitialForm(initialData));

  // Sesuaikan pilihan ini dengan ENUM di database kamu
  const kondisiTekananOptions = [
    'Normal',
    'Rendah',
    'Tinggi'
  ];

  // Sesuaikan pilihan ini dengan ENUM di database kamu
  const hasilOptions = [
    'Baik',
    'Perlu Perhatian',
    'Tidak Layak'
  ];

  const resetForm = () => {
    setForm(getInitialForm(null));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadApar = async () => {
      try {
        const data = await getAllDataApar();

        if (isMounted) {
          setAparList(data);
        }
      } catch (error) {
        alert(error.message);
      }
    };

    loadApar();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm(getInitialForm(initialData));
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
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

    if (
      !form.id_apar ||
      !form.tanggal_inspeksi ||
      !form.kondisi_tekanan ||
      !form.hasil
    ) {
      alert('Data wajib diisi: APAR, tanggal inspeksi, kondisi tekanan, dan hasil');
      return;
    }

    await onSubmit({
      id_apar: form.id_apar,
      tanggal_inspeksi: form.tanggal_inspeksi,
      kondisi_tekanan: form.kondisi_tekanan,
      hasil: form.hasil,
      catatan: form.catatan
    });

    resetForm();
  };

  if (!isOpen) return null;

  const inputClass =
    'h-11 w-full rounded-xl border border-[#eadfdb] bg-white px-4 text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]';
  const labelClass = 'mb-2 block text-sm font-bold text-[#151211]';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 text-[#151211] shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1f1b1a]">
              {initialData ? 'Edit Data Inspeksi' : 'Tambah Data Inspeksi'}
            </h2>
            <p className="mt-2 text-sm text-[#6f625f]">
              Isi detail inspeksi APAR sesuai hasil pengecekan lapangan.
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
              <label className={labelClass}>
                APAR
              </label>

              <select
                name="id_apar"
                value={form.id_apar}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih APAR</option>
                {aparList.map((item) => (
                  <option key={item.id_apar} value={item.id_apar}>
                    {item.kode_apar}
                    {item.lokasi ? ` - ${item.lokasi}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Tanggal Inspeksi
              </label>

              <input
                type="datetime-local"
                name="tanggal_inspeksi"
                value={form.tanggal_inspeksi}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Kondisi Tekanan
                </label>

                <select
                  name="kondisi_tekanan"
                  value={form.kondisi_tekanan}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Pilih kondisi</option>
                  {kondisiTekananOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Hasil
                </label>

                <select
                  name="hasil"
                  value={form.hasil}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Pilih hasil</option>
                  {hasilOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Catatan
              </label>

              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                placeholder="Contoh: Tekanan aman, segel masih utuh"
                rows={4}
                className="w-full resize-none rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-semibold text-[#151211] outline-none transition placeholder:text-[#8f817d] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#eadfdb] bg-white px-5 py-3 text-sm font-bold text-[#1f1b1a] transition hover:bg-[#fbf7f5]"
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
                : initialData
                  ? 'Simpan Perubahan'
                  : 'Tambah Inspeksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
