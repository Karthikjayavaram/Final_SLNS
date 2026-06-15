'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Phone, MessageCircle } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

// Dynamic categories will be loaded from DB

export default function OurWorkPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, stylesRes] = await Promise.all([
          fetch('/api/projects?public=true&sort=newest', { cache: 'no-store' }),
          fetch('/api/styles', { cache: 'no-store' })
        ]);
        
        if (stylesRes.ok) {
          const stylesData = await stylesRes.json();
          // We fetch styles just in case, but we will override categories with ONLY the ones that have actual projects
        }

        if (projRes.ok) {
          const data = await projRes.json();
          // Map to match the component's expected structure
          const mapped = data.map((p: any) => ({
            id: p._id,
            title: p.title,
            category: p.category,
            imageUrl: p.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
            description: p.description,
          }));
          setProjects(mapped);
          
          // Generate categories strictly from available media
          const uniqueCategories = Array.from(new Set(mapped.map((p: any) => p.category))) as string[];
          setCategories(['All', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredProjects.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredProjects.length) % filteredProjects.length
      );
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(170,124,17,0.06)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <span className="font-sans text-xs font-bold tracking-[0.3em] text-gold-400/80 uppercase">
              Portfolio
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide mt-4">
              Our <span className="gold-text-gradient">Completed Work</span>
            </h1>
            <p className="max-w-xl mx-auto text-foreground/40 text-sm sm:text-base leading-relaxed mt-4">
              Browse our collection of premium event decorations. Each project is crafted with passion and precision.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[60px] z-30 bg-background/80 backdrop-blur-lg border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-sans text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-400/15 text-gold-400 border border-gold-400/30'
                    : 'text-foreground/40 border border-white/5 hover:text-foreground/60 hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 sm:gap-6 space-y-5 sm:space-y-6 min-h-[400px]"
          >
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden border border-white/5 bg-surface cursor-pointer break-inside-avoid mb-6"
                  onClick={() => openLightbox(index)}
                >
                  {project.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={project.imageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={project.imageUrl}
                      alt={project.title || 'SLNS Decoration Project'}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Clean Visual Presentation - Removed Title and Category Overlays as requested */}
                </motion.div>
              ))}
              </AnimatePresence>
            )}
          </motion.div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-foreground/30 font-sans text-sm">
                No projects found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <ScrollReveal>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold">
              Love what you see?{' '}
              <span className="gold-text-gradient">Let&apos;s create yours.</span>
            </h2>
            <p className="text-foreground/40 text-sm max-w-md mx-auto">
              Every project is custom-designed to match your vision. Book a consultation today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <a
                href="https://wa.me/919480038144?text=Hi%20SLNS%2C%20I%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-gold text-xs px-8 py-4 rounded-full font-sans uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
              <a
                href="tel:+919480038144"
                className="inline-flex items-center gap-2 btn-outline-gold text-xs px-8 py-4 rounded-full font-sans uppercase tracking-wider"
              >
                <Phone className="w-4 h-4" />
                Call Us Directly
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredProjects[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevLightbox();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextLightbox();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image */}
            <div
              className="relative w-[90vw] h-[70vh] sm:w-[80vw] sm:h-[75vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredProjects[lightboxIndex].imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={filteredProjects[lightboxIndex].imageUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <Image
                  src={filteredProjects[lightboxIndex].imageUrl}
                  alt={filteredProjects[lightboxIndex].title || 'SLNS Decoration Project'}
                  fill
                  className="object-contain rounded-xl"
                  sizes="90vw"
                  priority
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl flex justify-center">
                <a
                  href="https://wa.me/919480038144?text=Hi%20SLNS%2C%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20inquire."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-gold text-xs px-6 py-2.5 rounded-full font-sans mt-4 uppercase tracking-wider"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
