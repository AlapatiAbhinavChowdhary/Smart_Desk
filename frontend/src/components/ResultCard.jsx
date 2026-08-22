import React from 'react';
import { motion } from 'framer-motion';

/**
 * Generic glass result card wrapper with staggered entrance animation.
 *
 * @param {{ children: React.ReactNode, delay?: number, className?: string }} props
 */
export default function ResultCard({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`glass-card p-5 sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
