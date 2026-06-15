'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    clientName: 'Priya & Rahul',
    eventType: 'Wedding',
    content:
      'SLNS transformed our wedding venue into a fairy tale. The floral mandap was breathtaking and the stage lighting was perfect. Every guest was in awe. Truly a team that understands luxury.',
    rating: 5,
  },
  {
    clientName: 'Meera Krishnan',
    eventType: 'Birthday Party',
    content:
      "My daughter's unicorn-themed birthday was magical! The balloon arches, the backdrop, the cake table — everything was Instagram-perfect. The team went above and beyond our expectations.",
    rating: 5,
  },
  {
    clientName: 'Arjun & Sneha',
    eventType: 'Engagement',
    content:
      'Professional, creative, and incredibly attentive to detail. Our engagement ceremony looked like it was straight out of a magazine. The pastel floral arrangements were divine.',
    rating: 5,
  },
  {
    clientName: 'Lakshmi Devi',
    eventType: 'Family Function',
    content:
      'We hired SLNS for our housewarming ceremony and it was beautiful. The traditional floral rangoli entrance and the stage setup received so many compliments from our guests.',
    rating: 4,
  },
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  const testimonial = testimonials[current];

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-8 sm:p-12 text-center relative"
        >
          {/* Quote icon */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
            <Quote className="w-4 h-4 text-gold-400" />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? 'text-gold-400 fill-gold-400'
                    : 'text-white/10'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <p className="font-sans text-sm sm:text-base text-foreground/70 leading-relaxed mb-8 italic">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* Client Info */}
          <div>
            <p className="font-serif text-lg sm:text-xl font-bold text-gold-400">
              {testimonial.clientName}
            </p>
            <p className="font-sans text-xs text-foreground/40 uppercase tracking-[0.2em] mt-1">
              {testimonial.eventType}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 sm:-left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-foreground/40 hover:text-gold-400 hover:border-gold-400/30 transition-all"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 sm:-right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-foreground/40 hover:text-gold-400 hover:border-gold-400/30 transition-all"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === index
                ? 'bg-gold-400 w-6'
                : 'bg-white/15 w-3 hover:bg-white/30'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
