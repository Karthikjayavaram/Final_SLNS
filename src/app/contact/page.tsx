'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Navigation 
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function ContactPage() {
  const businessInfo = {
    name: "SLNS",
    subtitle: "Since 1986",
    phones: ["+91 94800 38144"],
    email: "contact@slns.com", // Replace with real if available
    address: "Bangalore, Karnataka, India", // Replace with exact address if available
    hours: "Monday - Sunday: 9:00 AM - 8:00 PM"
  };

  const socialLinks = [
    {
      name: "Instagram",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ),
      url: "https://www.instagram.com/raghu.nath.391",
      handle: "@raghu.nath.391",
      color: "hover:bg-pink-600/20 hover:text-pink-500 hover:border-pink-500/50"
    },
    {
      name: "Facebook",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
      url: "https://facebook.com", // Placeholder
      handle: "SLNS Events",
      color: "hover:bg-blue-600/20 hover:text-blue-500 hover:border-blue-500/50"
    },
    {
      name: "YouTube",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
          <path d="m10 15 5-3-5-3z"/>
        </svg>
      ),
      url: "https://youtube.com", // Placeholder
      handle: "SLNS Official",
      color: "hover:bg-red-600/20 hover:text-red-500 hover:border-red-500/50"
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-8 h-8" />,
      url: "https://wa.me/919480038144",
      handle: "+91 94800 38144",
      color: "hover:bg-green-600/20 hover:text-green-500 hover:border-green-500/50"
    },
    {
      name: "Email",
      icon: <Mail className="w-8 h-8" />,
      url: "mailto:contact@slns.com",
      handle: "contact@slns.com",
      color: "hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/50"
    },
    {
      name: "Call Now",
      icon: <Phone className="w-8 h-8" />,
      url: "tel:+919480038144",
      handle: "+91 94800 38144",
      color: "hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/50"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(170,124,17,0.08)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <span className="font-sans text-xs font-bold tracking-[0.3em] text-gold-400/80 uppercase">
              Get In Touch
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide mt-4">
              Contact <span className="gold-text-gradient">SLNS</span>
            </h1>
            <p className="max-w-xl mx-auto text-foreground/50 text-sm sm:text-base leading-relaxed mt-4">
              We would love to hear from you. Reach out to us for bookings, inquiries, or to discuss how we can make your next event unforgettable.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Left Column: Business Info & Map */}
            <div className="space-y-12">
              <ScrollReveal>
                <div className="glass rounded-3xl p-8 sm:p-10 border border-gold-400/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-bl-full" />
                  
                  <h2 className="font-serif text-3xl font-bold mb-2 text-white">
                    {businessInfo.name}
                  </h2>
                  <p className="text-gold-400 font-sans tracking-[0.2em] text-xs font-bold uppercase mb-8">
                    {businessInfo.subtitle}
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gold-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Phone</p>
                        {businessInfo.phones.map((phone, i) => (
                          <a key={i} href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="block text-white hover:text-gold-400 transition-colors text-lg">
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gold-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Address</p>
                        <p className="text-white text-lg">{businessInfo.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10 text-gold-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Working Hours</p>
                        <p className="text-white text-lg">{businessInfo.hours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-surface relative h-[400px] group">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001696423075!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy"
                    className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  ></iframe>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold tracking-wider uppercase shadow-2xl"
                    >
                      <Navigation className="w-4 h-4" /> Get Directions
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Social Media Grid */}
            <div className="flex flex-col h-full">
              <ScrollReveal>
                <div className="mb-8">
                  <h2 className="font-serif text-3xl font-bold mb-2">Connect With Us</h2>
                  <p className="text-foreground/50 text-sm">Follow us on our social channels for the latest updates and inspirations.</p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {socialLinks.map((social, index) => (
                  <ScrollReveal key={social.name}>
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center text-center p-8 h-full min-h-[200px] rounded-3xl border border-white/5 bg-surface/50 transition-all duration-500 group ${social.color}`}
                    >
                      <div className="p-4 rounded-full bg-black border border-white/10 group-hover:border-transparent group-hover:scale-110 transition-all duration-500 mb-4 text-white/50 group-hover:text-inherit">
                        {social.icon}
                      </div>
                      <h3 className="font-sans font-bold tracking-wider text-sm uppercase text-white mb-1 group-hover:text-inherit transition-colors">
                        {social.name}
                      </h3>
                      <p className="text-white/40 text-xs font-medium group-hover:text-inherit transition-colors">
                        {social.handle}
                      </p>
                    </motion.a>
                  </ScrollReveal>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
