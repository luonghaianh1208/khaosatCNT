'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-primary h-12 flex items-center justify-between px-6 text-white shadow-md">
      <Link href="/survey" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
          <img src="/cnt-logo.png" alt="CNT Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-sm font-medium">THPT Chuyên Nguyễn Trãi</span>
      </Link>
      <button onClick={handleLogout} className="text-xs text-white/80 hover:text-white hover:underline transition-colors">
        Đăng xuất
      </button>
    </nav>
  );
}