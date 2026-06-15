'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function StickyContact() {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 glass border-t border-white/5">
      <div className="grid grid-cols-2 gap-0">
        <a
          href="https://wa.me/919480038144?text=Hi%20SLNS%20Decorators%2C%20I%20would%20like%20to%20inquire%20about%20your%20decoration%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-4 text-green-400 font-sans text-xs font-bold uppercase tracking-wider hover:bg-green-500/10 transition-colors border-r border-white/5"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
        <a
          href="tel:+919480038144"
          className="flex items-center justify-center gap-2 py-4 text-gold-400 font-sans text-xs font-bold uppercase tracking-wider hover:bg-gold-500/10 transition-colors"
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
      </div>
    </div>
  );
}
