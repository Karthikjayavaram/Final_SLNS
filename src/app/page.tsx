import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Phone, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import StatsCounter from '@/components/StatsCounter';
import TestimonialSlider from '@/components/TestimonialSlider';
import ScrollReveal from '@/components/ScrollReveal';

import dbConnect from '@/lib/db';
import Project from '@/models/Project';

export const dynamic = 'force-dynamic';

async function getFeaturedProjects() {
  await dbConnect();
  const projects = await Project.find().sort({ createdAt: -1 }).limit(3).lean();
  
  if (!projects || projects.length === 0) {
    // Fallback if no projects exist in DB
    return [
      {
        id: '1',
        title: 'Royal Wedding Stage',
        category: 'Wedding',
        imageUrl:
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
        description:
          'A breathtaking royal wedding stage with premium floral mandap, ambient chandeliers, and fairy-tale aisle runners.',
      },
      {
        id: '2',
        title: 'Enchanted Floral Stage',
        category: 'Stage',
        imageUrl:
          'https://images.unsplash.com/photo-1478812954026-9c750f0e89fc?auto=format&fit=crop&q=80&w=600',
        description:
          'Transform any venue into a breathtaking garden sanctuary with custom pastel backdrops and floral walls.',
      },
      {
        id: '3',
        title: 'Magical Themed Birthday',
        category: 'Birthday',
        imageUrl:
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=600',
        description:
          'Immersive themed birthday setups with balloon arches, character cutouts, and personalized photo booths.',
      },
    ];
  }

  return projects.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    category: p.category,
    imageUrl: p.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600',
    description: p.description
  }));
}

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* About / Intro Section */}
      <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(170,124,17,0.03)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Images */}
            <ScrollReveal direction="left">
              <div className="relative flex justify-center items-center">
                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                  <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/5 transform -rotate-2">
                    <Image
                      src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400"
                      alt="Wedding floral arch"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </div>
                  <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/5 transform rotate-2 translate-y-8">
                    <Image
                      src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400"
                      alt="Dining table setting"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Text */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-400/20 bg-gold-400/5">
                  <span className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-gold-400/80">
                    Our Story
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide leading-tight text-foreground">
                  Crafting Grand Decor For Your{' '}
                  <span className="gold-text-gradient">Precious Moments</span>
                </h2>
                <p className="text-foreground/50 leading-relaxed font-light text-sm sm:text-base">
                  At <strong className="text-gold-400">SLNS Events</strong>, we
                  believe every family milestone is a canvas for beauty. Our
                  family-run event decoration business has styled elegant stages,
                  romantic wedding mandaps, vibrant birthday themes, and stunning
                  balloon arrangements.
                </p>
                <p className="text-foreground/50 leading-relaxed font-light text-sm sm:text-base">
                  We handle everything from on-site floral styling and drapery to
                  lighting setups and dismantling — leaving you free to enjoy your
                  celebration with peace of mind.
                </p>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-sans text-sm font-bold uppercase tracking-wider transition-colors group"
                  >
                    Contact our designers
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsCounter />

      {/* Featured Work Section */}
      <section className="py-16 sm:py-24 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
              <span className="font-sans text-xs font-bold tracking-[0.3em] text-gold-400/80 uppercase">
                Portfolio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-foreground">
                Featured <span className="gold-text-gradient">Projects</span>
              </h2>
              <p className="text-foreground/40 text-sm sm:text-base leading-relaxed">
                A glimpse into our finest decoration work across weddings, birthdays, and celebrations.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {featuredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.15}>
                <div className="group relative rounded-2xl overflow-hidden border border-white/5 bg-surface luxury-shadow-hover h-[400px] sm:h-[450px]">
                  {/* Image */}
                  <Image
                    src={project.imageUrl}
                    alt={project.title || "SLNS Decoration Project"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-bold tracking-[0.2em] text-gold-400 uppercase">
                    {project.category}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-gold-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-foreground/50 text-sm font-light leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12">
              <Link
                href="/our-work"
                className="inline-flex items-center justify-center gap-2 btn-outline-gold text-xs px-8 py-4 rounded-full font-sans"
              >
                View All Projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(170,124,17,0.04)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
              <span className="font-sans text-xs font-bold tracking-[0.3em] text-gold-400/80 uppercase">
                Client Love
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-foreground">
                Trusted By{' '}
                <span className="gold-text-gradient">Loving Families</span>
              </h2>
              <p className="text-foreground/40 text-sm sm:text-base leading-relaxed">
                Hear how we helped design unforgettable memories for weddings, engagements, and birthdays.
              </p>
            </div>
          </ScrollReveal>
          <TestimonialSlider />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#111] to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(170,124,17,0.08)_0%,transparent_70%)]" />
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="section-divider absolute bottom-0 left-0 right-0" />

        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative space-y-6 sm:space-y-8">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider">
              Let&apos;s Style Your{' '}
              <span className="gold-text-gradient">Dream Celebration</span>
            </h2>
            <p className="max-w-xl mx-auto text-foreground/40 font-sans text-sm sm:text-base font-light leading-relaxed">
              Schedule a free consultation call. Our designers will understand your
              vision and craft customized decor packages just for you.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto flex items-center justify-center gap-2 btn-gold text-xs sm:text-sm px-8 py-4 rounded-full font-sans"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation
              </Link>
              <a
                href="tel:+919876543210"
                className="w-full sm:w-auto flex items-center justify-center gap-2 btn-outline-gold text-xs sm:text-sm px-8 py-4 rounded-full font-sans"
              >
                <Phone className="w-4 h-4" />
                Call +91 98765 43210
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
