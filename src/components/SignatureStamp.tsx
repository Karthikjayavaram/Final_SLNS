'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface SignatureStampProps {
  className?: string;
}

export default function SignatureStamp({ className = '' }: SignatureStampProps) {
  const text = "SLNS SIRUGUPPA • 9480038144 • ";
  const characters = text.split('');

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Rotating Text Circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <path
              id="circlePath"
              d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
            />
          </defs>
          <text className="font-sans font-bold text-[10px] tracking-[0.25em] fill-gold-400 uppercase">
            <textPath href="#circlePath" startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center text-gold-400">
        <Crown className="w-1/3 h-1/3 opacity-80" />
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gold-400/20 blur-xl rounded-full scale-150 pointer-events-none" />
    </div>
  );
}
