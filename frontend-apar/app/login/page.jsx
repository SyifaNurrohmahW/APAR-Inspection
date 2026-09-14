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
  ShieldCheck
} from 'lucide-react';

import { loginUser } from '@/services/authService';
import { isAuthenticated } from '@/utils/authState';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({
        email,
        password
      });

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('remember_me', String(rememberMe));

      router.push('/dashboard');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-4 text-sm font-medium text-[#1f1b1a] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf8] p-4">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#fee9e6] blur-3xl animate-soft-pulse" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#ffd7ad] blur-3xl animate-soft-pulse" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#eadfdb] bg-white shadow-[0_18px_55px_rgba(80,60,55,0.14)] transition duration-300 hover:shadow-[0_22px_70px_rgba(80,60,55,0.18)] md:grid-cols-2 animate-fade-in">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-[#e95345] to-[#ff8a7a] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute left-10 top-16 h-32 w-32 rounded-full bg-white/15 blur-2xl animate-soft-pulse" />
          <div className="absolute bottom-20 right-8 h-44 w-44 rounded-full bg-[#ffd7ad]/30 blur-3xl animate-soft-pulse" />

          <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <ShieldCheck size={17} />
              Safety First
            </div>

            <div className="animate-float rounded-[26px] border border-white/25 bg-white/15 p-7 shadow-[0_20px_45px_rgba(97,24,18,0.22)] backdrop-blur">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[24px] bg-white text-[#e95345]">
                <FireExtinguisher size={54} />
              </div>

              <h1 className="text-4xl font-black leading-tight">
                APAR Inspection
              </h1>
              <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-white/85">
                Pantau inspeksi, pengisian ulang, dan keamanan APAR dalam satu sistem.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  ['128', 'APAR'],
                  ['36', 'Inspeksi'],
                  ['24', 'Lokasi']
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur"
                  >
                    <p className="text-xl font-black">{value}</p>
                    <p className="mt-1 text-xs font-semibold text-white/75">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#e95345]">
              <Flame size={22} />
            </div>
            <div>
              <p className="text-sm font-bold">Inspeksi lebih terukur</p>
              <p className="mt-1 text-xs text-white/75">
                Data inventaris, inspeksi, dan refill tersusun rapi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[620px] flex-col justify-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fee9e6] text-[#e95345] md:hidden">
                <FireExtinguisher size={28} />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e95345]">
                APAR Inspection
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#1f1b1a]">
                Selamat Datang
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6f625f]">
                Masuk untuk mengelola sistem pemeliharaan APAR.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-[#ffd2cc] bg-[#fff1ef] p-4 text-sm font-semibold text-[#c93629]">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-bold text-[#1f1b1a]">
                Email
                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="superadmin@apar.com"
                    className={inputClass}
                  />
                </div>
              </label>

              <label className="block text-sm font-bold text-[#1f1b1a]">
                Password
                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition placeholder:text-[#c8bbb7] focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 font-semibold text-[#6f625f]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#eadfdb] accent-[#e95345]"
                  />
                  Ingat saya
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setErrorMessage(
                      'Untuk meriset password, silakan hubungi Administrator atau Superadmin sistem.'
                    )
                  }
                  className="font-bold text-[#e95345] transition hover:text-[#d9473a]"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#e95345] text-sm font-black text-white shadow-[0_10px_20px_rgba(233,83,69,0.25)] transition hover:bg-[#d9473a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  'Memproses...'
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Masuk
                  </>
                )}
              </button>

              <div className="mt-6 text-center text-sm font-medium text-[#6f625f]">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-bold text-[#e95345] transition hover:underline"
                >
                  Registrasi di sini
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
