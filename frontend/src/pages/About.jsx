import React from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineDatabase,
  HiOutlineCube,
  HiOutlineChip,
  HiOutlineCode,
  HiOutlineColorSwatch,
} from 'react-icons/hi';

import PageTransition from '../components/PageTransition';
import ConfidenceBar from '../components/ConfidenceBar';

/* ----- model metrics ----- */
const MODELS = [
  {
    name: 'Category Classification',
    model: 'DistilBERT (fine-tuned)',
    metric: 'Accuracy',
    value: 91.75,
    color: '#00d4ff',
    description: 'Classifies support tickets into 6 categories: Billing, Technical, Delivery, Booking, Complaint, and Positive.',
  },
  {
    name: 'Priority Detection',
    model: 'TF-IDF + Logistic Regression',
    metric: 'Accuracy',
    value: 95.99,
    color: '#00ff88',
    description: 'Detects ticket urgency level: Urgent, High, Medium, or Low priority.',
  },
  {
    name: 'Root Cause Detection',
    model: 'TF-IDF + Logistic Regression',
    metric: 'Accuracy',
    value: 97.83,
    color: '#a78bfa',
    description: 'Identifies the underlying root cause from 6 possible categories.',
  },
  {
    name: 'Auto Reply Generation',
    model: 'Rule-based Template Engine',
    metric: 'ROUGE-1',
    value: 61.63,
    color: '#f97316',
    description: 'Generates professional, context-aware replies based on category and priority.',
  },
];

const OVERALL = [
  { label: 'Overall Accuracy', value: 95.19, color: '#00d4ff' },
  { label: 'F1 Score', value: 95.22, color: '#00ff88' },
  { label: 'BLEU Score', value: 27.26, color: '#a78bfa' },
];

/* ----- tech stack ----- */
const TECH = [
  {
    icon: HiOutlineChip,
    name: 'DistilBERT',
    desc: 'Transformer model for sequence classification',
    color: '#00d4ff',
  },
  {
    icon: HiOutlineDatabase,
    name: 'TF-IDF',
    desc: 'Feature extraction for traditional ML models',
    color: '#00ff88',
  },
  {
    icon: HiOutlineCube,
    name: 'Flask',
    desc: 'Lightweight Python web framework for API',
    color: '#f97316',
  },
  {
    icon: HiOutlineCode,
    name: 'React',
    desc: 'Modern frontend library with component architecture',
    color: '#60a5fa',
  },
  {
    icon: HiOutlineColorSwatch,
    name: 'Tailwind CSS',
    desc: 'Utility-first CSS framework for rapid UI',
    color: '#38bdf8',
  },
  {
    icon: HiOutlineAcademicCap,
    name: 'Scikit-learn',
    desc: 'Logistic Regression for classification tasks',
    color: '#a78bfa',
  },
];

/* ----- animation ----- */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ================================================================== */

export default function About() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            About SmartDesk
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            An AI-powered customer support ticket routing system that automatically
            classifies, prioritizes, identifies root causes, and drafts professional
            replies — all in under 2 seconds.
          </p>
        </motion.div>

        {/* ── Project overview ───────────────────────────────── */}
        <motion.div
          className="glass-card p-6 sm:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
            Project Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-400 leading-relaxed">
            <div>
              <p className="mb-4">
                SmartDesk was developed to demonstrate
                the practical application of modern natural language processing
                techniques in customer support automation.
              </p>
              <p>
                The system combines transformer-based deep learning (DistilBERT) with
                traditional machine learning (TF-IDF + Logistic Regression) to create
                a multi-model pipeline that handles the complete ticket routing workflow.
              </p>
            </div>
            <div>
              <p className="mb-4">
                <span className="text-white font-medium">Dataset:</span>{' '}
                Trained on 30,000 real customer support tweets from the Twitter
                US Airline Sentiment dataset, covering a wide range of customer
                complaints and feedback.
              </p>
              <p>
                <span className="text-white font-medium">Pipeline:</span>{' '}
                Each incoming ticket goes through 4 stages — category classification,
                priority detection, root cause analysis, and auto-reply generation —
                delivering comprehensive results in real time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Model performance ──────────────────────────────── */}
        <motion.div
          className="mb-8"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
            Model Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODELS.map((m) => (
              <motion.div
                key={m.name}
                className="glass-card-hover p-5"
                variants={fadeUp}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-sm">{m.name}</h3>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: m.color }}
                  >
                    {m.value}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{m.model}</p>
                <ConfidenceBar
                  value={m.value}
                  color={m.color}
                  label={m.metric}
                  showPercent={false}
                />
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Overall metrics ────────────────────────────────── */}
        <motion.div
          className="glass-card p-6 sm:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
            Overall System Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {OVERALL.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {m.label}
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: m.color }}
                  >
                    {m.value}%
                  </span>
                </div>
                <ConfidenceBar
                  value={m.value}
                  color={m.color}
                  showPercent={false}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tech stack ─────────────────────────────────────── */}
        <motion.div
          className="mb-8"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
            Tech Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH.map(({ icon: Icon, name, desc, color }) => (
              <motion.div
                key={name}
                className="glass-card-hover p-5 flex items-start gap-4"
                variants={fadeUp}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${color}12`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Dataset info ───────────────────────────────────── */}
        <motion.div
          className="glass-card p-6 sm:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">
            Dataset Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Samples', value: '30,000', color: '#00d4ff' },
              { label: 'Source', value: 'Twitter US', color: '#00ff88' },
              { label: 'Categories', value: '6', color: '#a78bfa' },
              { label: 'Split', value: '80/20', color: '#f97316' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p
                  className="text-2xl sm:text-3xl font-bold mb-1"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gray-600">
            Built with ❤️ •{' '}
            <span className="text-gray-500">SmartDesk © {new Date().getFullYear()}</span>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
