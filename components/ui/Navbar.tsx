'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-primary h-12 flex items-center justify-between px-6 text-white">
      <div className="text-sm font-medium">THPT Chuyên Nguyễn Trãi</div>
      <button onClick={handleLogout} className="text-xs hover:underline">
        Đăng xuất
      </button>
    </nav>
  );
}