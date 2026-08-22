import React from 'react';
import { motion } from 'framer-motion';

/**
 * Full-screen loading spinner with SmartDesk branding.
 * @param {{ text?: string, inline?: boolean }} props
 */
export default function LoadingSpinner({ text = 'Processing…', inline = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      {/* Rotating rings */}
      <div className="relative w-12 h-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#00d4ff', borderRightColor: '#00d4ff' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-1.5 rounded-full border-2 border-transparent"
          style={{ borderBottomColor: '#00ff88', borderLeftColor: '#00ff88' }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: 'rgba(0,212,255,0.12)' }}
        />
      </div>
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  );

  if (inline) return spinner;

  return (
    <div className="flex items-center justify-center py-20">{spinner}</div>
  );
}
