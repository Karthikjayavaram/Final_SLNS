'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Briefcase, Phone } from 'lucide-react';
import dynamic from 'next/dynamic';
import SignatureStamp from '@/components/SignatureStamp';

const GoldParticles = dynamic(() => import('@/components/three/GoldParticles'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-[#0A0A0A]" />
  ),
});

export default function HeroSection() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-black">
      {/* Three.js Particles Background */}
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-[#0A0A0A]" />
        }
      >
        <GoldParticles />
      </Suspense>

      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0A0A0A] z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_80%)] z-[1]" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Floating Stamp */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="absolute top-24 right-4 sm:top-32 sm:right-10 lg:right-20 pointer-events-none opacity-30 sm:opacity-40 hover:opacity-100 transition-opacity duration-700 z-50"
        >
          <SignatureStamp className="w-24 h-24 sm:w-32 sm:h-32" />
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Big Logo / Brand Name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 20,
              delay: 0.2,
              duration: 1.5
            }}
            className="mb-8 mt-24 sm:mt-32 flex flex-col items-center justify-center gap-4 relative"
          >
            {/* Cinematic Glow Behind Text */}
            <div className="absolute inset-0 bg-gold-400/10 blur-[100px] rounded-full scale-150 pointer-events-none" />
            
            <div className="relative inline-block text-center z-10">
              <div className="font-serif text-[5rem] sm:text-8xl md:text-[8rem] lg:text-[10rem] leading-none font-black tracking-wider uppercase drop-shadow-[0_0_30px_rgba(170,124,17,0.8)]">
                {"SLNS".split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0, 0], 
                      y: [40, 0, 0, -40, 40] 
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      delay: index * 0.15, 
                      times: [0, 0.15, 0.8, 0.95, 1],
                      ease: "easeInOut" 
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-gold-400 to-orange-500 bg-[length:200%_auto] bg-left"
                    style={{ backgroundPosition: `${index * 25}% 50%` }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="font-serif text-5xl sm:text-6xl md:text-[5rem] lg:text-[7rem] leading-tight font-black tracking-widest uppercase drop-shadow-[0_0_20px_rgba(170,124,17,0.6)]">
                {"SIRUGUPPA".split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0, 0], 
                      y: [40, 0, 0, -40, 40] 
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      delay: 0.6 + index * 0.1, 
                      times: [0, 0.15, 0.8, 0.95, 1],
                      ease: "easeInOut" 
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-gold-400 to-[#FFF5D6] bg-[length:200%_auto] bg-left"
                    style={{ backgroundPosition: `${index * 12}% 50%` }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              
              {/* Golden particle sparkles */}
              <motion.div 
                className="absolute -top-8 -right-8 text-gold-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] text-2xl sm:text-4xl"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="absolute bottom-10 -left-10 text-gold-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] text-xl sm:text-3xl opacity-70"
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              >
                ✨
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, letterSpacing: "0em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
              className="flex items-center gap-4 mt-2"
            >
              <div className="h-[1px] w-16 sm:w-32 bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
              <span className="font-sans text-sm sm:text-lg md:text-2xl font-bold tracking-[0.6em] uppercase text-gold-200 whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Since 1984
              </span>
              <div className="h-[1px] w-16 sm:w-32 bg-gradient-to-r from-transparent via-gold-400/80 to-transparent" />
            </motion.div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
          >
            <a
              href="tel:+919480038144"
              className="w-full sm:w-auto flex items-center justify-center gap-2 btn-gold text-xs sm:text-sm px-8 py-4 rounded-full font-sans uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
            <Link
              href="/our-work"
              className="w-full sm:w-auto flex items-center justify-center gap-2 btn-outline-gold text-xs sm:text-sm px-8 py-4 rounded-full font-sans"
            >
              <Briefcase className="w-4 h-4" />
              View Our Work
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-gold-400/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
