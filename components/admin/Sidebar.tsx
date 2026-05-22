'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  BarChart3,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/admin/sessions', label: 'Quản lý đợt khảo sát', icon: ClipboardList },
  { href: '/admin/students', label: 'Quản lý học sinh', icon: Users },
  { href: '/admin/teachers', label: 'Quản lý giáo viên', icon: GraduationCap },
  { href: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="bg-primary w-64 h-screen text-white flex flex-col overflow-y-auto">
      {/* Brand Section - click về trang chủ admin */}
      <Link href="/admin" className="p-6 border-b border-white/20 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white/10">
            <img src="/cnt-logo.png" alt="CNT Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">THPT Chuyên Nguyễn Trãi</h1>
            <p className="text-xs text-white/60">Hệ thống quản trị</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 mx-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full mx-0 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}