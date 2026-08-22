import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated confidence / progress bar.
 *
 * @param {{ value: number, color?: string, label?: string, showPercent?: boolean }} props
 */
export default function ConfidenceBar({
  value = 0,
  color = '#00d4ff',
  label = '',
  showPercent = true,
}) {
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-400">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold" style={{ color }}>
              {value.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
