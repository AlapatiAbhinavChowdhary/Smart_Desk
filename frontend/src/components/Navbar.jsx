import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineMenuAlt3,
  HiOutlineX,
  HiOutlineDocumentReport,
} from 'react-icons/hi';

const links = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/history', label: 'History' },
  { to: '/bulk', label: 'Bulk' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{
        background: 'rgba(10, 15, 30, 0.8)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Brand - Styled like theme */}
          <NavLink to="/" className="flex items-center gap-2 group z-10">
            {/* Simple white geometric icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className="text-xl font-medium tracking-wide text-white">
              SmartDesk
            </span>
          </NavLink>

          {/* Desktop links - Centered Pill */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1.5 rounded-full border border-white/5 bg-navy-800/60 backdrop-blur-md">
            {links.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="relative px-5 py-2 rounded-full text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-blue-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </NavLink>
              );
            })}
          </div>





          {/* Mobile toggle (absolutely positioned to the right on mobile) */}
          <button
            className="md:hidden absolute right-0 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'rgba(10, 15, 30, 0.95)',
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? '#00d4ff' : 'rgba(226,232,240,0.7)',
                      background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
