'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Phone, MessageCircle, Play } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SignatureStamp from '@/components/SignatureStamp';

const getOptimizedUrl = (url: string, width = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const wm = `l_text:Arial_200_bold:SLNS%209480038144,co_white,o_50/c_scale,w_0.9,fl_relative/fl_layer_apply,g_center`;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/${wm}/`);
};

const getVideoPoster = (url: string, width = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  const withoutExt = url.substring(0, url.lastIndexOf('.'));
  return getOptimizedUrl(withoutExt + '.jpg', width);
};

const getBlurDataUrl = () => {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PC9zdmc+";
};

const ProjectCard = React.memo(({ project, index, openLightbox, innerRef }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isVideo = project.imageUrl.match(/\.(mp4|webm|ogg)$/i);
  
  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-surface cursor-pointer break-inside-avoid mb-6"
      onClick={() => openLightbox(index)}
      onMouseEnter={() => isVideo && setIsPlaying(true)}
      onMouseLeave={() => isVideo && setIsPlaying(false)}
    >
      {isVideo ? (
        <div className="relative w-full">
          <Image
            src={getVideoPoster(project.imageUrl, 800)}
            alt={project.title || 'SLNS Decoration Project'}
            width={800}
            height={1000}
            style={{ width: '100%', height: 'auto' }}
            className={`object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={getBlurDataUrl()}
          />
          {isPlaying && (
            <video
              src={getOptimizedUrl(project.imageUrl, 800)}
              autoPlay
              loop
              muted
              playsInline
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none z-10">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                <Play className="w-5 h-5 ml-1" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <Image
          src={getOptimizedUrl(project.imageUrl, 800)}
          alt={project.title || 'SLNS Decoration Project'}
          width={800}
          height={1000}
          style={{ width: '100%', height: 'auto' }}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading={index < 4 ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={getBlurDataUrl()}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

      {/* Category Text at Bottom */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 text-gold-400 text-[10px] font-bold uppercase tracking-wider">
          {project.category}
        </span>
      </div>
    </motion.div>
  );
});
ProjectCard.displayName = 'ProjectCard';

const SkeletonCard = () => (
  <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-surface/50 animate-pulse break-inside-avoid mb-6" style={{ height: '300px' }}>
    <div className="absolute inset-0 bg-white/5" />
  </div>
);

export default function OurWorkPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 15;

  const fetchProjects = async (pageNum: number, currentCategory: string, isNewCategory: boolean = false) => {
    try {
      if (isNewCategory) setLoading(true);
      else setLoadingMore(true);

      const categoryQuery = currentCategory !== 'All' ? `&category=${encodeURIComponent(currentCategory)}` : '';
      const res = await fetch(`/api/projects?public=true&sort=newest&limit=${LIMIT}&page=${pageNum}${categoryQuery}`, { cache: 'no-store' });
      
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((p: any) => ({
          id: p._id,
          title: p.title,
          category: p.category,
          imageUrl: p.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
          description: p.description,
        }));

        if (isNewCategory) {
          setProjects(mapped);
        } else {
          setProjects(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueMapped = mapped.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...uniqueMapped];
          });
        }
        
        setHasMore(data.length === LIMIT);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [projRes, stylesRes] = await Promise.all([
          fetch(`/api/projects?public=true&sort=newest&limit=${LIMIT}&page=1`, { cache: 'no-store' }),
          fetch('/api/styles', { cache: 'no-store' })
        ]);
        
        let stylesList = ['All'];
        if (stylesRes.ok) {
          const stylesData = await stylesRes.json();
          stylesList = ['All', ...stylesData.map((s: any) => s.name)];
        }

        if (projRes.ok) {
          const data = await projRes.json();
          const mapped = data.map((p: any) => ({
            id: p._id,
            title: p.title,
            category: p.category,
            imageUrl: p.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
            description: p.description,
          }));
          setProjects(mapped);
          setHasMore(data.length === LIMIT);
          setCategories(stylesList);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPage(1);
    fetchProjects(1, activeCategory, true);
  }, [activeCategory]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchProjects(nextPage, activeCategory, false);
          return nextPage;
        });
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, activeCategory]);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % projects.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + projects.length) % projects.length
      );
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(170,124,17,0.06)_0%,transparent_60%)]" />
        
        {/* Floating Stamp */}
        <div className="absolute top-24 right-4 sm:top-32 sm:right-10 lg:right-20 pointer-events-none opacity-30 sm:opacity-40 hover:opacity-100 transition-opacity duration-700 z-20">
          <SignatureStamp className="w-24 h-24 sm:w-32 sm:h-32" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-30">
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
          <div className="flex flex-wrap justify-center gap-2 pb-2">
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
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <AnimatePresence mode="popLayout">
                {projects.map((project, index) => {
                  if (projects.length === index + 1) {
                    return (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        index={index} 
                        openLightbox={openLightbox} 
                        innerRef={lastElementRef}
                      />
                    );
                  }
                  return (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index} 
                      openLightbox={openLightbox} 
                    />
                  );
                })}
              </AnimatePresence>
            )}
            {loadingMore && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
          </motion.div>

          {!loading && projects.length === 0 && (
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
        {lightboxIndex !== null && projects[lightboxIndex] && (
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
              {projects[lightboxIndex].imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={getOptimizedUrl(projects[lightboxIndex].imageUrl, 1600)}
                  autoPlay
                  controls
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain rounded-xl"
                  poster={getVideoPoster(projects[lightboxIndex].imageUrl, 1600)}
                />
              ) : (
                <Image
                  src={getOptimizedUrl(projects[lightboxIndex].imageUrl, 1600)}
                  alt={projects[lightboxIndex].title || 'SLNS Decoration Project'}
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
