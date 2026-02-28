import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { LayoutDashboard, History } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UX Clarifier',
  description: 'AI-powered pre-design validation tool for UX/Product Designers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`} suppressHydrationWarning>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              <span>UX Clarifier</span>
            </Link>
            <nav>
              <Link href="/history" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4" />
                View History
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
