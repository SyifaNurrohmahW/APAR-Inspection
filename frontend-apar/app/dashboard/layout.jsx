'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Navbar from '@/components/navbar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fffaf8]">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="min-h-screen lg:ml-72 transition-all duration-300">
          <Navbar
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />

          <section className="p-4 sm:p-6 lg:p-8">
            {children}
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}
