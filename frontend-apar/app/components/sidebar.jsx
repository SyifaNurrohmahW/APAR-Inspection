'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell,
  ClipboardCheck,
  FireExtinguisher,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  RefreshCcw,
  Settings,
  Users,
  X
} from 'lucide-react';

import { clearAuthState } from '@/utils/authState';
import { showConfirm } from '@/utils/feedback';

const menuGroups = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Master Data',
    items: [
      {
        title: 'Data APAR',
        href: '/dashboard/data-apar',
        icon: FireExtinguisher
      },
      {
        title: 'Jenis Bahan',
        href: '/dashboard/jenis-bahan',
        icon: Layers
      },
      {
        title: 'Lokasi',
        href: '/dashboard/lokasi',
        icon: MapPin
      },
      {
        title: 'Inspeksi',
        href: '/dashboard/inspeksi',
        icon: ClipboardCheck
      },
      {
        title: 'Pengisian Ulang',
        href: '/dashboard/pengisian-ulang',
        icon: RefreshCcw
      }
    ]
  },
  {
    title: 'Aktivitas',
    items: [
      {
        title: 'Riwayat',
        href: '/dashboard/riwayat',
        icon: History
      },
      {
        title: 'Notifikasi',
        href: '/dashboard/notifikasi',
        icon: Bell
      }
    ]
  },
  {
    title: 'Akun',
    items: [
      {
        title: 'Data Pengguna',
        href: '/dashboard/data-pengguna',
        icon: Users,
        superadminOnly: true
      },
      {
        title: 'Profile / Pengaturan',
        href: '/dashboard/profile',
        icon: Settings
      }
    ]
  }
];

const isActiveRoute = (pathname, href) => {
  if (href === '/dashboard') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const getInitials = (name = 'Pengguna') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export default function Sidebar({ isOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({
    nama: 'Pengguna',
    role: 'Pengguna'
  });

  const syncStoredUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

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
    syncStoredUser();
    window.addEventListener('apar-user-updated', syncStoredUser);

    return () => {
      window.removeEventListener('apar-user-updated', syncStoredUser);
    };
  }, []);

  const handleLogout = async () => {
    const yakin = await showConfirm({
      title: 'Yakin Mau Logout?',
      message: 'Sesi login kamu akan ditutup dan kamu perlu login lagi untuk masuk dashboard.',
      confirmLabel: 'Logout'
    });

    if (!yakin) return;

    clearAuthState();
    router.replace('/login');
  };

  const normalizedRole = String(user.role || '').toLowerCase();
  const visibleMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.superadminOnly || normalizedRole === 'superadmin'
      )
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-[#090909] text-zinc-400 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header Sidebar */}
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e95345] to-[#ff7a6d] text-white shadow-[0_12px_24px_rgba(233,83,69,0.28)]">
                <FireExtinguisher size={23} />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-black leading-none text-white">
                  APAR
                </h1>
                <p className="mt-1 text-xs font-semibold tracking-[0.28em] text-zinc-500">
                  INSPECTION
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            {visibleMenuGroups.map((group) => (
              <div key={group.title} className="mb-7 last:mb-0">
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                  {group.title}
                </p>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          if (onClose) onClose();
                        }}
                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:translate-x-1 hover:bg-white/5 hover:text-white ${
                          active
                            ? 'bg-[#151515] text-[#e95345] shadow-[inset_3px_0_0_#e95345]'
                            : 'text-zinc-400'
                        }`}
                      >
                        <Icon
                          size={19}
                          className={`shrink-0 transition-colors ${
                            active
                              ? 'text-[#e95345]'
                              : 'text-zinc-500 group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer User Info */}
          <div className="shrink-0 border-t border-white/10 p-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e95345] text-sm font-black text-white shadow-[0_10px_20px_rgba(233,83,69,0.22)]">
                  {getInitials(user.nama)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {user.nama}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-zinc-500">{user.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-[#e95345]"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
