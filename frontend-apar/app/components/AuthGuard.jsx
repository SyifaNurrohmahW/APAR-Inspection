'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { isAuthenticated } from '@/utils/authState';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      setCheckingAuth(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf8]">
        <div className="flex items-center gap-3 rounded-2xl border border-[#eadfdb] bg-white px-5 py-4 text-sm font-bold text-[#6f625f] shadow-[0_8px_28px_rgba(80,60,55,0.08)]">
          <Loader2 className="animate-spin text-[#e95345]" size={20} />
          Memeriksa sesi login...
        </div>
      </div>
    );
  }

  return children;
}
