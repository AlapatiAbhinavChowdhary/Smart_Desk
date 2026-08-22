import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import PageTransition from '../components/PageTransition';
import PriorityBadge from '../components/PriorityBadge';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStats, submitFeedback } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Billing', 'Technical', 'Delivery', 'Booking', 'Complaint', 'Positive'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

const rowAnim = {
  hidden: { opacity: 0, x: -12 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.35 },
  }),
};

export default function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('All');
  const [priFilter, setPriFilter] = useState('All');
  const [correctingTicket, setCorrectingTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getStats();
        if (!cancelled) setTickets(data.recent_tickets || []);
      } catch {
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (catFilter !== 'All' && t.category?.label !== catFilter) return false;
      if (priFilter !== 'All' && t.priority?.label !== priFilter) return false;
      return true;
    });
  }, [tickets, catFilter, priFilter]);

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const corrected_category = formData.get('category');
    const corrected_priority = formData.get('priority');

    try {
      await submitFeedback({
        ticket_id: correctingTicket.id,
        corrected_category,
        corrected_priority
      });
      
      // Update local state to reflect correction
      setTickets(tickets.map(t => {
        if (t.id === correctingTicket.id) {
          return {
            ...t,
            is_corrected: true,
            feedback: { corrected_category, corrected_priority }
          };
        }
        return t;
      }));
      
      toast.success('Feedback saved successfully!');
      setCorrectingTicket(null);
    } catch (err) {
      toast.error('Failed to save feedback');
    }
  };

  if (loading) return <LoadingSpinner text="Loading history…" />;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Ticket History
          </h1>
          <p className="text-gray-400 text-sm">
            Showing the last {tickets.length} analyzed tickets (stored in memory).
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="glass-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Category filter */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background:
                      catFilter === c
                        ? 'rgba(0,212,255,0.15)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      catFilter === c
                        ? 'rgba(0,212,255,0.4)'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    color: catFilter === c ? '#00d4ff' : '#94a3b8',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriFilter(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background:
                      priFilter === p
                        ? 'rgba(0,212,255,0.15)'
                        : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      priFilter === p
                        ? 'rgba(0,212,255,0.4)'
                        : 'rgba(255,255,255,0.08)'
                    }`,
                    color: priFilter === p ? '#00d4ff' : '#94a3b8',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        {filtered.length > 0 ? (
          <motion.div
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs text-gray-500 uppercase tracking-wider"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <th className="px-5 py-4 font-medium">#</th>
                    <th className="px-5 py-4 font-medium">Ticket Preview</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Priority</th>
                    <th className="px-5 py-4 font-medium">Time</th>
                    <th className="px-5 py-4 font-medium">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((t, i) => (
                      <motion.tr
                        key={i}
                        custom={i}
                        variants={rowAnim}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="group"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <td className="px-5 py-4 text-gray-600 text-xs">
                          {i + 1}
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-gray-300 truncate group-hover:text-white transition-colors text-xs sm:text-sm">
                            {t.ticket_text}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon
                              category={t.is_corrected ? t.feedback?.corrected_category : t.category?.label}
                              size={14}
                            />
                            <span className="text-gray-300 text-xs font-medium">
                              {t.is_corrected ? t.feedback?.corrected_category : t.category?.label}
                              {t.is_corrected && <span className="ml-1 text-[10px] text-cyan-400">(Corrected)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <PriorityBadge
                            priority={t.is_corrected ? t.feedback?.corrected_priority : t.priority?.label}
                            size="sm"
                          />
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {t.timestamp
                            ? new Date(t.timestamp).toLocaleTimeString()
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {!t.is_corrected ? (
                            <button
                              onClick={() => setCorrectingTicket(t)}
                              className="px-3 py-1 rounded text-xs font-medium border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                            >
                              Correct AI
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Learned
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="glass-card p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600 mb-2">
              {tickets.length === 0
                ? 'No tickets have been analyzed yet.'
                : 'No tickets match the selected filters.'}
            </p>
            {tickets.length === 0 && (
              <button
                onClick={() => navigate('/analyze')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Analyze your first ticket →
              </button>
            )}
          </motion.div>
        )}

        {/* Correction Modal */}
        <AnimatePresence>
          {correctingTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-md border border-cyan-400/30"
              >
                <h3 className="text-lg font-bold text-white mb-4">Correct AI Prediction</h3>
                <p className="text-sm text-gray-400 mb-6 italic line-clamp-3">"{correctingTicket.ticket_text}"</p>
                
                <form onSubmit={handleCorrectionSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Correct Category</label>
                      <select 
                        name="category" 
                        defaultValue={correctingTicket.category?.label}
                        className="w-full bg-navy-800 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Correct Priority</label>
                      <select 
                        name="priority" 
                        defaultValue={correctingTicket.priority?.label}
                        className="w-full bg-navy-800 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        {PRIORITIES.filter(p => p !== 'All').map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectingTicket(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg text-sm font-semibold bg-blue-accent text-white hover:bg-blue-glow transition-all"
                    >
                      Save Feedback
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
