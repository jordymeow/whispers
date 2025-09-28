'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface VerticalNavProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username?: string;
}

interface NavItem {
  href: string;
  label: string;
  show: boolean;
  indent?: boolean;
  isButton?: boolean;
}

export function VerticalNav({ isAuthenticated, isAdmin, username }: VerticalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Don't show navigation on index page if not authenticated
  if (pathname === '/' && !isAuthenticated) return null;

  const isDashboard = pathname.startsWith('/dashboard');
  const currentTab = searchParams.get('tab') || 'compose';

  // Dashboard sections (only shown when on dashboard and authenticated)
  const dashboardItems = (isDashboard && isAuthenticated) ? [
    { href: '/dashboard?tab=compose', label: 'Compose', show: true, indent: true },
    { href: '/dashboard?tab=whispers', label: 'Whispers', show: true, indent: true },
    { href: '/dashboard?tab=profile', label: 'Settings', show: true, indent: true },
    { href: 'logout', label: 'Logout', show: true, indent: true, isButton: true },
  ].filter(item => item.show) : [];

  // Build navigation structure
  const navStructure: NavItem[] = [];

  // Add Home
  navStructure.push({ href: '/', label: 'Home', show: true });

  // Add Profile and Search first
  if (isAuthenticated) {
    navStructure.push({ href: username ? `/@${username}` : '#', label: 'Profile', show: true });
    navStructure.push({ href: '/search', label: 'Search', show: true });
  }

  // Add Dashboard with sub-items
  if (isAuthenticated) {
    navStructure.push({ href: '/dashboard', label: 'Dashboard', show: true });
    if (isDashboard) {
      navStructure.push(...dashboardItems);
    }
  }

  // Add Admin at the same level (only for admins)
  if (isAdmin) {
    navStructure.push({ href: '/dashboard?tab=admin', label: 'Admin', show: true });
  }

  const allNavItems = navStructure.filter(item => item.show);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    // Force a full page reload to clear the authentication state
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';

    // For dashboard sub-items
    if (href.includes('?tab=')) {
      const tabMatch = href.match(/tab=(\w+)/);
      return pathname === '/dashboard' && tabMatch && tabMatch[1] === currentTab;
    }

    // Don't highlight Dashboard itself when on dashboard page
    if (href === '/dashboard') {
      return false;
    }

    return pathname.startsWith(href);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 50,
    }}>
      {/* Navigation items */}
      {allNavItems.map((item) => {
        if (item.isButton && item.label === 'Logout') {
          return (
            <button
              key={item.href}
              onClick={handleLogout}
              style={{
                color: 'rgba(210, 214, 239, 0.5)',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s ease',
                padding: '0.25rem 0',
                paddingLeft: item.indent ? '1rem' : '0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(210, 214, 239, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(210, 214, 239, 0.5)';
              }}
            >
              {item.label}
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: isActive(item.href) ? 'var(--text-primary)' : 'rgba(210, 214, 239, 0.5)',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s ease',
              padding: '0.25rem 0',
              paddingLeft: item.indent ? '1rem' : '0',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.color = 'rgba(210, 214, 239, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.color = 'rgba(210, 214, 239, 0.5)';
              }
            }}
          >
            {isActive(item.href) && (
              <span style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'var(--text-primary)',
                display: 'inline-block',
              }} />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}