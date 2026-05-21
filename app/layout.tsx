import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hệ thống Khảo sát THPT Chuyên Nguyễn Trãi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="bg-bg-light">{children}</body>
    </html>
  )
}