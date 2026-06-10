'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/', label: 'Задачи' },
  { href: '/projects', label: 'Проекты' },
  { href: '/ai', label: 'Мой AI-чат' },
  { href: '/admin/users', label: 'Админ', admin: true },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-800">SEOLES</span>
            <nav className="flex gap-3 text-sm">
              {links
                .filter((l) => !l.admin || user?.role === 'ADMIN')
                .map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      pathname === l.href || pathname.startsWith(l.href + '/')
                        ? 'font-medium text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }
                  >
                    {l.label}
                  </Link>
                ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{user?.email}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
