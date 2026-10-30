'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/radar', label: 'Morning Radar', badge: 'Active' },
    { href: '/jobs', label: 'Pipeline' },
    { href: '/outreach', label: 'Outreach Board' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/dossiers', label: 'Dossiers' },
    { href: '/health', label: 'System Health' },
    { href: '/settings', label: 'Settings' },
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname
                ? pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                : false;
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

        {/* Right Status Indicator & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0F1523] px-2.5 py-1 rounded-md border border-white/8">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>35 Sources Scanned</span>
          </div>
          <div className="hidden sm:block text-[11px] font-mono text-slate-400 bg-[#161F33] px-2 py-1 rounded border border-white/10">
            Track: Staff PM
          </div>

          {/* Mobile Hamburger Button (44px min touch target per WCAG) */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#0F1523] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
                Navigation
              </div>
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname
                    ? pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    : false;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                        isActive
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>35 Sources Scanned</span>
              </div>
              <div>Track: Staff PM / AI-Native</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
