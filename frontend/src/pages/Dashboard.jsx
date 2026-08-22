import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  HiOutlineChartBar,
  HiOutlineLightningBolt,
  HiOutlineBadgeCheck,
  HiOutlineCube,
} from 'react-icons/hi';

import PageTransition from '../components/PageTransition';
import PriorityBadge from '../components/PriorityBadge';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStats } from '../services/api';

/* ----- colours for charts ----- */
const CATEGORY_COLORS = {
  Technical: '#60a5fa',
  Complaint: '#f87171',
  Positive: '#00ff88',
  Billing: '#a78bfa',
  Delivery: '#f97316',
  Booking: '#34d399',
};

const PRIORITY_COLORS = {
  Urgent: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
};

/* ----- stat card config ----- */
const STAT_CARDS = [
  {
    id: 'total',
    label: 'Total Analyzed',
    icon: HiOutlineChartBar,
    color: '#00d4ff',
    valueFn: (s) => s.total_analyzed,
  },
  {
    id: 'speed',
    label: 'Avg Response Time',
    icon: HiOutlineLightningBolt,
    color: '#00ff88',
    valueFn: () => '< 2s',
  },
  {
    id: 'accuracy',
    label: 'Overall Accuracy',
    icon: HiOutlineBadgeCheck,
    color: '#a78bfa',
    valueFn: () => '95.19%',
  },
  {
    id: 'models',
    label: 'Models Active',
    icon: HiOutlineCube,
    color: '#f97316',
    valueFn: () => '3',
  },
];

/* ----- container anim ----- */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ================================================================== */

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getStats();
        if (!cancelled) setStats(data);
      } catch {
        /* backend not running — show empty state */
        if (!cancelled)
          setStats({
            total_analyzed: 0,
            category_distribution: {},
            priority_distribution: {},
            recent_tickets: [],
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* chart data transforms */
  const categoryData = stats
    ? Object.entries(stats.category_distribution).map(([name, value]) => ({
        name,
        value,
        fill: CATEGORY_COLORS[name] || '#64748b',
      }))
    : [];

  const priorityData = stats
    ? Object.entries(stats.priority_distribution).map(([name, value]) => ({
        name,
        value,
        fill: PRIORITY_COLORS[name] || '#64748b',
      }))
    : [];

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Hero ────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-16 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/10 bg-white/5 text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-accent animate-pulse" />
            AI-Powered Ticket Routing System
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            <span className="text-white block mb-2">The Future of</span>
            <span className="text-white block">Ticket Routing Starts with AI</span>
          </h1>
          
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Plan less, focus more. Your support queue, reimagined for deep work.
          </p>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute inset-0 bg-blue-accent/20 rounded-full blur-xl transition-all duration-300 group-hover:bg-blue-accent/30 opacity-50" />
            <div className="relative flex items-center p-1 rounded-full border border-white/10 bg-navy-800/80 backdrop-blur-md shadow-2xl">
              <div className="pl-5 pr-2 py-2 flex-1 flex items-center gap-3">
                <HiOutlineChartBar className="text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Paste a ticket text..." 
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/analyze');
                  }}
                />
              </div>
              <button 
                onClick={() => navigate('/analyze')}
                className="px-6 py-3 rounded-full bg-blue-accent text-white text-sm font-semibold hover:bg-blue-glow transition-all shadow-[0_0_20px_rgba(0,102,255,0.4)]"
              >
                Analyze
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat cards ─────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {STAT_CARDS.map(({ id, label, icon: Icon, color, valueFn }) => (
            <motion.div
              key={id}
              className="glass-card-hover p-5"
              variants={fadeUp}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {valueFn(stats)}
              </p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts row ─────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Category donut */}
          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Category Distribution
            </h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13,20,41,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-gray-600 text-sm">
                No data yet — analyze some tickets to see distribution
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryData.map(({ name, fill }) => (
                <div key={name} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: fill }} />
                  {name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Priority bar chart */}
          <motion.div className="glass-card p-6" variants={fadeUp}>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Priority Distribution
            </h2>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={priorityData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(13,20,41,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-gray-600 text-sm">
                No data yet — analyze some tickets to see distribution
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ── Recent tickets table ───────────────────────────── */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Recent Tickets
            </h2>
            {stats.recent_tickets.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View all →
              </button>
            )}
          </div>

          {stats.recent_tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Ticket</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recent_tickets.map((t, i) => (
                    <tr key={i} className="group">
                      <td className="py-3 pr-4 max-w-xs">
                        <p className="text-gray-300 truncate group-hover:text-white transition-colors">
                          {t.ticket_text}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={t.category?.label} size={14} />
                          <span className="text-gray-300 text-xs font-medium">
                            {t.category?.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <PriorityBadge priority={t.priority?.label} size="sm" />
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {t.root_cause?.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p className="text-sm mb-2">No tickets analyzed yet</p>
              <button
                onClick={() => navigate('/analyze')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Analyze your first ticket →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Trusted By Footer ───────────────────────────── */}
        <motion.div
          className="mt-24 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-8">
            **Trusted by top support teams around the world**
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake logos using text/icons for demo purposes */}
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Zantic
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              BookStore
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4M12 8v8"></path></svg>
              Wager
            </div>
            <div className="flex items-center gap-2 font-bold text-xl text-white hidden sm:flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              Unicoin
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
