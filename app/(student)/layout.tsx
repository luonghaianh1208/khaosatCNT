'use client';
import Navbar from '@/components/ui/Navbar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  );
}