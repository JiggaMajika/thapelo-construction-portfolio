import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ROLE_LABELS, canManageUsers } from '@shared/types';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { Avatar } from './ui';

interface NavItem {
  to: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/board', label: 'Board' },
  { to: '/approvals', label: 'Approvals' },
  { to: '/honours', label: 'Honours' },
  { to: '/reports', label: 'Reports' },
  { to: '/support', label: 'Support' },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!user) return null;

  const nav = [...NAV];
  nav.push({ to: '/settings', label: 'Settings' });
  if (canManageUsers(user.role)) nav.push({ to: '/activity', label: 'Activity' });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-ink text-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <button
            className="lg:hidden text-white/80"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-4 w-4 rounded-sm bg-gold" />
            <span className="hidden sm:inline">The Bridge</span>
          </div>
          <div className="ml-2 hidden flex-1 md:block">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={user.fullName} />
              <div className="leading-tight">
                <p className="text-xs font-medium">{user.fullName}</p>
                <p className="text-[10px] text-white/60">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>
            <button className="btn-ghost text-white/80 hover:text-white" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="hidden border-t border-white/10 lg:block">
          <div className="mx-auto flex max-w-[1400px] gap-1 px-4">
            {nav.map((n) => (
              <NavItem key={n.to} to={n.to} label={n.label} />
            ))}
          </div>
        </nav>
        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-white/10 lg:hidden">
            <div className="flex flex-col px-2 py-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/70'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-1 px-4 text-xs text-muted sm:flex-row">
          <span>The Bridge — GMC &amp; AppSumo shared workspace</span>
          <span>
            Web dashboard built by{' '}
            <span className="font-semibold text-ink">Global Media Content</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, label }: NavItem) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `border-b-2 px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'border-gold text-white'
            : 'border-transparent text-white/60 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
