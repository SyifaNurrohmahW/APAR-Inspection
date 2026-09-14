'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';

import { getAllNotifikasi } from '@/services/notifikasiService';
import { showConfirm } from '@/utils/feedback';
import { clearAuthState } from '@/utils/authState';

const NOTIFICATION_READ_EVENT = 'apar-notification-read';
const USER_UPDATED_EVENT = 'apar-user-updated';

const getInitials = (name = 'Pengguna') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export default function Navbar({ onMenuToggle }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState({
    nama: 'Pengguna',
    role: 'Pengguna'
  });
  const router = useRouter();

  // Initialize theme from localStorage or document
  useEffect(() => {
    const storedTheme = localStorage.getItem('apar-theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('apar-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apar-theme', 'light');
    }
  };

  const syncStoredUser = () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        nama: parsedUser.nama || 'Pengguna',
        role: parsedUser.role || 'Pengguna'
      });
    } catch {
      setUser({
        nama: 'Pengguna',
        role: 'Pengguna'
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Load initial user state immediately on mount
    syncStoredUser();

    const loadNotificationCount = async () => {
      if (!localStorage.getItem('token')) {
        return;
      }

      try {
        const data = await getAllNotifikasi();

        if (isMounted) {
          setNotificationCount(
            data.filter((item) => Number(item.dibaca) !== 1).length
          );
        }
      } catch {
        if (isMounted) {
          setNotificationCount(0);
        }
      }
    };

    loadNotificationCount();
    window.addEventListener(NOTIFICATION_READ_EVENT, loadNotificationCount);
    window.addEventListener(USER_UPDATED_EVENT, syncStoredUser);

    return () => {
      isMounted = false;
      window.removeEventListener(NOTIFICATION_READ_EVENT, loadNotificationCount);
      window.removeEventListener(USER_UPDATED_EVENT, syncStoredUser);
    };
  }, []);

  const handleToggleProfile = () => {
    syncStoredUser();
    setOpenProfile((currentValue) => !currentValue);
  };

  const handleLogout = async () => {
    const yakin = await showConfirm({
      title: 'Yakin Mau Logout?',
      message: 'Sesi login kamu akan ditutup dan kamu perlu login lagi untuk masuk dashboard.',
      confirmLabel: 'Logout'
    });

    if (!yakin) {
      return;
    }

    clearAuthState();
    setOpenProfile(false);
    router.replace('/login');
  };

  const handleProfileClick = () => {
    syncStoredUser();
    setOpenProfile(false);
    router.push('/dashboard/profile');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/data-apar?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfdb]/80 bg-[#fffaf8]/85 px-4 py-4 shadow-[0_4px_22px_rgba(80,60,55,0.06)] backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-3 sm:gap-5">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#eadfdb] bg-white text-[#1f1b1a] transition hover:bg-[#fee9e6] hover:text-[#e95345] lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 sm:max-w-[460px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5a7a2]"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari data APAR, lokasi, inspeksi..."
            className="h-11 w-full rounded-2xl border border-[#eadfdb] bg-white/90 pl-11 pr-4 text-sm text-[#1f1b1a] outline-none transition-all duration-300 placeholder:text-[#b8aaa5] focus:border-[#e95345] focus:bg-white focus:ring-4 focus:ring-[#e95345]/10 sm:h-12"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleTheme}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfdb] bg-white text-[#1f1b1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f5c6bf] hover:bg-[#fee9e6] hover:text-[#e95345] hover:shadow-md"
            aria-label={theme === 'dark' ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
            title={theme === 'dark' ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            onClick={() => router.push('/dashboard/notifikasi')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#eadfdb] bg-white text-[#1f1b1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f5c6bf] hover:bg-[#fee9e6] hover:text-[#e95345] hover:shadow-md"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <>
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e95345] px-1.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 animate-ping rounded-full bg-[#e95345]" />
              </>
            )}
          </button>

          <div className="relative">
            <button
              onClick={handleToggleProfile}
              className="flex items-center gap-2 rounded-xl border border-[#eadfdb] bg-white px-2 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f5c6bf] hover:bg-[#fee9e6] hover:shadow-md sm:gap-3"
              aria-expanded={openProfile}
              aria-label="Buka menu profil"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e95345] to-[#ff7a6d] text-sm font-bold text-white shadow-[0_6px_14px_rgba(233,83,69,0.25)]">
                {getInitials(user.nama)}
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-[#6f625f] transition sm:block ${
                  openProfile ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-[#eadfdb] bg-white p-3 shadow-[0_14px_40px_rgba(80,60,55,0.14)]">
                <div className="mb-3 border-b border-[#f0e8e4] pb-3">
                  <p className="text-sm font-bold text-[#1f1b1a]">
                    {user.nama}
                  </p>
                  <p className="mt-1 text-xs font-semibold capitalize text-[#8c7c78]">
                    {user.role}
                  </p>
                </div>

                <button 
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#6f625f] transition hover:bg-[#fee9e6] hover:text-[#e95345]"
                >
                  <User size={17} />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#e95345] transition hover:bg-[#fee9e6]"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
