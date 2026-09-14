'use client';

import { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

const emptyForm = {
  nama: '',
  email: '',
  no_hp: '',
  password: '',
  role: 'admin',
  status: 'aktif'
};

const getInitialForm = (initialData) => {
  if (!initialData) {
    return emptyForm;
  }

  return {
    nama: initialData.nama || '',
    email: initialData.email || '',
    no_hp: initialData.no_hp || '',
    password: '',
    role: String(initialData.role || 'admin').toLowerCase(),
    status: String(initialData.status || 'aktif').toLowerCase()
  };
};

export default function DataPenggunaModal({
  isOpen,
  onClose,
  onSubmit,
  loadingSubmit = false,
  initialData = null
}) {
  const [form, setForm] = useState(() => getInitialForm(initialData));

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Teknisi / Petugas Lapangan', value: 'teknisi' },
    { label: 'Superadmin', value: 'superadmin' }
  ];
  const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Nonaktif', value: 'nonaktif' }
  ];

  const resetForm = () => {
    setForm(getInitialForm(null));
  };

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

    if (!form.nama || !form.email || !form.role || !form.status) {
      alert('Data wajib diisi: nama, email, role, dan status');
      return;
    }

    if (!initialData && !form.password) {
      alert('Password wajib diisi untuk pengguna baru');
      return;
    }

    if (form.password && form.password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    const payload = {
      nama: form.nama,
      email: form.email,
      no_hp: form.no_hp,
      role: form.role,
      status: form.status
    };

    if (form.password) {
      payload.password = form.password;
    }

    await onSubmit(payload);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1f1b1a]">
              {initialData ? 'Edit Data Pengguna' : 'Tambah Data Pengguna'}
            </h2>
            <p className="mt-1 text-sm text-[#6f625f]">
              {initialData
                ? 'Perbarui data akun pengguna sistem.'
                : 'Tambahkan akun admin, teknisi, atau superadmin baru.'}
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
                Nama Lengkap <span className="text-[#e95345]">*</span>
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                />
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama pengguna"
                  className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                Email <span className="text-[#e95345]">*</span>
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contoh@email.com"
                  className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                Nomor HP / WhatsApp
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                />
                <input
                  type="text"
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  placeholder="Format WA: 6281234567890"
                  className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                />
              </div>

              <p className="mt-1 text-xs text-[#9b8d89]">
                Gunakan format 62 untuk WhatsApp, contoh: 6281234567890.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                {initialData ? 'Password Baru (Opsional)' : 'Password'} {!initialData && <span className="text-[#e95345]">*</span>}
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={initialData ? 'Kosongkan jika tidak ubah password' : 'Minimal 6 karakter'}
                  className="h-11 w-full rounded-xl border border-[#eadfdb] pl-11 pr-4 text-black outline-none transition placeholder:text-[#a99c98] focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                  Role <span className="text-[#e95345]">*</span>
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50"
                  />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#eadfdb] bg-white pl-11 pr-4 text-black transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                  >
                    {roleOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                  Status <span className="text-[#e95345]">*</span>
                </label>

                <div className="relative">
                  <CheckCircle
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                  />
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-[#eadfdb] bg-white pl-11 pr-4 text-black outline-none transition focus:border-[#e95345] focus:ring-2 focus:ring-[#f6b7af]"
                  >
                    {statusOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  : 'Tambah Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
