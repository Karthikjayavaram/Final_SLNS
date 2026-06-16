'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Briefcase, Phone } from 'lucide-react';
import dynamic from 'next/dynamic';

const GoldParticles = dynamic(() => import('@/components/three/GoldParticles'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080808] to-[#0A0A0A]" />
  ),
});

const slides = [
  {
    title: 'We Design Your',
    highlight: 'Beautiful Moments',
    tagline:
      'Luxury wedding stages & floral mandaps crafted with royal grandeur and modern sophistication.',
  },
  {
    title: 'Celebrate in',
    highlight: 'Magical Backdrops',
    tagline:
      'Stunning stage setups and theme decorations tailored specifically for your family milestones.',
  },
  {
    title: 'Sophisticated',
    highlight: 'Floral Artistry',
    tagline:
      'Meticulously planned pathways, entrance arches, and canopy setups that leave guests in awe.',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Big Logo / Brand Name */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.3,
              duration: 1
            }}
            className="mb-6 flex flex-col items-center justify-center gap-2"
          >
            <div className="relative inline-block">
              <h2 className="font-serif text-5xl sm:text-6xl md:text-8xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 drop-shadow-[0_0_15px_rgba(170,124,17,0.5)]">
                SLNS
              </h2>
              <motion.div 
                className="absolute -top-4 -right-6 text-gold-300"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, letterSpacing: "0em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold-400/50" />
              <span className="font-sans text-sm sm:text-base md:text-xl font-bold tracking-[0.5em] uppercase text-gold-400/90 whitespace-nowrap">
                Since 1984
              </span>
              <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold-400/50" />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-wide leading-[1.1]">
                <span className="text-foreground">{slides[current].title}</span>
                <br />
                <span className="gold-shimmer">{slides[current].highlight}</span>
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* Tagline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`tag-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto font-sans text-sm sm:text-base lg:text-lg text-foreground/50 font-light leading-relaxed tracking-wide"
            >
              {slides[current].tagline}
            </motion.p>
          </AnimatePresence>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4"
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

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === index
                ? 'bg-gold-400 w-8'
                : 'bg-white/20 w-4 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
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
