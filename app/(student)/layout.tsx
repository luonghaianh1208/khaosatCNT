'use client';
import Navbar from '@/components/ui/Navbar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />
      <main className="w-full px-4 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}