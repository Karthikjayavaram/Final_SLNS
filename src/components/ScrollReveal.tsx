'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const directionVariants = {
  up: { hidden: { opacity: 0, y: 40, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } },
  down: { hidden: { opacity: 0, y: -40, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } },
  left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px' });
  const variants = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
