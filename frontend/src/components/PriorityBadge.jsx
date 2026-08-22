import React from 'react';

const CONFIG = {
  Urgent: {
    bg: 'rgba(239,68,68,0.12)',
    text: '#f87171',
    border: 'rgba(239,68,68,0.3)',
    dot: '#ef4444',
  },
  High: {
    bg: 'rgba(249,115,22,0.12)',
    text: '#fb923c',
    border: 'rgba(249,115,22,0.3)',
    dot: '#f97316',
  },
  Medium: {
    bg: 'rgba(234,179,8,0.12)',
    text: '#facc15',
    border: 'rgba(234,179,8,0.3)',
    dot: '#eab308',
  },
  Low: {
    bg: 'rgba(34,197,94,0.12)',
    text: '#4ade80',
    border: 'rgba(34,197,94,0.3)',
    dot: '#22c55e',
  },
};

/**
 * Color-coded priority badge.
 * @param {{ priority: string, size?: 'sm'|'md' }} props
 */
export default function PriorityBadge({ priority, size = 'md' }) {
  const cfg = CONFIG[priority] || CONFIG.Medium;
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses}`}
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: cfg.dot }}
      />
      {priority}
    </span>
  );
}
