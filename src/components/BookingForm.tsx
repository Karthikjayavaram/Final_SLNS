'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Phone, MapPin, User, DollarSign, Edit3, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const eventTypes = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Stage Decoration',
  'Party Hall',
  'Theme Decor',
  'Family Function',
  'Other',
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    location: '',
    specialRequirements: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    const phoneRegex = /^[0-9+\s-]{8,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.eventType) newErrors.eventType = 'Please select an event type';

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.eventDate = 'Event date cannot be in the past';
      }
    }

    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 sm:p-12 text-center space-y-6"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-400/10 border border-gold-400/20">
          <CheckCircle className="w-10 h-10 text-gold-400" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-foreground">
          Booking Request Received!
        </h2>
        <div className="text-foreground/50 space-y-3 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
          <p>
            Thank you, <strong className="text-gold-400">{formData.name}</strong>. We have
            recorded your decoration inquiry for{' '}
            <strong className="text-gold-400">{formData.eventType}</strong> on{' '}
            <strong>
              {new Date(formData.eventDate).toLocaleDateString('en-US', {
                dateStyle: 'long',
              })}
            </strong>
            .
          </p>
          <p>
            Our team will contact you shortly at <strong>{formData.phone}</strong>.
          </p>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-3">
          <a
            href={`https://wa.me/919876543210?text=Hi%20SLNS%2C%20I%20just%20submitted%20a%20booking%20for%20${encodeURIComponent(formData.eventType)}.%20My%20name%20is%20${encodeURIComponent(formData.name)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600/20 border border-green-500/30 text-green-400 font-sans font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl hover:bg-green-600/30 transition-colors text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            Follow Up on WhatsApp
          </a>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                name: '',
                phone: '',
                email: '',
                eventType: '',
                eventDate: '',
                location: '',
                specialRequirements: '',
              });
            }}
            className="btn-outline-gold py-3.5 px-6 rounded-xl text-xs"
          >
            Submit Another Request
          </button>
        </div>
      </motion.div>
    );
  }

  const inputClasses = (field: string) =>
    `w-full px-4 py-3.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 bg-surface text-foreground placeholder:text-foreground/20 transition-colors ${
      errors[field]
        ? 'border-red-500/50 bg-red-500/5'
        : 'border-white/10 hover:border-white/20 focus:border-gold-500/50'
    }`;

  return (
    <div className="glass rounded-3xl p-6 sm:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Request Consultation
            </h2>
            <p className="text-foreground/30 text-xs">Fill in your event details below</p>
          </div>
        </div>

        {submitError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold-500" /> Full Name <span className="text-red-400">*</span>
            </label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rajesh Kumar" className={inputClasses('name')} />
            {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold-500" /> Phone <span className="text-red-400">*</span>
            </label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className={inputClasses('phone')} />
            {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">
              Email (Optional)
            </label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. rajesh@example.com" className={inputClasses('email')} />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label htmlFor="eventType" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">
              Event Type <span className="text-red-400">*</span>
            </label>
            <select id="eventType" name="eventType" value={formData.eventType} onChange={handleChange} className={`${inputClasses('eventType')} appearance-none`}>
              <option value="">Select Event Category</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.eventType && <p className="text-red-400 text-xs">{errors.eventType}</p>}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <label htmlFor="eventDate" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-500" /> Event Date <span className="text-red-400">*</span>
            </label>
            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleChange} className={inputClasses('eventDate')} />
            {errors.eventDate && <p className="text-red-400 text-xs">{errors.eventDate}</p>}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="location" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-500" /> Event Venue <span className="text-red-400">*</span>
          </label>
          <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Royal Orchid Hall, Indiranagar, Bengaluru" className={inputClasses('location')} />
          {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}
        </div>

        {/* Special Requirements */}
        <div className="space-y-2">
          <label htmlFor="specialRequirements" className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-foreground/50">
            Special Requirements
          </label>
          <textarea id="specialRequirements" name="specialRequirements" rows={4} value={formData.specialRequirements} onChange={handleChange} placeholder="e.g. Pastel pink floral backdrop with warm fairy lights..." className={`${inputClasses('specialRequirements')} resize-none`} />
        </div>

        {/* Submit */}
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-gold text-sm px-10 py-4 rounded-full font-sans disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
