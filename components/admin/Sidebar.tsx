'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Quản lý đợt khảo sát' },
  { href: '/admin/students', label: 'Quản lý học sinh' },
  { href: '/admin/teachers', label: 'Quản lý giáo viên' },
  { href: '/admin/reports', label: 'Báo cáo & Thống kê' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-primary w-64 min-h-screen text-white">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-sans font-semibold">Admin Panel</h1>
        <p className="text-sm text-white/70 mt-1">THPT Chuyên Nguyễn Trãi</p>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-sans transition-colors ${
                isActive
                  ? 'bg-white/10 border-l-4 border-l-primary'
                  : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}