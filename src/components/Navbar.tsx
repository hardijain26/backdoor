'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/radar', label: 'Morning Radar', badge: 'Active' },
    { href: '/jobs', label: 'Pipeline' },
    { href: '/outreach', label: 'Outreach Board' },
    { href: '/dossiers', label: 'Dossiers' },
    { href: '/health', label: 'System Health' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B11]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/radar" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center font-bold text-white text-sm shadow-sm">
              B
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-white tracking-tight text-base">Backdoor</span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                v1.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#161F33] text-white font-semibold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0F1523] px-2.5 py-1 rounded-md border border-white/8">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>35 Sources Scanned</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-[#161F33] px-2 py-1 rounded border border-white/10">
            Track: Staff PM
          </div>
        </div>
      </div>
    </header>
  );
}

