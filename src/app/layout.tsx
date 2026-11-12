import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { startCronJobs } from '@/lib/cron';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

startCronJobs();

export const metadata: Metadata = {
  title: 'AI News Desk',
  description: 'Internal dashboard for tracking AI news, story clusters, and drafts.',
};

const navLinks = [
  { href: '/', label: 'Today' },
  { href: '/all', label: 'All Stories' },
  { href: '/drafts', label: 'Drafts' },
  { href: '/config', label: 'Config' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">AI News Desk</p>
                <p className="text-3xl font-semibold">Internal AI media operating system</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-3 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white shadow-sm hover:border-slate-500"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="space-y-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
