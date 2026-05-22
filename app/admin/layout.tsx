'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'superadmin') {
        router.push('/login');
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-primary text-lg font-sans">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-light">
      {/* Desktop Sidebar - sticky */}
      <div className="hidden lg:block sticky top-0 h-screen flex-shrink-0 self-start">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="p-4 pt-16 lg:p-8 lg:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 lg:hidden bg-primary text-white p-4 z-40 flex items-center justify-between">
        <span className="font-semibold">Quản trị</span>
      </div>
    </div>
  );
}