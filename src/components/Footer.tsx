import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060606] text-white/70 pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex flex-col">
              <span className="font-serif text-3xl font-bold tracking-[0.2em] gold-text-gradient">
                SLNS
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] -mt-0.5 text-gold-400/50">
                Since 1986
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mt-2">
              We design your beautiful moments. From traditional weddings to modern themed parties,
              we bring premium craftsmanship and floral elegance to your celebrations.
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <a
                href="https://www.instagram.com/raghu.nath.391"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="px-4 h-10 rounded-full border border-white/10 flex items-center gap-2 text-white/40 hover:text-gold-400 hover:border-gold-400/30 transition-all text-xs font-sans tracking-wider"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                @raghu.nath.391
              </a>
              <a
                href="https://www.youtube.com/@mrevents7309"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold-400 hover:border-gold-400/30 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/raghu.nath.391"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-gold-400 hover:border-gold-400/30 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Our Services */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider text-gold-400 mb-6">
              Our Services
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                'Wedding Decoration',
                'Engagement Ceremonies',
                'Stage & Mandap Styling',
                'Themed Birthday Parties',
                'Party Hall Decor',
                'Family Celebrations',
              ].map((service) => (
                <li key={service}>
                  <Link
                    href="/our-work"
                    className="hover:text-gold-400 transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-600/50" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider text-gold-400 mb-6">
              Get in Touch
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-1" />
                <a href="https://maps.app.goo.gl/qiDHHzDPbaVvfqyV6" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-400 transition-colors">
                  Beside MRF Tyres, Near Thayamma Temple, Adoni Road, Siruguppa – 583121, Ballari, Karnataka
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href="tel:+919480038144" className="hover:text-gold-400 transition-colors">
                  +91 94800 38144
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href="tel:+919448906697" className="hover:text-gold-400 transition-colors">
                  +91 94489 06697
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href="mailto:avr661@gmail.com" className="hover:text-gold-400 transition-colors">
                  avr661@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours */}
          <div>
            <h3 className="font-serif text-base font-semibold tracking-wider text-gold-400 mb-6">
              Business Hours
            </h3>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              Available 7 days a week to plan your grand events.
            </p>
            <div className="glass-light rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50">Mon – Sat</span>
                <span className="text-gold-400">9:00 AM – 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Sunday</span>
                <span className="text-gold-400">10:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-white/30 gap-4">
          <p>© {new Date().getFullYear()} SLNS Decorators. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-gold-500 fill-gold-500" />
            <span>for beautiful moments</span>
          </div>
          <Link href="/admin" className="hover:text-gold-400 transition-colors font-medium">
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}
