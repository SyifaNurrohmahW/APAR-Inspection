'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  Loader2,
  AlertCircle,
  Settings
} from 'lucide-react';

import {
  getProfileById,
  updateProfile,
  updatePassword
} from '@/services/profileService';

export default function ProfilePage() {
  const router = useRouter();

  const [userLogin, setUserLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  const [profileForm, setProfileForm] = useState({
    nama: '',
    email: '',
    no_hp: '',
    role: '',
    status: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });

  const [showPassword, setShowPassword] = useState({
    lama: false,
    baru: false,
    konfirmasi: false
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3500);
  };

  const getInitials = (name) => {
    if (!name) return 'AS';
    return name
      .split(' ')
      .filter(Boolean)
      .map((item) => item[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStorage = localStorage.getItem('user');

    if (!token || !userStorage) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStorage);
      setUserLogin(parsedUser);

      setProfileForm({
        nama: parsedUser.nama || '',
        email: parsedUser.email || '',
        no_hp: parsedUser.no_hp || '',
        role: parsedUser.role || 'teknisi',
        status: parsedUser.status || 'aktif'
      });

      const fetchProfile = async () => {
        try {
          setLoading(true);
          const data = await getProfileById(parsedUser.id_users);
          if (data) {
            const updatedUser = {
              ...parsedUser,
              nama: data.nama || parsedUser.nama,
              email: data.email || parsedUser.email,
              no_hp: data.no_hp || parsedUser.no_hp,
              role: data.role || parsedUser.role,
              status: data.status || parsedUser.status
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserLogin(updatedUser);
            window.dispatchEvent(new Event('apar-user-updated'));

            setProfileForm({
              nama: updatedUser.nama || '',
              email: updatedUser.email || '',
              no_hp: updatedUser.no_hp || '',
              role: updatedUser.role || parsedUser.role || 'teknisi',
              status: updatedUser.status || parsedUser.status || 'aktif'
            });
          }
        } catch (error) {
          console.warn('Gagal sinkron data profile:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.nama || !profileForm.email) {
      showMessage('error', 'Nama dan email wajib diisi');
      return;
    }

    try {
      setLoadingProfile(true);

      await updateProfile(userLogin.id_users, {
        nama: profileForm.nama,
        email: profileForm.email,
        no_hp: profileForm.no_hp
      });

      const updatedUser = {
        ...userLogin,
        nama: profileForm.nama,
        email: profileForm.email,
        no_hp: profileForm.no_hp
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserLogin(updatedUser);
      window.dispatchEvent(new Event('apar-user-updated'));

      showMessage('success', 'Profile berhasil diperbarui');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.password_lama ||
      !passwordForm.password_baru ||
      !passwordForm.konfirmasi_password
    ) {
      showMessage('error', 'Semua field password wajib diisi');
      return;
    }

    if (passwordForm.password_baru !== passwordForm.konfirmasi_password) {
      showMessage('error', 'Konfirmasi password baru tidak cocok');
      return;
    }

    if (passwordForm.password_baru.length < 6) {
      showMessage('error', 'Password baru minimal 6 karakter');
      return;
    }

    try {
      setLoadingPassword(true);

      await updatePassword(userLogin.id_users, {
        password_lama: passwordForm.password_lama,
        password_baru: passwordForm.password_baru,
        konfirmasi_password: passwordForm.konfirmasi_password
      });

      setPasswordForm({
        password_lama: '',
        password_baru: '',
        konfirmasi_password: ''
      });

      showMessage('success', 'Password berhasil diperbarui');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  if (loading && !profileForm.nama) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-[#eadfdb] bg-white px-5 py-4 text-sm font-bold text-[#6f625f]">
          <Loader2 className="animate-spin text-[#e95345]" size={20} />
          Memuat data profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c2aaa3]">
            Pengaturan
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1f1b1a]">
            Profile Pengguna
          </h1>
          <p className="mt-2 text-sm text-[#7f716d]">
            Kelola data diri, informasi akun, dan keamanan kata sandi Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-1">
          <div className="overflow-hidden rounded-[24px] border border-[#eadfdb] bg-white p-6 shadow-[0_8px_28px_rgba(80,60,55,0.08)]">
            <div className="flex items-center gap-4 border-b border-[#eadfdb] pb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e95345] to-[#ff7a6d] text-lg font-black text-white shadow-md">
                {getInitials(profileForm.nama)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-[#1f1b1a]">
                  {profileForm.nama}
                </p>
                <p className="text-xs font-semibold capitalize text-[#7f716d]">
                  Role: {profileForm.role}
                </p>
              </div>
            </div>

            {message.text && (
              <div
                className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  message.type === 'success'
                    ? 'border-[#f7b8b0] bg-[#fee9e6] text-[#d9473a]'
                    : 'border-[#f7b8b0] bg-[#fee9e6] text-[#d93f32]'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {message.text}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#fffaf8] px-4 py-3 border border-[#eadfdb]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#e95345]" size={19} />
                  <span className="text-sm font-semibold text-[#6f625f]">
                    Role Sistem
                  </span>
                </div>
                <span className="rounded-full bg-[#fee9e6] px-3 py-1 text-xs font-bold capitalize text-[#e95345]">
                  {profileForm.role}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#fffaf8] px-4 py-3 border border-[#eadfdb]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-[#00a862]" size={19} />
                  <span className="text-sm font-semibold text-[#6f625f]">
                    Status Akun
                  </span>
                </div>
                <span className="rounded-full bg-[#e7f8ef] px-3 py-1 text-xs font-bold capitalize text-[#00a862]">
                  {profileForm.status}
                </span>
              </div>

              <div className="rounded-2xl border border-[#eadfdb] bg-[#fffaf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e95345]">
                  Informasi Akses
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#6f625f]">
                  Perubahan role dan status akun hanya dapat dilakukan melalui menu Data Pengguna oleh Superadmin.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          {/* Form Edit Informasi Diri */}
          <form
            onSubmit={handleUpdateProfile}
            className="rounded-[24px] border border-[#eadfdb] bg-white p-6 shadow-[0_8px_28px_rgba(80,60,55,0.08)]"
          >
            <div className="mb-6 border-b border-[#eadfdb] pb-4">
              <h2 className="text-lg font-bold text-[#1f1b1a]">
                Informasi Personal
              </h2>
              <p className="mt-1 text-sm text-[#7f716d]">
                Perbarui nama lengkap, alamat email, dan nomor telepon aktif Anda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type="text"
                    name="nama"
                    value={profileForm.nama}
                    onChange={handleProfileChange}
                    placeholder="Masukkan nama lengkap"
                    className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-4 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                    />
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="Masukkan alamat email"
                      className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-4 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                    />
                    <input
                      type="text"
                      name="no_hp"
                      value={profileForm.no_hp}
                      onChange={handleProfileChange}
                      placeholder="Contoh: 6281234567890"
                      className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-4 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loadingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e95345] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#d9473a] disabled:opacity-70"
              >
                {loadingProfile ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Form Ubah Password */}
          <form
            onSubmit={handleUpdatePassword}
            className="rounded-[24px] border border-[#eadfdb] bg-white p-6 shadow-[0_8px_28px_rgba(80,60,55,0.08)]"
          >
            <div className="mb-6 border-b border-[#eadfdb] pb-4">
              <h2 className="text-lg font-bold text-[#1f1b1a]">
                Ubah Password
              </h2>
              <p className="mt-1 text-sm text-[#7f716d]">
                Gunakan password baru yang kuat dan mudah Anda ingat.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                  />
                  <input
                    type={showPassword.lama ? 'text' : 'password'}
                    name="password_lama"
                    value={passwordForm.password_lama}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan password saat ini"
                    className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, lama: !prev.lama }))
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                  >
                    {showPassword.lama ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                    />
                    <input
                      type={showPassword.baru ? 'text' : 'password'}
                      name="password_baru"
                      value={passwordForm.password_baru}
                      onChange={handlePasswordChange}
                      placeholder="Minimal 6 karakter"
                      className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, baru: !prev.baru }))
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                    >
                      {showPassword.baru ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1f1b1a]">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
                    />
                    <input
                      type={showPassword.konfirmasi ? 'text' : 'password'}
                      name="konfirmasi_password"
                      value={passwordForm.konfirmasi_password}
                      onChange={handlePasswordChange}
                      placeholder="Ulangi password baru"
                      className="h-12 w-full rounded-2xl border border-[#eadfdb] bg-white pl-12 pr-12 text-sm font-medium text-[#1f1b1a] outline-none transition focus:border-[#e95345] focus:ring-4 focus:ring-[#fee9e6]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          konfirmasi: !prev.konfirmasi
                        }))
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#9b8d89] transition hover:bg-[#fff5f3] hover:text-[#e95345]"
                    >
                      {showPassword.konfirmasi ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loadingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f1b1a] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#383230] disabled:opacity-70"
              >
                {loadingPassword ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Perbarui Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
