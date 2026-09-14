'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  FireExtinguisher,
  Flame,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User
} from 'lucide-react';

import { registerUser } from '@/services/authService';
import { isAuthenticated } from '@/utils/authState';
import { showFeedback } from '@/utils/feedback';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    konfirmasi_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!form.nama || !form.email || !form.no_hp || !form.password || !form.konfirmasi_password) {
      setErrorMessage('Semua bidang form wajib diisi');
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage('Password minimal 6 karakter');
      return;
    }

    if (form.password !== form.konfirmasi_password) {
      setErrorMessage('Password dan konfirmasi password tidak cocok');
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser(form);

      await showFeedback({
        title: 'Registrasi Berhasil!',
        message: result.message || 'Akun Anda berhasil dibuat. Silakan login.',
        type: 'success'
      });

      router.push('/login');
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-4 text-sm font-medium text-[#1f1b1a] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf8] p-4 sm:p-6">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#fee9e6] blur-3xl animate-soft-pulse" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#ffd7ad] blur-3xl animate-soft-pulse" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#eadfdb] bg-white shadow-[0_18px_55px_rgba(80,60,55,0.14)] transition duration-300 hover:shadow-[0_22px_70px_rgba(80,60,55,0.18)] md:grid-cols-2 animate-fade-in my-6">
        {/* Banner Kiri */}
        <div className="relative hidden min-h-[680px] overflow-hidden bg-gradient-to-br from-[#e95345] to-[#ff8a7a] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute left-10 top-16 h-32 w-32 rounded-full bg-white/15 blur-2xl animate-soft-pulse" />
          <div className="absolute bottom-20 right-8 h-44 w-44 rounded-full bg-[#ffd7ad]/30 blur-3xl animate-soft-pulse" />

          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <ShieldCheck size={17} />
              Registrasi Akun Teknisi
            </div>

            <div className="animate-float rounded-[26px] border border-white/25 bg-white/15 p-7 shadow-[0_20px_45px_rgba(97,24,18,0.22)] backdrop-blur">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-[#e95345]">
                <FireExtinguisher size={46} />
              </div>

              <h1 className="text-3xl font-black leading-tight">
                Bergabung dengan APAR System
              </h1>
              <p className="mt-4 text-sm font-medium leading-7 text-white/85">
                Daftarkan akun petugas lapangan / teknisi Anda untuk memulai pemantauan & inspeksi APAR secara realtime.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#e95345]">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Role Teknisi Lapangan</p>
              <p className="mt-1 text-xs text-white/75">
                Input inspeksi, update pengisian ulang, dan lihat riwayat status APAR.
              </p>
            </div>
          </div>
        </div>

        {/* Form Kanan */}
        <div className="flex min-h-[680px] flex-col justify-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fee9e6] text-[#e95345] md:hidden">
                <FireExtinguisher size={26} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e95345]">
                Pendaftaran Akun
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#1f1b1a]">
                Buat Akun Baru
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6f625f]">
                Lengkapi formulir di bawah ini untuk daftar sebagai petugas teknisi.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-[#ffd2cc] bg-[#fff1ef] p-4 text-sm font-semibold text-[#c93629]">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-xs font-bold text-[#1f1b1a]">
                Nama Lengkap <span className="text-[#e95345]">*</span>
                <div className="relative mt-1.5">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className={inputClass}
                    required
                  />
                </div>
              </label>

              <label className="block text-xs font-bold text-[#1f1b1a]">
                Email <span className="text-[#e95345]">*</span>
                <div className="relative mt-1.5">
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
                    className={inputClass}
                    required
                  />
                </div>
              </label>

              <label className="block text-xs font-bold text-[#1f1b1a]">
                Nomor HP / WhatsApp <span className="text-[#e95345]">*</span>
                <div className="relative mt-1.5">
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
                    className={inputClass}
                    required
                  />
                </div>
              </label>

              <label className="block text-xs font-bold text-[#1f1b1a]">
                Password <span className="text-[#e95345]">*</span>
                <div className="relative mt-1.5">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label className="block text-xs font-bold text-[#1f1b1a]">
                Konfirmasi Password <span className="text-[#e95345]">*</span>
                <div className="relative mt-1.5">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="konfirmasi_password"
                    value={form.konfirmasi_password}
                    onChange={handleChange}
                    placeholder="Ulangi password di atas"
                    className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#e95345] text-sm font-black text-white shadow-[0_10px_20px_rgba(233,83,69,0.25)] transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  'Memproses...'
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Daftar Sekarang
                  </>
                )}
              </button>

              <div className="mt-6 text-center text-sm font-medium text-[#6f625f]">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-bold text-[#e95345] transition hover:underline"
                >
                  Login di sini
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
