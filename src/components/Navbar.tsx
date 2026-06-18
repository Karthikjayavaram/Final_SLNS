'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Calendar, Lock, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Our Work', path: '/our-work' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex flex-col group z-10">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] gold-text-gradient transition-all">
              SLNS
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] -mt-0.5 text-gold-400/60">
              Since 1984
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative px-4 py-2 font-sans text-xs font-medium tracking-[0.15em] uppercase transition-colors rounded-full ${
                    isActive
                      ? 'text-gold-400'
                      : 'text-foreground/60 hover:text-gold-300'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Admin Link */}
            <Link
              href="/admin"
              className="px-3 py-2 text-xs font-sans tracking-[0.15em] uppercase text-foreground/50 hover:text-gold-400 transition-colors flex items-center gap-1"
              title="Admin Panel"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin
            </Link>

            {/* CTA Button */}
            <a
              href="https://wa.me/919480038144?text=Hi%20SLNS%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 flex items-center gap-2 btn-gold text-xs px-6 py-2.5 rounded-full font-sans tracking-wider uppercase"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Us
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground/80 focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors z-10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl md:hidden z-40 flex flex-col justify-center items-center"
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-4 text-foreground/80 p-2"
              aria-label="Close menu"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 text-center"
            >
              <span className="font-serif text-4xl font-bold tracking-[0.2em] gold-text-gradient">
                SLNS
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-400/50 mt-1">
                Since 1984
              </p>
            </motion.div>

            {/* Nav Links */}
            <nav className="flex flex-col items-center gap-2 w-full px-8">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.path;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    className="w-full max-w-sm"
                  >
                    <Link
                      href={link.path}
                      className={`block text-center py-4 px-6 rounded-2xl font-sans text-lg font-semibold tracking-wider transition-all ${
                        isActive
                          ? 'text-gold-400 bg-gold-400/10 border border-gold-400/20'
                          : 'text-foreground/70 hover:text-gold-300 hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Admin Link - mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + navLinks.length * 0.08 }}
                className="w-full max-w-sm"
              >
                <Link
                  href="/admin"
                  className="block text-center py-4 px-6 rounded-2xl font-sans text-sm font-medium tracking-wider text-foreground/40 hover:text-gold-400 transition-all"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Admin Panel
                </Link>
              </motion.div>
            </nav>

            {/* Bottom CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col gap-3 w-full px-8 max-w-sm"
            >
              <a
                href="https://wa.me/919480038144?text=Hi%20SLNS%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 btn-gold py-4 rounded-2xl font-sans text-sm uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
              <a
                href="tel:+919480038144"
                className="flex items-center justify-center gap-2 btn-outline-gold py-4 rounded-2xl font-sans text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Us Directly
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
