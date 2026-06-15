'use client';

import { motion } from 'framer-motion';

export default function StatsCounter() {
  return (
    <section className="py-20 sm:py-28 bg-surface relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(170,124,17,0.06)_0%,transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-block px-6 py-2 rounded-full border border-gold-400/20 bg-gold-400/5 mb-4">
            <span className="font-sans text-xs sm:text-sm font-bold tracking-[0.3em] gold-text-gradient uppercase">
              1986 → Present
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
            Nearly Four Decades of <br className="hidden sm:block" />
            <span className="gold-text-gradient italic">Event Decoration Excellence</span>
          </h2>
          
          <p className="font-sans text-foreground/40 text-sm sm:text-base max-w-2xl mx-auto tracking-wide leading-relaxed pt-4">
            Since our founding, we have transformed countless venues into breathtaking celebrations. 
            Our commitment to premium quality and artistic design has remained uncompromising for over 38 years.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
