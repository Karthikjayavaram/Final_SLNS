'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  type?: 'error' | 'success';
  title?: string;
  message: string;
  details?: string;
  onClose: () => void;
}

export default function ErrorModal({ isOpen, type = 'error', title, message, details, onClose }: ErrorModalProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const isError = type === 'error';
  const displayTitle = title || (isError ? 'An Error Occurred' : 'Success');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`bg-[#111] border ${isError ? 'border-red-500/20' : 'border-green-500/20'} rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden`}
          >
            {/* Top Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isError ? 'from-red-600 to-red-400' : 'from-green-600 to-green-400'}`} />

            <div className="flex justify-between items-start mb-4">
              <div className={`flex items-center gap-3 ${isError ? 'text-red-400' : 'text-green-400'}`}>
                <div className={`p-2 ${isError ? 'bg-red-500/10' : 'bg-green-500/10'} rounded-full`}>
                  {isError ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-serif text-white">{displayTitle}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-foreground/80 mb-6 font-sans text-sm leading-relaxed">
              {message}
            </div>

            {details && (
              <div className="mb-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Technical Details
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className={`bg-black border border-white/10 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto ${isError ? 'text-red-300/80' : 'text-green-300/80'}`}>
                        {details}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-bold"
              >
                {isError ? 'Dismiss' : 'Awesome'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
