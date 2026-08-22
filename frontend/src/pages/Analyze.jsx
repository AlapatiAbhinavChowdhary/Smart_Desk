import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineClipboardCopy,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineLightningBolt,
} from 'react-icons/hi';

import PageTransition from '../components/PageTransition';
import ResultCard from '../components/ResultCard';
import ConfidenceBar from '../components/ConfidenceBar';
import PriorityBadge from '../components/PriorityBadge';
import CategoryIcon from '../components/CategoryIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeTicket } from '../services/api';

/* ----- example tickets ----- */
const EXAMPLES = [
  "I've been charged twice for my subscription and nobody is helping me fix this billing error!",
  "The app keeps crashing every time I try to upload a file. This is extremely frustrating.",
  "My package was supposed to arrive 5 days ago and I still haven't received it. Where is my order?",
  "I need to reschedule my appointment but the system won't let me change the date.",
  "Your customer service representative was incredibly rude and unhelpful during my call today.",
  "I just wanted to say your team did an amazing job resolving my issue so quickly. Thank you!",
];

/* ----- root cause icon map ----- */
const ROOT_CAUSE_ICONS = {
  'Payment Gateway Issue': '💳',
  'Account Access Issue': '🔐',
  'Delivery Failure': '📦',
  'Technical Bug': '🐛',
  'Booking/Scheduling Issue': '📅',
  'Poor Customer Service': '📞',
};

/* ================================================================== */

export default function Analyze() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async (ticketText) => {
    const input = (ticketText || text).trim();
    if (!input) {
      toast.error('Please enter a ticket to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeTicket(input);
      setResult(data);
      toast.success('Ticket analyzed successfully!');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Unable to reach the analysis engine. Make sure the backend is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleExample = (example) => {
    setText(example);
    handleAnalyze(example);
  };

  const copyReply = () => {
    if (result?.auto_reply) {
      navigator.clipboard.writeText(result.auto_reply);
      toast.success('Auto-reply copied to clipboard!');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Analyze a Ticket
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Paste a customer support message and let AI classify, prioritize, and draft a reply.
          </p>
        </motion.div>

        {/* ── Input area ─────────────────────────────────────── */}
        <motion.div
          className="glass-card p-5 sm:p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <textarea
            id="ticket-input"
            className="textarea-glow w-full h-36 sm:h-44 p-4 text-sm sm:text-base resize-none font-normal"
            placeholder="Enter customer support ticket text here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
            <p className="text-xs text-gray-600">
              {text.length > 0 && `${text.length} characters`}
            </p>
            <button
              id="analyze-btn"
              onClick={() => handleAnalyze()}
              disabled={loading || !text.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(0,212,255,0.15)'
                  : 'linear-gradient(135deg, #00d4ff 0%, #00b8db 100%)',
                color: loading ? '#00d4ff' : '#0a0f1e',
                boxShadow: loading
                  ? 'none'
                  : '0 0 20px rgba(0,212,255,0.25)',
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner inline text="" />
                  Analyzing…
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  Analyze Ticket
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Example chips ──────────────────────────────────── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                disabled={loading}
                className="text-left text-xs px-3 py-2 rounded-lg transition-all duration-200 max-w-xs truncate disabled:opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                {ex.slice(0, 60)}…
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Error state ────────────────────────────────────── */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              className="glass-card p-5 mb-6 flex items-start gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <HiOutlineExclamation className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-medium">Analysis Failed</p>
                <p className="text-red-400/70 text-xs mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading state ──────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner text="Analyzing ticket with AI models…" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ────────────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Response time pill */}
              <motion.div
                className="flex items-center justify-center gap-2 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <HiOutlineLightningBolt className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-gray-500">
                  Processed in{' '}
                  <span className="text-cyan-400 font-semibold">
                    {result.response_time_ms}ms
                  </span>
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <ResultCard delay={0.1}>
                  <div className="flex items-center gap-3 mb-4">
                    <CategoryIcon category={result.category.label} size={22} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Category
                      </p>
                      <p className="text-lg font-bold text-white">
                        {result.category.label}
                      </p>
                    </div>
                  </div>
                  <ConfidenceBar
                    value={result.category.confidence}
                    label="Confidence"
                    color="#00d4ff"
                  />
                </ResultCard>

                {/* Priority */}
                <ResultCard delay={0.2}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                        Priority
                      </p>
                      <PriorityBadge priority={result.priority.label} />
                    </div>
                    <div className="text-right">
                      <HiOutlineSearch className="w-5 h-5 text-gray-600 ml-auto mb-1" />
                    </div>
                  </div>
                  <ConfidenceBar
                    value={result.priority.confidence}
                    label="Confidence"
                    color={
                      result.priority.label === 'Urgent'
                        ? '#ef4444'
                        : result.priority.label === 'High'
                        ? '#f97316'
                        : result.priority.label === 'Medium'
                        ? '#eab308'
                        : '#22c55e'
                    }
                  />
                </ResultCard>

                {/* Root Cause */}
                <ResultCard delay={0.3}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">
                      {ROOT_CAUSE_ICONS[result.root_cause.label] || '🔍'}
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Root Cause
                      </p>
                      <p className="text-base font-bold text-white">
                        {result.root_cause.label}
                      </p>
                    </div>
                  </div>
                  <ConfidenceBar
                    value={result.root_cause.confidence}
                    label="Confidence"
                    color="#a78bfa"
                  />
                </ResultCard>

                {/* Auto Reply */}
                <ResultCard delay={0.4}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Auto Reply
                    </p>
                    <button
                      onClick={copyReply}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {result.auto_reply}
                  </p>
                </ResultCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
