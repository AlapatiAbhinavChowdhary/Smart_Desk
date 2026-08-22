import React from 'react';
import {
  HiOutlineCreditCard,
  HiOutlineCog,
  HiOutlineTruck,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineThumbUp,
} from 'react-icons/hi';

const ICONS = {
  Billing: { Icon: HiOutlineCreditCard, color: '#a78bfa' },
  Technical: { Icon: HiOutlineCog, color: '#60a5fa' },
  Delivery: { Icon: HiOutlineTruck, color: '#f97316' },
  Booking: { Icon: HiOutlineCalendar, color: '#34d399' },
  Complaint: { Icon: HiOutlineExclamationCircle, color: '#f87171' },
  Positive: { Icon: HiOutlineThumbUp, color: '#00ff88' },
};

/**
 * Category icon with coloured background.
 * @param {{ category: string, size?: number }} props
 */
export default function CategoryIcon({ category, size = 20 }) {
  const cfg = ICONS[category] || ICONS.Complaint;
  const { Icon, color } = cfg;

  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: size + 16,
        height: size + 16,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon style={{ width: size, height: size, color }} />
    </div>
  );
}
